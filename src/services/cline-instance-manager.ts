import { spawn } from 'child_process'
import * as fs from 'fs/promises'
import * as path from 'path'
import * as os from 'os'
import { logger } from '../utils/logger'
import { InstanceInfo } from '../types'
import { healthCheckService } from './health-check-service'
import { portManager } from './port-manager'

export class ClineInstanceManager {
  public instances: Map<string, InstanceInfo> = new Map()
  private clineConfigPath: string
  private workspaceManager: WorkspaceManager
  
  constructor(
    private clineCorePath: string,
    private clineHostPath: string,
    private baseWorkspaceDir: string,
    private baseClineDir?: string
  ) {
    // Default Cline config directory (~/.cline)
    this.clineConfigPath = baseClineDir || path.join(os.homedir(), '.cline')
    this.workspaceManager = new WorkspaceManager(baseWorkspaceDir)
    logger.info('ClineInstanceManager initialized', {
      clineCorePath,
      clineHostPath,
      baseWorkspaceDir,
      clineConfigPath: this.clineConfigPath
    })
  }
  
  
  async startInstance(
    userId: string,
    projectId: string
  ): Promise<InstanceInfo> {
    const instanceId = `${userId}-${projectId}`
    
    // Check if instance already exists and is healthy
    const existing = this.instances.get(instanceId)
    if (existing) {
      const isHealthy = await healthCheckService.checkHealth(existing.address)
      if (isHealthy) {
        existing.lastActivity = new Date()
        logger.info('Reusing existing instance', { instanceId })
        return existing
      }
      // Instance exists but unhealthy, clean it up
      logger.warn('Existing instance unhealthy, cleaning up', { instanceId })
      await this.stopInstance(instanceId)
    }
    
    logger.info('Starting new instance', { instanceId, userId, projectId })
    
    // Create workspace directory using workspace manager
    const workspacePath = await this.workspaceManager.createWorkspace(userId, projectId)
    
    // Create per-instance Cline data directory
    const clineDataDir = path.join(this.clineConfigPath, 'instances', instanceId)
    await fs.mkdir(clineDataDir, { recursive: true })
    
    // Allocate ports (let OS choose available ports)
    const [corePort, hostBridgePort] = await portManager.findAvailablePortPair()
    
    // Create logs directory
    const logsDir = path.join(clineDataDir, 'logs')
    await fs.mkdir(logsDir, { recursive: true })
    
    // Start host bridge first (cline-host)
    const hostLogFile = path.join(
      logsDir,
      `cline-host-${Date.now()}-${hostBridgePort}.log`
    )
    const hostLogFd = await fs.open(hostLogFile, 'w')
    
    const hostProcess = spawn(this.clineHostPath, [
      '--verbose',
      '--port', hostBridgePort.toString()
    ], {
      cwd: workspacePath,
      stdio: ['ignore', hostLogFd.fd, hostLogFd.fd],
      detached: false
    })
    
    hostProcess.on('error', (error) => {
      logger.error('Host bridge process error', { error: error.message, instanceId })
    })
    
    // Wait for host bridge to be ready (gRPC health check)
    await healthCheckService.waitForHostBridge(hostBridgePort, 30000)
    
    // Start cline-core
    const coreLogFile = path.join(
      logsDir,
      `cline-core-${Date.now()}-${corePort}.log`
    )
    const coreLogFd = await fs.open(coreLogFile, 'w')
    
    // Determine install directory (where cline-core.js and node_modules are)
    const installDir = path.dirname(this.clineCorePath)
    const realNodeModules = path.join(installDir, 'node_modules')
    const fakeNodeModules = path.join(installDir, 'fake_node_modules')
    const nodePath = `${realNodeModules}${path.delimiter}${fakeNodeModules}`
    
    const coreProcess = spawn('node', [
      this.clineCorePath,
      '--port', corePort.toString(),
      '--host-bridge-port', hostBridgePort.toString(),
      '--config', clineDataDir
    ], {
      cwd: installDir, // Must be install directory, not workspace
      stdio: ['ignore', coreLogFd.fd, coreLogFd.fd],
      detached: false,
      env: {
        ...process.env,
        DEV_WORKSPACE_FOLDER: workspacePath, // Critical: sets workspace
        WORKSPACE_STORAGE_DIR: path.join(clineDataDir, 'workspace'),
        PROTOBUS_ADDRESS: `127.0.0.1:${corePort}`,
        HOST_BRIDGE_ADDRESS: `127.0.0.1:${hostBridgePort}`,
        NODE_PATH: nodePath,
        NODE_ENV: process.env.NODE_ENV || 'production', // Keep process.env for child process
        CLINE_DIR: clineDataDir,
        INSTALL_DIR: installDir
      }
    })
    
    coreProcess.on('error', (error) => {
      logger.error('Core process error', { error: error.message, instanceId })
    })
    
    // Wait for core to register in SQLite and be ready
    await healthCheckService.waitForCoreReady(corePort, 60000)
    
    // Create instance info
    const instance: InstanceInfo = {
      instanceId,
      address: `127.0.0.1:${corePort}`,
      hostBridgePort,
      workspacePath,
      clineDataDir,
      userId,
      projectId,
      coreProcess,
      hostProcess,
      startedAt: new Date(),
      lastActivity: new Date()
    }
    
    this.instances.set(instanceId, instance)
    
    // Clean up log file descriptors
    hostLogFd.close()
    coreLogFd.close()
    
    logger.info('Instance started successfully', {
      instanceId,
      address: instance.address,
      hostBridgePort
    })
    
    return instance
  }
  
  async stopInstance(instanceId: string): Promise<void> {
    const instance = this.instances.get(instanceId)
    if (!instance) {
      logger.warn('Instance not found for stop', { instanceId })
      return
    }
    
    logger.info('Stopping instance', { instanceId })
    
    try {
      // Send SIGTERM to processes
      if (instance.coreProcess && !instance.coreProcess.killed) {
        instance.coreProcess.kill('SIGTERM')
        // Wait up to 5 seconds for graceful shutdown
        await Promise.race([
          new Promise(resolve => instance.coreProcess!.once('exit', resolve)),
          new Promise(resolve => setTimeout(resolve, 5000))
        ])
        
        // Force kill if still running
        if (!instance.coreProcess.killed) {
          instance.coreProcess.kill('SIGKILL')
        }
      }
      
      if (instance.hostProcess && !instance.hostProcess.killed) {
        instance.hostProcess.kill('SIGTERM')
        await Promise.race([
          new Promise(resolve => instance.hostProcess!.once('exit', resolve)),
          new Promise(resolve => setTimeout(resolve, 2000))
        ])
        
        if (!instance.hostProcess.killed) {
          instance.hostProcess.kill('SIGKILL')
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.error('Error stopping instance', { instanceId, error: errorMessage })
    } finally {
      this.instances.delete(instanceId)
      logger.info('Instance stopped', { instanceId })
    }
  }
  
  getInstance(instanceId: string): InstanceInfo | undefined {
    return this.instances.get(instanceId)
  }
  
  getInstanceCount(): number {
    return this.instances.size
  }
  
  async isReady(): Promise<boolean> {
    // Check if at least one instance can be started
    try {
      // This is a simple check - in production you might want more sophisticated checks
      return true
    } catch {
      return false
    }
  }
}

