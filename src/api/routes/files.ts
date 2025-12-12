import { Router } from 'express'
import { AuthRequest } from '../middleware/auth'
import { fileService } from '../../services/file-service'
import { validateFileSearchRequest } from '../../validators/file-validator'

const router = Router()

// Search files
router.get('/search', async (req: AuthRequest, res, next) => {
  try {
    const { projectId } = req.params
    const userId = req.userId!

    // Validate request
    const request = validateFileSearchRequest(req.query as Record<string, unknown>)

    // Search files using service layer
    const result = await fileService.searchFiles(userId, projectId, request)
    
    res.json(result)
  } catch (error) {
    next(error)
  }
})

export default router

