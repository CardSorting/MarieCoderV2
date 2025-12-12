import { Request, Response, NextFunction } from 'express'
import { randomUUID } from 'crypto'
import { logger } from '../../utils/logger'

export interface RequestContext {
  requestId: string
  userId?: string
  projectId?: string
  startTime: number
}

declare global {
  namespace Express {
    interface Request {
      context?: RequestContext
    }
  }
}

/**
 * Middleware to add request context (request ID, timing, etc.)
 * Improves logging correlation and debugging
 */
export function requestContext(req: Request, res: Response, next: NextFunction): void {
  const requestId = randomUUID()
  const startTime = Date.now()

  req.context = {
    requestId,
    startTime
  }

  // Add request ID to response headers
  res.setHeader('X-Request-ID', requestId)

  // Log request start
  logger.debug('Request started', {
    requestId,
    method: req.method,
    path: req.path,
    ip: req.ip
  })

  // Log request completion
  res.on('finish', () => {
    const duration = Date.now() - startTime
    logger.debug('Request completed', {
      requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration
    })
  })

  next()
}

