import { logger } from '../utils/logger'

type CleanupHook = () => Promise<void> | void

/**
 * Service for managing graceful shutdown of the application.
 * Consolidates SIGTERM/SIGINT handlers and cleanup logic.
 */
export class ShutdownService {
  private cleanupHooks: CleanupHook[] = []
  private isShuttingDown = false
  private shutdownTimeout = 30000 // 30 seconds

  constructor() {
    this.setupSignalHandlers()
  }

  /**
   * Register a cleanup hook to be called during shutdown.
   * Hooks are called in reverse order of registration (LIFO).
   */
  registerCleanupHook(hook: CleanupHook): void {
    this.cleanupHooks.push(hook)
  }

  /**
   * Setup signal handlers for SIGTERM and SIGINT.
   */
  private setupSignalHandlers(): void {
    const shutdown = async (signal: string) => {
      if (this.isShuttingDown) {
        logger.warn('Shutdown already in progress, forcing exit')
        process.exit(1)
        return
      }

      this.isShuttingDown = true
      logger.info(`${signal} received, shutting down gracefully`)

      try {
        await this.executeCleanup()
        logger.info('Graceful shutdown completed')
        process.exit(0)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        logger.error('Error during shutdown', { error: errorMessage })
        process.exit(1)
      }
    }

    process.on('SIGTERM', () => shutdown('SIGTERM'))
    process.on('SIGINT', () => shutdown('SIGINT'))

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception', { error: error.message, stack: error.stack })
      this.shutdown()
    })

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled promise rejection', { reason, promise })
      this.shutdown()
    })
  }

  /**
   * Execute all registered cleanup hooks.
   */
  private async executeCleanup(): Promise<void> {
    // Execute hooks in reverse order (LIFO)
    const hooks = [...this.cleanupHooks].reverse()
    
    // Set timeout for cleanup
    const timeoutPromise = new Promise<void>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Cleanup timeout after ${this.shutdownTimeout}ms`))
      }, this.shutdownTimeout)
    })

    const cleanupPromise = (async () => {
      for (const hook of hooks) {
        try {
          await hook()
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          logger.warn('Cleanup hook failed', { error: errorMessage })
        }
      }
    })()

    await Promise.race([cleanupPromise, timeoutPromise])
  }

  /**
   * Manually trigger shutdown (useful for testing).
   */
  async shutdown(): Promise<void> {
    if (this.isShuttingDown) {
      return
    }

    this.isShuttingDown = true
    logger.info('Manual shutdown triggered')

    try {
      await this.executeCleanup()
      logger.info('Shutdown completed')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.error('Error during shutdown', { error: errorMessage })
      throw error
    }
  }

  /**
   * Check if shutdown is in progress.
   */
  isShuttingDownNow(): boolean {
    return this.isShuttingDown
  }
}

// Singleton instance
export const shutdownService = new ShutdownService()

