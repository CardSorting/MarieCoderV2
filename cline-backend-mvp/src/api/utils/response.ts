import { Response } from 'express'

export interface SuccessResponse<T = unknown> {
  success: true
  data: T
  timestamp: string
}

export interface ErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: unknown
  }
  timestamp: string
}

/**
 * Send a standardized success response
 */
export function sendSuccess<T>(res: Response, data: T, statusCode: number = 200): void {
  const response: SuccessResponse<T> = {
    success: true,
    data,
    timestamp: new Date().toISOString()
  }
  res.status(statusCode).json(response)
}

/**
 * Send a standardized error response
 */
export function sendError(
  res: Response,
  code: string,
  message: string,
  statusCode: number = 500,
  details?: unknown
): void {
  const response: ErrorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details !== undefined && { details })
    },
    timestamp: new Date().toISOString()
  }
  res.status(statusCode).json(response)
}

