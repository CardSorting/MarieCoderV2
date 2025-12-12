import { Router } from 'express'
import { instanceManager } from '../../index'
import { ClineClient } from '../../services/cline-client'
import { configureProvider } from '../../services/provider-config'
import { taskLimiter } from '../middleware/rate-limiter'
import { logger } from '../../utils/logger'
import { metrics } from '../../utils/metrics'
import { AuthRequest } from '../middleware/auth'

const router = Router()

// Create task
router.post(
  '/',
  taskLimiter,
  async (req: AuthRequest, res) => {
    const startTime = Date.now()
    const { projectId } = req.params
    const userId = req.userId!
    const { prompt, files = [], provider = 'CLINE' } = req.body

    // Validation
    if (!prompt || typeof prompt !== 'string' || prompt.length === 0) {
      return res.status(400).json({ error: 'Prompt is required' })
    }
    
    if (prompt.length > 10000) {
      return res.status(400).json({ error: 'Prompt too long (max 10000 characters)' })
    }
    
    if (files && !Array.isArray(files)) {
      return res.status(400).json({ error: 'Files must be an array' })
    }
    
    if (files && files.length > 50) {
      return res.status(400).json({ error: 'Too many files (max 50)' })
    }

    try {
      logger.info('Creating task', { userId, projectId, provider })

      // Get or create instance
      const instanceStartTime = Date.now()
      const instance = await instanceManager.startInstance(userId, projectId)
      metrics.instanceStartDuration.observe(Date.now() - instanceStartTime)
      metrics.activeInstances.set(instanceManager.getInstanceCount())

      // Connect client
      const client = new ClineClient(instance.address)
      await client.connect()

      // Configure provider (idempotent - safe to call multiple times)
      await configureProvider(client, provider as any)

      // Create task
      const taskId = await client.createTask(prompt, files)
      metrics.tasksCreated.inc({ provider })

      const duration = Date.now() - startTime
      logger.info('Task created', { taskId, userId, projectId, duration })

      res.json({
        taskId,
        instanceId: instance.instanceId,
        status: 'created',
        estimatedDuration: '30-60 seconds'
      })
    } catch (error: any) {
      logger.error('Failed to create task', {
        error: error.message,
        stack: error.stack,
        userId,
        projectId
      })
      res.status(500).json({
        error: 'Failed to create task',
        message: error.message
      })
    }
  }
)

// Get task status
router.get('/:taskId', async (req: AuthRequest, res) => {
  const { projectId, taskId } = req.params
  const userId = req.userId!

  try {
    const instance = instanceManager.getInstance(`${userId}-${projectId}`)
    if (!instance) {
      return res.status(404).json({ error: 'Instance not found' })
    }

    const client = new ClineClient(instance.address)
    await client.connect()

    const task = await client.getTask(taskId)
    res.json(task)
  } catch (error: any) {
    logger.error('Failed to get task', { error: error.message, taskId })
    res.status(500).json({ error: error.message })
  }
})

export default router

