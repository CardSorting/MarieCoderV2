import { AppError } from './app-error'

export class ValidationError extends AppError {
  public readonly fields?: Record<string, string[]>

  constructor(
    message: string,
    fields?: Record<string, string[]>
  ) {
    super(message, 400, 'VALIDATION_ERROR', true)
    this.fields = fields
    Object.setPrototypeOf(this, ValidationError.prototype)
  }

  toJSON() {
    return {
      ...super.toJSON(),
      fields: this.fields
    }
  }
}

