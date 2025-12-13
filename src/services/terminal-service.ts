import { spawn, ChildProcess } from 'child_process'
import { EventEmitter } from 'events'
import { instanceManager } from '../index'
import { logger } from '../utils/logger'
import { InstanceNotFoundError } from '../errors/instance-error'

export interface TerminalSession {
  id: string
  projectId: string
  userId: string
  process: ChildProcess
  output: string[]
  createdAt: Date
}

export interface TerminalOutput {
  type: 'stdout' | 'stderr'
  data: string
  timestamp: number
}

class TerminalService extends EventEmitter {
  private sessions: Map<string, TerminalSession> = new Map()

  /**
   * Create a new terminal session
   */
  createSession(userId: string, projectId: string): TerminalSession {
    const instanceId = `${userId}-${projectId}`
    const instance = instanceManager.getInstance(instanceId)
    
    if (!instance) {
      throw new InstanceNotFoundError(instanceId)
    }

    const sessionId = `${userId}-${projectId}-${Date.now()}`
    const workspacePath = instance.workspacePath

    // Determine shell based on platform
    const shellPath = process.platform === 'win32' ? 'cmd.exe' : process.env.SHELL || '/bin/bash'

    // Create a shell process
    const childProcess = spawn(shellPath, [], {
      cwd: workspacePath,
      env: {
        ...process.env,
        TERM: 'xterm-256color',
        PAGER: 'cat',
        EDITOR: process.env.EDITOR || 'cat',
        GIT_PAGER: 'cat',
        SYSTEMD_PAGER: '',
        MANPAGER: 'cat'
      },
      stdio: ['pipe', 'pipe', 'pipe']
    })

    const session: TerminalSession = {
      id: sessionId,
      projectId,
      userId,
      process: childProcess,
      output: [],
      createdAt: new Date()
    }

    // Handle stdout
    childProcess.stdout?.on('data', (data: Buffer) => {
      const output = data.toString()
      session.output.push(output)
      this.emit('output', {
        sessionId,
        type: 'stdout' as const,
        data: output,
        timestamp: Date.now()
      })
    })

    // Handle stderr
    childProcess.stderr?.on('data', (data: Buffer) => {
      const output = data.toString()
      session.output.push(output)
      this.emit('output', {
        sessionId,
        type: 'stderr' as const,
        data: output,
        timestamp: Date.now()
      })
    })

    // Handle process exit
    childProcess.on('exit', (code: number | null) => {
      logger.debug('Terminal session exited', { sessionId, code })
      this.emit('exit', { sessionId, code })
    })

    // Handle process error
    childProcess.on('error', (error: Error) => {
      logger.error('Terminal process error', { sessionId, error: error.message })
      this.emit('error', { sessionId, error: error.message })
    })

    this.sessions.set(sessionId, session)
    logger.debug('Terminal session created', { sessionId, userId, projectId })

    return session
  }

  /**
   * Execute a command in a terminal session
   */
  executeCommand(sessionId: string, command: string): void {
    const session = this.sessions.get(sessionId)
    
    if (!session) {
      throw new Error(`Terminal session not found: ${sessionId}`)
    }

    if (!session.process.stdin) {
      throw new Error('Terminal session stdin is not available')
    }

    // Write command to stdin (add newline to execute)
    session.process.stdin.write(command + '\n')
    logger.debug('Command executed', { sessionId, command })
  }

  /**
   * Get terminal session
   */
  getSession(sessionId: string): TerminalSession | undefined {
    return this.sessions.get(sessionId)
  }

  /**
   * Close a terminal session
   */
  closeSession(sessionId: string): void {
    const session = this.sessions.get(sessionId)
    
    if (!session) {
      return
    }

    // Kill the process
    if (!session.process.killed) {
      session.process.kill('SIGTERM')
      
      // Force kill after 2 seconds if still running
      setTimeout(() => {
        if (!session.process.killed) {
          session.process.kill('SIGKILL')
        }
      }, 2000)
    }

    this.sessions.delete(sessionId)
    logger.debug('Terminal session closed', { sessionId })
  }

  /**
   * Get all sessions for a project
   */
  getSessionsByProject(userId: string, projectId: string): TerminalSession[] {
    return Array.from(this.sessions.values()).filter(
      session => session.userId === userId && session.projectId === projectId
    )
  }

  /**
   * Close all sessions for a project
   */
  closeProjectSessions(userId: string, projectId: string): void {
    const sessions = this.getSessionsByProject(userId, projectId)
    sessions.forEach(session => this.closeSession(session.id))
  }
}

// Singleton instance
export const terminalService = new TerminalService()

