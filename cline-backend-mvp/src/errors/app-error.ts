export abstract class AppError extends Error {
  public readonly statusCode: number
  public code: string
  public readonly isOperational: boolean

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true
  ) {
    super(message)
    
    this.statusCode = statusCode
    this.code = code
    this.isOperational = isOperational
    
    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor)
    
    // Set the prototype explicitly
    Object.setPrototypeOf(this, AppError.prototype)
  }

  toJSON() {
    return {
      error: this.code,
      message: this.message,
      statusCode: this.statusCode
    }
  }
}

