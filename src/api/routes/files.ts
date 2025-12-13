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

// Get file tree
router.get('/tree', async (req: AuthRequest, res, next) => {
  try {
    const { projectId } = req.params
    const userId = req.userId!

    const tree = await fileService.getFileTree(userId, projectId)
    res.json(tree)
  } catch (error) {
    next(error)
  }
})

// Read file content
router.get('/*', async (req: AuthRequest, res, next) => {
  try {
    const { projectId } = req.params
    const userId = req.userId!
    const filePath = req.params[0] // Capture the wildcard path

    if (!filePath) {
      return res.status(400).json({ error: 'File path is required' })
    }

    const content = await fileService.readFile(userId, projectId, filePath)
    res.json({ content, path: filePath })
  } catch (error) {
    next(error)
  }
})

// Create or update file
router.put('/*', async (req: AuthRequest, res, next) => {
  try {
    const { projectId } = req.params
    const userId = req.userId!
    const filePath = req.params[0]
    const { content } = req.body

    if (!filePath) {
      return res.status(400).json({ error: 'File path is required' })
    }

    if (typeof content !== 'string') {
      return res.status(400).json({ error: 'Content must be a string' })
    }

    await fileService.writeFile(userId, projectId, filePath, content)
    res.json({ success: true, path: filePath })
  } catch (error) {
    next(error)
  }
})

// Create new file
router.post('/', async (req: AuthRequest, res, next) => {
  try {
    const { projectId } = req.params
    const userId = req.userId!
    const { path: filePath, content } = req.body

    if (!filePath) {
      return res.status(400).json({ error: 'File path is required' })
    }

    if (typeof content !== 'string') {
      return res.status(400).json({ error: 'Content must be a string' })
    }

    await fileService.writeFile(userId, projectId, filePath, content)
    res.json({ success: true, path: filePath })
  } catch (error) {
    next(error)
  }
})

// Delete file
router.delete('/*', async (req: AuthRequest, res, next) => {
  try {
    const { projectId } = req.params
    const userId = req.userId!
    const filePath = req.params[0]

    if (!filePath) {
      return res.status(400).json({ error: 'File path is required' })
    }

    await fileService.deleteFile(userId, projectId, filePath)
    res.json({ success: true, path: filePath })
  } catch (error) {
    next(error)
  }
})

// Move/rename file
router.post('/*/move', async (req: AuthRequest, res, next) => {
  try {
    const { projectId } = req.params
    const userId = req.userId!
    const oldPath = req.params[0]
    const { newPath } = req.body

    if (!oldPath || !newPath) {
      return res.status(400).json({ error: 'Old path and new path are required' })
    }

    await fileService.moveFile(userId, projectId, oldPath, newPath)
    res.json({ success: true, oldPath, newPath })
  } catch (error) {
    next(error)
  }
})

export default router

