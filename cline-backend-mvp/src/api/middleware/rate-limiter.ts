import rateLimit from 'express-rate-limit'
import { Request } from 'express'
import { AuthRequest } from './auth'

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
  // Note: In production, configure Redis store via store option if needed
})

export const taskLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Limit to 5 tasks per minute per user
  keyGenerator: (req: Request): string => {
    const authReq = req as AuthRequest
    return authReq.userId || req.ip || 'unknown'
  },
  message: 'Too many tasks created, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
})

