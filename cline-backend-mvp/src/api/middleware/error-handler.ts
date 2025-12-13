import { Request, Response, NextFunction } from 'express'
import { logger } from '../../utils/logger'
import { configService } from '../../config'
import { AppError } from '../../errors'

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log error
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ...(err instanceof AppError ? { code: err.code, statusCode: err.statusCode } : {})
  })
  
  // Handle AppError instances
  if (err instanceof AppError) {
    const isDevelopment = configService.isDevelopment()
    return res.status(err.statusCode).json({
      ...err.toJSON(),
      ...(isDevelopment ? { stack: err.stack } : {})
    })
  }
  
  // Handle unknown errors
  const isDevelopment = configService.isDevelopment()
  const statusCode = (err as Error & { status?: number }).status || 500
  
  res.status(statusCode).json({
    error: 'Internal server error',
    message: isDevelopment ? err.message : 'An unexpected error occurred',
    ...(isDevelopment ? { stack: err.stack } : {})
  })
}

