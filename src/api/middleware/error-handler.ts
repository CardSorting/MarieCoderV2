import { Request, Response, NextFunction } from 'express'
import { logger } from '../../utils/logger'

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  })
  
  // Don't leak error details in production
  const message = process.env.NODE_ENV === 'development' 
    ? err.message 
    : 'Internal server error'
  
  res.status(err.status || 500).json({
    error: 'Internal server error',
    message
  })
}

