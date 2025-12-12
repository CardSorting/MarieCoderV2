import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'
import * as health from 'grpc-health-check'
import { logger } from '../utils/logger'
import { InstanceNotReadyError } from '../errors/instance-error'

/**
 * Service for checking gRPC health status of Cline instances.
 * Consolidates health check logic used across the codebase.
 */
export class HealthCheckService {
  /**
   * Check if a gRPC service is healthy at the given address.
   * @param address - The gRPC server address (e.g., "127.0.0.1:26040")
   * @returns true if the service is healthy (SERVING), false otherwise
   */
  async checkHealth(address: string): Promise<boolean> {
    try {
      const healthDef = protoLoader.loadSync(health.protoPath)
      const grpcObj = grpc.loadPackageDefinition(healthDef) as unknown as {
        grpc: {
          health: {
            v1: {
              Health: grpc.ServiceClientConstructor
            }
          }
        }
      }
      
      const Health = grpcObj.grpc.health.v1.Health
      const client = new Health(
        address,
        grpc.credentials.createInsecure(),
        { 'grpc.enable_http_proxy': 0 }
      )
      
      const response = await new Promise<{ status?: number }>((resolve, reject) => {
        client.check({ service: '' }, (err: grpc.ServiceError | null, resp: { status?: number }) => {
          if (err) reject(err)
          else resolve(resp)
        })
      })
      
      const isHealthy = response?.status === 1 // SERVING
      client.close()
      return isHealthy
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.debug('Health check failed', { address, error: errorMessage })
      return false
    }
  }

  /**
   * Wait for a gRPC service to become ready.
   * @param address - The gRPC server address
   * @param timeout - Maximum time to wait in milliseconds
   * @param interval - Polling interval in milliseconds
   * @throws InstanceNotReadyError if the service doesn't become ready within the timeout
   */
  async waitForReady(
    address: string,
    timeout: number = 60000,
    interval: number = 1000
  ): Promise<void> {
    const start = Date.now()
    
    while (Date.now() - start < timeout) {
      const isHealthy = await this.checkHealth(address)
      if (isHealthy) {
        logger.debug('Service is ready', { address, elapsed: Date.now() - start })
        return
      }
      
      await new Promise(resolve => setTimeout(resolve, interval))
    }
    
    throw new InstanceNotReadyError(
      address,
      `Service not ready after ${timeout}ms at ${address}`
    )
  }

  /**
   * Wait for host bridge to be ready.
   * @param port - The host bridge port
   * @param timeout - Maximum time to wait in milliseconds
   */
  async waitForHostBridge(port: number, timeout: number = 30000): Promise<void> {
    const address = `127.0.0.1:${port}`
    await this.waitForReady(address, timeout, 500)
  }

  /**
   * Wait for core service to be ready.
   * @param port - The core service port
   * @param timeout - Maximum time to wait in milliseconds
   */
  async waitForCoreReady(port: number, timeout: number = 60000): Promise<void> {
    const address = `127.0.0.1:${port}`
    await this.waitForReady(address, timeout, 1000)
  }
}

// Singleton instance
export const healthCheckService = new HealthCheckService()

