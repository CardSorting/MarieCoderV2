import { Router } from 'express'
import { instanceManager } from '../../index'

const router = Router()

router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    instances: {
      active: instanceManager.getInstanceCount(),
      total: instanceManager.getInstanceCount()
    },
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0'
  })
})

router.get('/ready', async (req, res) => {
  // Check if critical services are ready
  const isReady = await instanceManager.isReady()
  
  if (isReady) {
    res.status(200).json({ status: 'ready' })
  } else {
    res.status(503).json({ status: 'not ready' })
  }
})

router.get('/live', (req, res) => {
  // Liveness probe - just check if process is running
  res.status(200).json({ status: 'alive' })
})

export default router

