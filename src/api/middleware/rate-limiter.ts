import rateLimit from 'express-rate-limit'
import { Request } from 'express'
import { AuthRequest } from './auth'
import { configService } from '../../config'

// In-memory store (use Redis in production)
const createMemoryStore = () => {
  const store = new Map<string, { count: number; resetTime: number }>()
  
  return {
    increment: (key: string, windowMs: number) => {
      const now = Date.now()
      const entry = store.get(key)
      
      if (!entry || now > entry.resetTime) {
        store.set(key, { count: 1, resetTime: now + windowMs })
        return { totalHits: 1, resetTime: new Date(now + windowMs) }
      }
      
      entry.count++
      return { totalHits: entry.count, resetTime: new Date(entry.resetTime) }
    }
  }
}

const memoryStore = createMemoryStore()

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  // Use Redis if available, otherwise use memory store
  store: configService.getRedis().url ? undefined : {
    increment: (key: string, cb: (err: Error | null, result?: { totalHits: number; resetTime: Date }) => void) => {
      const result = memoryStore.increment(key, 15 * 60 * 1000)
      cb(null, result)
    }
  } as rateLimit.Store
})

export const taskLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Limit to 5 tasks per minute per user
  keyGenerator: (req: Request) => {
    const authReq = req as AuthRequest
    return authReq.userId || req.ip
  },
  message: 'Too many tasks created, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
})

