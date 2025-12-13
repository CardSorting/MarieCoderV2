export interface WSMessage {
  type: string
  [key: string]: unknown
}

export class WebSocketClient {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private listeners: Map<string, Set<(data: unknown) => void>> = new Map()
  private projectId: string | null = null
  private userId: string | null = null

  constructor() {
    // Get userId from token if available (only in browser)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token')
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]))
          this.userId = payload.userId
        } catch {
          // Invalid token, ignore
        }
      }
    }
  }

  /**
   * Connect to WebSocket server
   */
  connect(projectId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Skip WebSocket connection on server
      if (typeof window === 'undefined') {
        resolve()
        return
      }

      if (this.ws?.readyState === WebSocket.OPEN && this.projectId === projectId) {
        resolve()
        return
      }

      this.projectId = projectId
      const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000'}/ws?userId=${this.userId}&projectId=${projectId}`

      try {
        this.ws = new WebSocket(wsUrl)

        this.ws.onopen = () => {
          this.reconnectAttempts = 0
          console.log('WebSocket connected', { projectId })
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const message: WSMessage = JSON.parse(event.data)
            this.handleMessage(message)
          } catch (error) {
            console.error('Failed to parse WebSocket message', error)
          }
        }

        this.ws.onerror = (error) => {
          console.error('WebSocket error', error)
          reject(error)
        }

        this.ws.onclose = () => {
          console.log('WebSocket disconnected', { projectId })
          this.ws = null
          this.attemptReconnect(projectId)
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Attempt to reconnect
   */
  private attemptReconnect(projectId: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * 2 ** (this.reconnectAttempts - 1)

    setTimeout(() => {
      console.log('Attempting to reconnect WebSocket', {
        attempt: this.reconnectAttempts,
        projectId,
      })
      this.connect(projectId).catch(() => {
        // Reconnection failed, will try again
      })
    }, delay)
  }

  /**
   * Handle incoming message
   */
  private handleMessage(message: WSMessage): void {
    const listeners = this.listeners.get(message.type)
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(message)
        } catch (error) {
          console.error('Error in WebSocket message listener', error)
        }
      })
    }

    // Also emit to 'message' listeners for all messages
    const allListeners = this.listeners.get('message')
    if (allListeners) {
      allListeners.forEach((listener) => {
        try {
          listener(message)
        } catch (error) {
          console.error('Error in WebSocket message listener', error)
        }
      })
    }
  }

  /**
   * Send message to server
   */
  send(message: WSMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket is not connected')
    }
  }

  /**
   * Subscribe to message type
   */
  on(messageType: string, callback: (data: unknown) => void): () => void {
    if (!this.listeners.has(messageType)) {
      this.listeners.set(messageType, new Set())
    }
    this.listeners.get(messageType)!.add(callback)

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(messageType)
      if (listeners) {
        listeners.delete(callback)
        if (listeners.size === 0) {
          this.listeners.delete(messageType)
        }
      }
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.projectId = null
    this.listeners.clear()
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }
}

// Singleton instance
export const wsClient = new WebSocketClient()
