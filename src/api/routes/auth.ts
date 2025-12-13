import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { userService } from '../../services/user-service'
import { configService } from '../../config'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()

// Register new user
router.post('/register', async (req, res, next) => {
  try {
    const { username, email, password } = req.body

    const user = await userService.register({ username, email, password })

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      configService.getSecurity().jwtSecret,
      { expiresIn: '7d' }
    )

    res.status(201).json({
      user,
      token
    })
  } catch (error) {
    next(error)
  }
})

// Login user
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body

    const user = await userService.login({ username, password })

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      configService.getSecurity().jwtSecret,
      { expiresIn: '7d' }
    )

    res.json({
      user,
      token
    })
  } catch (error) {
    next(error)
  }
})

// Get current user (requires authentication)
router.get('/me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const user = userService.getUserById(userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({ user })
  } catch (error) {
    next(error)
  }
})

export default router
