import * as net from 'net'
import { logger } from '../utils/logger'

/**
 * Service for managing port allocation.
 * Uses OS-allocated ports (port 0) to avoid conflicts, following Cline CLI patterns.
 */
export class PortManager {
  /**
   * Find a pair of available ports by letting the OS allocate them.
   * This is the recommended approach as it avoids port conflicts.
   * @returns A tuple of [corePort, hostBridgePort]
   */
  async findAvailablePortPair(): Promise<[number, number]> {
    return new Promise((resolve, reject) => {
      const coreServer = net.createServer()
      const hostServer = net.createServer()
      
      coreServer.listen(0, () => {
        const corePort = (coreServer.address() as net.AddressInfo).port
        
        hostServer.listen(0, () => {
          const hostPort = (hostServer.address() as net.AddressInfo).port
          
          coreServer.close()
          hostServer.close()
          
          logger.debug('Port pair allocated', { corePort, hostBridgePort: hostPort })
          resolve([corePort, hostPort])
        })
        
        hostServer.on('error', (error) => {
          coreServer.close()
          reject(error)
        })
      })
      
      coreServer.on('error', reject)
    })
  }

  /**
   * Find a single available port.
   * @returns The allocated port number
   */
  async findAvailablePort(): Promise<number> {
    return new Promise((resolve, reject) => {
      const server = net.createServer()
      
      server.listen(0, () => {
        const port = (server.address() as net.AddressInfo).port
        server.close()
        logger.debug('Port allocated', { port })
        resolve(port)
      })
      
      server.on('error', reject)
    })
  }

  /**
   * Check if a port is available.
   * @param port - The port number to check
   * @returns true if the port is available, false otherwise
   */
  async isPortAvailable(port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const server = net.createServer()
      
      server.listen(port, () => {
        server.close(() => {
          resolve(true)
        })
      })
      
      server.on('error', () => {
        resolve(false)
      })
    })
  }
}

// Singleton instance
export const portManager = new PortManager()

