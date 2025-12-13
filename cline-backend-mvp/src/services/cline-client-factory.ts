import { ClineClient } from './cline-client'
import { logger } from '../utils/logger'
import { ClientConnectionError } from '../errors/client-error'

/**
 * Factory for creating and managing ClineClient instances with connection pooling.
 * Reuses clients for the same instance address to avoid unnecessary connections.
 */
export class ClineClientFactory {
  private clientPool: Map<string, ClineClient> = new Map()
  private connectionPromises: Map<string, Promise<ClineClient>> = new Map()

  /**
   * Get or create a client for the given instance address.
   * If a client already exists for this address, it will be reused.
   */
  async getClient(address: string): Promise<ClineClient> {
    // Check if client already exists and is connected
    const existingClient = this.clientPool.get(address)
    if (existingClient) {
      return existingClient
    }

    // Check if there's already a connection in progress
    const existingPromise = this.connectionPromises.get(address)
    if (existingPromise) {
      return existingPromise
    }

    // Create new client and connection promise
    const connectionPromise = this.createClient(address)
    this.connectionPromises.set(address, connectionPromise)

    try {
      const client = await connectionPromise
      this.clientPool.set(address, client)
      return client
    } catch (error) {
      // Remove failed connection promise
      this.connectionPromises.delete(address)
      throw error
    } finally {
      // Clean up connection promise after completion
      this.connectionPromises.delete(address)
    }
  }

  private async createClient(address: string): Promise<ClineClient> {
    const client = new ClineClient(address)
    
    try {
      await client.connect()
      logger.debug('Client created and connected', { address })
      return client
    } catch (error) {
      logger.error('Failed to create client', { address, error })
      throw error instanceof ClientConnectionError 
        ? error 
        : new ClientConnectionError(address, `Failed to create client: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Remove a client from the pool and disconnect it.
   */
  async removeClient(address: string): Promise<void> {
    const client = this.clientPool.get(address)
    if (client) {
      try {
        client.disconnect()
        logger.debug('Client disconnected and removed from pool', { address })
      } catch (error) {
        logger.warn('Error disconnecting client', { address, error })
      }
      this.clientPool.delete(address)
    }
    this.connectionPromises.delete(address)
  }

  /**
   * Remove all clients from the pool and disconnect them.
   */
  async removeAllClients(): Promise<void> {
    const addresses = Array.from(this.clientPool.keys())
    await Promise.all(addresses.map(addr => this.removeClient(addr)))
  }

  /**
   * Get the number of active clients in the pool.
   */
  getPoolSize(): number {
    return this.clientPool.size
  }

  /**
   * Check if a client exists for the given address.
   */
  hasClient(address: string): boolean {
    return this.clientPool.has(address)
  }
}

// Singleton instance
export const clientFactory = new ClineClientFactory()

