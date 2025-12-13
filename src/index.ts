import express from 'express'
import { Server } from 'http'
import { ClineInstanceManager } from './services/cline-instance-manager'
import { logger } from './utils/logger'
import { metrics } from './utils/metrics'
import helmet from 'helmet'
import cors from 'cors'
import compression from 'compression'
import taskRoutes from './api/routes/tasks'
import fileRoutes from './api/routes/files'
import healthRoutes from './api/routes/health'
import { errorHandler } from './api/middleware/error-handler'
import { authenticate } from './api/middleware/auth'
import { apiLimiter } from './api/middleware/rate-limiter'
import { requestContext } from './api/middleware/request-context'
import { configService } from './config'
import { shutdownService } from './services/shutdown-service'
import { clientFactory } from './services/cline-client-factory'

const app = express()
const serverConfig = configService.getServer()
const clineConfig = configService.getCline()
const securityConfig = configService.getSecurity()

// Initialize instance manager
export const instanceManager = new ClineInstanceManager(
  clineConfig.corePath,
  clineConfig.hostPath,
  clineConfig.workspaceDir,
  clineConfig.clineDir
)

// Middleware
app.use(requestContext) // Add request context first
app.use(helmet())
app.use(cors({
  origin: securityConfig.allowedOrigins,
  credentials: true
}))
app.use(compression())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Request logging
app.use((req, res, next) => {
  const start = Date.now()
  res.on('finish', () => {
    const duration = Date.now() - start
    metrics.httpRequestDuration.observe(
      { method: req.method, route: req.route?.path || req.path },
      duration / 1000
    )
    metrics.httpRequestsTotal.inc({
      method: req.method,
      route: req.route?.path || req.path,
      status: res.statusCode
    })
    logger.info('HTTP request', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration
    })
  })
  next()
})

// Public routes
app.use('/health', healthRoutes)
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', metrics.register.contentType)
  res.end(await metrics.register.metrics())
})

// Protected routes
app.use(authenticate)
app.use(apiLimiter)
app.use('/api/v1/projects/:projectId/tasks', taskRoutes)
app.use('/api/v1/projects/:projectId/files', fileRoutes)

// Error handler (must be last)
app.use(errorHandler)


// Register cleanup hooks for graceful shutdown
shutdownService.registerCleanupHook(async () => {
  logger.info('Stopping all instances')
  const instances = Array.from(instanceManager.instances.keys())
  for (const instanceId of instances) {
    await instanceManager.stopInstance(instanceId)
  }
})

shutdownService.registerCleanupHook(async () => {
  logger.info('Disconnecting all clients')
  await clientFactory.removeAllClients()
})

// Store server instance for graceful shutdown
let server: Server | undefined

// Graceful shutdown hook for HTTP server
shutdownService.registerCleanupHook(async () => {
  if (server) {
    logger.info('Closing HTTP server')
    return new Promise<void>((resolve) => {
      server!.close(() => {
        logger.info('HTTP server closed')
        resolve()
      })
      // Force close after 10 seconds
      setTimeout(() => {
        logger.warn('Forcing server close after timeout')
        resolve()
      }, 10000)
    })
  }
})

// Start server - Cloud Run requires binding to 0.0.0.0
const host = process.env.HOST || '0.0.0.0'
server = app.listen(serverConfig.port, host, () => {
  logger.info(`Cline Backend Service running on ${host}:${serverConfig.port}`)
  logger.info(`Environment: ${serverConfig.nodeEnv}`)
  logger.info(`Workspace directory: ${clineConfig.workspaceDir}`)
  
  // Log Cloud Run specific info if PORT is set (Cloud Run always sets this)
  if (process.env.PORT) {
    logger.info('Running on Cloud Run', { port: serverConfig.port })
  }
}) as Server

