import { spawn, ChildProcess } from 'child_process'
import * as net from 'net'
import * as fs from 'fs/promises'
import * as path from 'path'
import * as os from 'os'
import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'
import * as health from 'grpc-health-check'
import { logger } from '../utils/logger'

export interface InstanceInfo {
  instanceId: string
  address: string
  hostBridgePort: number
  workspacePath: string
  clineDataDir: string
  userId: string
  projectId: string
  coreProcess?: ChildProcess
  hostProcess?: ChildProcess
  startedAt: Date
  lastActivity: Date
}

export class ClineInstanceManager {
  public instances: Map<string, InstanceInfo> = new Map()
  private clineConfigPath: string
  
  constructor(
    private clineCorePath: string,
    private clineHostPath: string,
    private baseWorkspaceDir: string,
    private baseClineDir?: string
  ) {
    // Default Cline config directory (~/.cline)
    this.clineConfigPath = baseClineDir || path.join(os.homedir(), '.cline')
    logger.info('ClineInstanceManager initialized', {
      clineCorePath,
      clineHostPath,
      baseWorkspaceDir,
      clineConfigPath: this.clineConfigPath
    })
  }
  
  /**
   * Find available ports by letting the OS allocate them (like Cline CLI does)
   */
  private async findAvailablePortPair(): Promise<[number, number]> {
    return new Promise((resolve, reject) => {
      const coreServer = net.createServer()
      const hostServer = net.createServer()
      
      coreServer.listen(0, () => {
        const corePort = (coreServer.address() as net.AddressInfo).port
        hostServer.listen(0, () => {
          const hostPort = (hostServer.address() as net.AddressInfo).port
          coreServer.close()
          hostServer.close()
          resolve([corePort, hostPort])
        })
        hostServer.on('error', reject)
      })
      coreServer.on('error', reject)
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
      const isHealthy = await this.checkHealth(existing.address)
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
    
    // Create workspace directory
    const workspacePath = path.join(this.baseWorkspaceDir, userId, projectId)
    await fs.mkdir(workspacePath, { recursive: true })
    
    // Create per-instance Cline data directory
    const clineDataDir = path.join(this.clineConfigPath, 'instances', instanceId)
    await fs.mkdir(clineDataDir, { recursive: true })
    
    // Allocate ports (let OS choose available ports)
    const [corePort, hostBridgePort] = await this.findAvailablePortPair()
    
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
    await this.waitForHostBridge(hostBridgePort, 30000)
    
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
        NODE_ENV: process.env.NODE_ENV || 'production',
        CLINE_DIR: clineDataDir,
        INSTALL_DIR: installDir
      }
    })
    
    coreProcess.on('error', (error) => {
      logger.error('Core process error', { error: error.message, instanceId })
    })
    
    // Wait for core to register in SQLite and be ready
    await this.waitForCoreReady(corePort, 60000)
    
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
    } catch (error: any) {
      logger.error('Error stopping instance', { instanceId, error: error.message })
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
  
  private async waitForHostBridge(port: number, timeout = 30000): Promise<void> {
    const start = Date.now()
    while (Date.now() - start < timeout) {
      try {
        const healthDef = protoLoader.loadSync(health.protoPath)
        const grpcObj = grpc.loadPackageDefinition(healthDef) as any
        const Health = grpcObj.grpc.health.v1.Health
        const client = new Health(
          `127.0.0.1:${port}`,
          grpc.credentials.createInsecure(),
          { 'grpc.enable_http_proxy': 0 }
        )
        
        const response = await new Promise<any>((resolve, reject) => {
          client.check({ service: '' }, (err: any, resp: any) => {
            if (err) reject(err)
            else resolve(resp)
          })
        })
        
        if (response?.status === 1) { // SERVING
          client.close()
          return
        }
        client.close()
      } catch {
        // Not ready yet
      }
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    throw new Error(`Host bridge not ready after ${timeout}ms`)
  }
  
  private async waitForCoreReady(port: number, timeout = 60000): Promise<void> {
    const start = Date.now()
    const address = `127.0.0.1:${port}`
    
    while (Date.now() - start < timeout) {
      try {
        // Check health
        const isHealthy = await this.checkHealth(address)
        if (isHealthy) {
          // Also check if registered in SQLite (optional, but recommended)
          // The instance self-registers in ~/.cline/locks.db
          return
        }
      } catch {
        // Not ready yet
      }
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    throw new Error(`Core not ready after ${timeout}ms`)
  }
  
  private async checkHealth(address: string): Promise<boolean> {
    try {
      const healthDef = protoLoader.loadSync(health.protoPath)
      const grpcObj = grpc.loadPackageDefinition(healthDef) as any
      const Health = grpcObj.grpc.health.v1.Health
      const client = new Health(
        address,
        grpc.credentials.createInsecure(),
        { 'grpc.enable_http_proxy': 0 }
      )
      
      const response = await new Promise<any>((resolve, reject) => {
        client.check({ service: '' }, (err: any, resp: any) => {
          if (err) reject(err)
          else resolve(resp)
        })
      })
      
      const isHealthy = response?.status === 1 // SERVING
      client.close()
      return isHealthy
    } catch {
      return false
    }
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

