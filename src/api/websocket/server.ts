import { WebSocketServer, WebSocket } from 'ws'
import { Server } from 'http'
import { logger } from '../../utils/logger'
import { instanceManager } from '../../index'
import { clientFactory } from '../../services/cline-client-factory'
import { terminalService } from '../../services/terminal-service'

export interface WSMessage {
  type: string
  [key: string]: unknown
}

export interface WSClient {
  ws: WebSocket
  userId: string
  projectId: string
  sessionId?: string
}

class WebSocketServerManager {
  private wss: WebSocketServer | null = null
  private clients: Map<WebSocket, WSClient> = new Map()

  /**
   * Initialize WebSocket server
   */
  initialize(server: Server): void {
    this.wss = new WebSocketServer({ server, path: '/ws' })

    this.wss.on('connection', (ws: WebSocket, req) => {
      this.handleConnection(ws, req)
    })

    logger.info('WebSocket server initialized')
  }

  /**
   * Handle new WebSocket connection
   */
  private handleConnection(ws: WebSocket, req: { url?: string; headers: Record<string, string | string[] | undefined> }): void {
    // Extract userId and projectId from query string or headers
    const url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`)
    const userIdParam = url.searchParams.get('userId')
    const projectIdParam = url.searchParams.get('projectId')
    const userIdHeader = req.headers['x-user-id']
    const projectIdHeader = req.headers['x-project-id']
    
    const userId = userIdParam || (typeof userIdHeader === 'string' ? userIdHeader : undefined)
    const projectId = projectIdParam || (typeof projectIdHeader === 'string' ? projectIdHeader : undefined)

    if (!userId || !projectId) {
      logger.warn('WebSocket connection rejected: missing userId or projectId')
      ws.close(1008, 'Missing userId or projectId')
      return
    }

    const client: WSClient = {
      ws,
      userId,
      projectId
    }

    this.clients.set(ws, client)
    logger.debug('WebSocket client connected', { userId, projectId })

    // Set up message handler
    ws.on('message', (data: Buffer) => {
      this.handleMessage(client, data)
    })

    // Set up close handler
    ws.on('close', () => {
      this.handleDisconnect(client)
    })

    // Set up error handler
    ws.on('error', (error) => {
      logger.error('WebSocket error', { userId, projectId, error: error.message })
    })

    // Subscribe to Cline state updates
    this.subscribeToClineState(client)
  }

  /**
   * Handle incoming WebSocket message
   */
  private async handleMessage(client: WSClient, data: Buffer): Promise<void> {
    try {
      const message: WSMessage = JSON.parse(data.toString()) as WSMessage

      switch (message.type) {
        case 'terminal-input':
          if (client.sessionId && message.data && typeof message.data === 'string') {
            terminalService.executeCommand(client.sessionId, message.data)
          }
          break

        case 'file-change':
          // File changes are handled by REST API, but we can broadcast them
          this.broadcastToProject(client.projectId, {
            type: 'file-change',
            path: message.path,
            content: message.content
          }, client.ws)
          break

        case 'terminal-create':
          // Create new terminal session
          try {
            const session = terminalService.createSession(client.userId, client.projectId)
            client.sessionId = session.id

            // Subscribe to terminal output
            const outputHandler = (output: { sessionId: string; data: string; type: 'stdout' | 'stderr' }) => {
              if (output.sessionId === session.id) {
                this.sendToClient(client.ws, {
                  type: 'terminal-output',
                  sessionId: session.id,
                  data: output.data,
                  outputType: output.type
                })
              }
            }

            terminalService.on('output', outputHandler)
            client.ws.on('close', () => {
              terminalService.removeListener('output', outputHandler)
            })

            this.sendToClient(client.ws, {
              type: 'terminal-created',
              sessionId: session.id
            })
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error'
            this.sendToClient(client.ws, {
              type: 'error',
              message: `Failed to create terminal: ${errorMessage}`
            })
          }
          break

        default:
          logger.debug('Unknown WebSocket message type', { type: message.type })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.error('Error handling WebSocket message', { error: errorMessage })
      this.sendToClient(client.ws, {
        type: 'error',
        message: 'Invalid message format'
      })
    }
  }

  /**
   * Subscribe to Cline state updates
   */
  private async subscribeToClineState(client: WSClient): Promise<void> {
    try {
      const instanceId = `${client.userId}-${client.projectId}`
      const instance = instanceManager.getInstance(instanceId)

      if (!instance) {
        // Instance might not be created yet, that's okay
        return
      }

      const clineClient = await clientFactory.getClient(instance.address)
      
      // Subscribe to state updates
      const stateStream = clineClient.subscribeToState((state: unknown) => {
        this.sendToClient(client.ws, {
          type: 'task-update',
          state: state
        })
      })

      // Clean up on disconnect
      client.ws.on('close', () => {
        stateStream.cancel()
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.error('Failed to subscribe to Cline state', {
        userId: client.userId,
        projectId: client.projectId,
        error: errorMessage
      })
    }
  }

  /**
   * Handle client disconnect
   */
  private handleDisconnect(client: WSClient): void {
    if (client.sessionId) {
      terminalService.closeSession(client.sessionId)
    }

    this.clients.delete(client.ws)
    logger.debug('WebSocket client disconnected', {
      userId: client.userId,
      projectId: client.projectId
    })
  }

  /**
   * Send message to a specific client
   */
  private sendToClient(ws: WebSocket, message: Record<string, unknown>): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message))
    }
  }

  /**
   * Broadcast message to all clients in a project
   */
  private broadcastToProject(projectId: string, message: Record<string, unknown>, exclude?: WebSocket): void {
    for (const [ws, client] of this.clients.entries()) {
      if (client.projectId === projectId && ws !== exclude && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message))
      }
    }
  }

  /**
   * Close all connections
   */
  close(): void {
    if (this.wss) {
      this.wss.close()
      this.wss = null
    }
    this.clients.clear()
    logger.info('WebSocket server closed')
  }
}

// Singleton instance
export const wsServer = new WebSocketServerManager()

