import { Router } from 'express'
import { taskLimiter } from '../middleware/rate-limiter'
import { AuthRequest } from '../middleware/auth'

const router = Router()

// Create task
router.post(
  '/',
  taskLimiter,
  async (req: AuthRequest, res, next) => {
    try {
      const { projectId } = req.params
      const userId = req.userId!

      // Validate request
      const request = validateCreateTaskRequest(req.body)

      // Create task using service layer
      const result = await taskService.createTask(userId, projectId, request)
      
      res.json(result)
    } catch (error) {
      next(error)
    }
  }
)

// Get task status
router.get('/:taskId', async (req: AuthRequest, res, next) => {
  try {
    const { projectId, taskId } = req.params
    const userId = req.userId!

    const task = await taskService.getTask(userId, projectId, taskId)
    res.json(task)
  } catch (error) {
    next(error)
  }
})

export default router

