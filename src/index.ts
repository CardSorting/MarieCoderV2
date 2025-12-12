import express from 'express'
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
import { configService } from './config'

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

import { shutdownService } from './services/shutdown-service'
import { clientFactory } from './services/cline-client-factory'

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

// Start server
app.listen(serverConfig.port, () => {
  logger.info(`Cline Backend Service running on port ${serverConfig.port}`)
  logger.info(`Environment: ${serverConfig.nodeEnv}`)
  logger.info(`Workspace directory: ${clineConfig.workspaceDir}`)
})

