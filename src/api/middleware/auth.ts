import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { logger } from '../../utils/logger'

export interface AuthRequest extends Request {
  userId?: string
  user?: {
    id: string
    email: string
    role: string
  }
}

export function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization
  
  if (!authHeader?.startsWith('Bearer ')) {
    logger.warn('Unauthorized request - no token', { path: req.path })
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const token = authHeader.substring(7)
  const secret = process.env.JWT_SECRET
  
  if (!secret) {
    logger.error('JWT_SECRET not configured')
    return res.status(500).json({ error: 'Server configuration error' })
  }
  
  try {
    const decoded = jwt.verify(token, secret) as any
    req.userId = decoded.userId || decoded.id
    req.user = {
      id: decoded.userId || decoded.id,
      email: decoded.email || '',
      role: decoded.role || 'user'
    }
    next()
  } catch (error: any) {
    logger.warn('Invalid token', { error: error.message })
    return res.status(401).json({ error: 'Invalid token' })
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    
    if (!roles.includes(req.user.role)) {
      logger.warn('Forbidden - insufficient role', {
        userId: req.userId,
        role: req.user.role,
        required: roles
      })
      return res.status(403).json({ error: 'Forbidden' })
    }
    
    next()
  }
}

