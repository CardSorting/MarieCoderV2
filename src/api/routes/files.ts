import { Router } from 'express'
import { instanceManager } from '../../index'
import { ClineClient } from '../../services/cline-client'
import { logger } from '../../utils/logger'
import { AuthRequest } from '../middleware/auth'

const router = Router()

// Search files
router.get('/search', async (req: AuthRequest, res) => {
  const { projectId } = req.params
  const { q, limit = '10' } = req.query
  const userId = req.userId!

  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Query parameter "q" is required' })
  }

  try {
    const instance = instanceManager.getInstance(`${userId}-${projectId}`)
    if (!instance) {
      return res.status(404).json({ error: 'Instance not found' })
    }

    const client = new ClineClient(instance.address)
    await client.connect()

    const files = await client.searchFiles(q, parseInt(limit as string))
    res.json({ files })
  } catch (error: any) {
    logger.error('Failed to search files', { error: error.message })
    res.status(500).json({ error: error.message })
  }
})

export default router

