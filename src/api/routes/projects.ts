import { Router } from 'express'
import { AuthRequest } from '../middleware/auth'
import { projectService } from '../../services/project-service'

const router = Router()

// Create new project
router.post('/', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!
    const { name, description } = req.body

    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Project name is required' })
    }

    const project = await projectService.createProject(userId, name, description)
    res.status(201).json(project)
  } catch (error) {
    next(error)
  }
})

// List user's projects
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!
    const projects = await projectService.listProjects(userId)
    res.json({ projects })
  } catch (error) {
    next(error)
  }
})

// Get project by ID
router.get('/:projectId', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!
    const { projectId } = req.params

    const project = await projectService.getProject(userId, projectId)
    res.json(project)
  } catch (error) {
    next(error)
  }
})

// Update project
router.put('/:projectId', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!
    const { projectId } = req.params
    const { name, description } = req.body

    const updates: { name?: string; description?: string } = {}
    if (name !== undefined) {
      if (typeof name !== 'string') {
        return res.status(400).json({ error: 'Name must be a string' })
      }
      updates.name = name
    }
    if (description !== undefined) {
      if (typeof description !== 'string' && description !== null) {
        return res.status(400).json({ error: 'Description must be a string or null' })
      }
      updates.description = description || undefined
    }

    const project = await projectService.updateProject(userId, projectId, updates)
    res.json(project)
  } catch (error) {
    next(error)
  }
})

// Delete project
router.delete('/:projectId', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!
    const { projectId } = req.params

    await projectService.deleteProject(userId, projectId)
    res.json({ success: true })
  } catch (error) {
    next(error)
  }
})

export default router

