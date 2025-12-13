import { Router } from 'express'
import { AuthRequest } from '../middleware/auth'
import { terminalService } from '../../services/terminal-service'

const router = Router()

// Create new terminal session
router.post('/sessions', async (req: AuthRequest, res, next) => {
  try {
    const { projectId } = req.params
    const userId = req.userId!

    const session = terminalService.createSession(userId, projectId)
    
    res.json({
      sessionId: session.id,
      createdAt: session.createdAt.toISOString()
    })
  } catch (error) {
    next(error)
  }
})

// Execute command in terminal session
router.post('/sessions/:sessionId/execute', async (req: AuthRequest, res, next) => {
  try {
    const { projectId, sessionId } = req.params
    const userId = req.userId!
    const { command } = req.body

    if (!command || typeof command !== 'string') {
      return res.status(400).json({ error: 'Command is required and must be a string' })
    }

    // Verify session belongs to user and project
    const session = terminalService.getSession(sessionId)
    if (!session || session.userId !== userId || session.projectId !== projectId) {
      return res.status(404).json({ error: 'Terminal session not found' })
    }

    terminalService.executeCommand(sessionId, command)
    res.json({ success: true })
  } catch (error) {
    next(error)
  }
})

// Get terminal session info
router.get('/sessions/:sessionId', async (req: AuthRequest, res, next) => {
  try {
    const { projectId, sessionId } = req.params
    const userId = req.userId!

    const session = terminalService.getSession(sessionId)
    if (!session || session.userId !== userId || session.projectId !== projectId) {
      return res.status(404).json({ error: 'Terminal session not found' })
    }

    res.json({
      sessionId: session.id,
      createdAt: session.createdAt.toISOString(),
      output: session.output.join('')
    })
  } catch (error) {
    next(error)
  }
})

// Close terminal session
router.delete('/sessions/:sessionId', async (req: AuthRequest, res, next) => {
  try {
    const { projectId, sessionId } = req.params
    const userId = req.userId!

    const session = terminalService.getSession(sessionId)
    if (!session || session.userId !== userId || session.projectId !== projectId) {
      return res.status(404).json({ error: 'Terminal session not found' })
    }

    terminalService.closeSession(sessionId)
    res.json({ success: true })
  } catch (error) {
    next(error)
  }
})

export default router

