import express from 'express'
import dotenv from 'dotenv'
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

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Initialize instance manager
export const instanceManager = new ClineInstanceManager(
  process.env.CLINE_CORE_PATH || './dist-standalone/cline-core.js',
  process.env.CLINE_HOST_PATH || './cline-host',
  process.env.WORKSPACE_DIR || './workspaces',
  process.env.CLINE_DIR
)

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
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

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully')
  
  // Stop all instances
  const instances = Array.from((instanceManager as any).instances.keys())
  for (const instanceId of instances) {
    await instanceManager.stopInstance(instanceId)
  }
  
  process.exit(0)
})

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully')
  
  const instances = Array.from((instanceManager as any).instances.keys())
  for (const instanceId of instances) {
    await instanceManager.stopInstance(instanceId)
  }
  
  process.exit(0)
})

// Start server
app.listen(PORT, () => {
  logger.info(`Cline Backend Service running on port ${PORT}`)
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`)
  logger.info(`Workspace directory: ${process.env.WORKSPACE_DIR || './workspaces'}`)
})

