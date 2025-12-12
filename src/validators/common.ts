import { ValidationError } from '../errors'

export function validateString(value: unknown, fieldName: string, minLength = 1, maxLength?: number): string {
  if (typeof value !== 'string') {
    throw new ValidationError(`${fieldName} must be a string`)
  }
  
  if (value.length < minLength) {
    throw new ValidationError(`${fieldName} must be at least ${minLength} characters`)
  }
  
  if (maxLength !== undefined && value.length > maxLength) {
    throw new ValidationError(`${fieldName} must be at most ${maxLength} characters`)
  }
  
  return value
}

export function validateArray<T>(
  value: unknown,
  fieldName: string,
  maxLength?: number,
  itemValidator?: (item: unknown) => T
): T[] {
  if (!Array.isArray(value)) {
    throw new ValidationError(`${fieldName} must be an array`)
  }
  
  if (maxLength !== undefined && value.length > maxLength) {
    throw new ValidationError(`${fieldName} must have at most ${maxLength} items`)
  }
  
  if (itemValidator) {
    return value.map((item, index) => {
      try {
        return itemValidator(item)
      } catch (error) {
        throw new ValidationError(`${fieldName}[${index}] is invalid: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    })
  }
  
  return value as T[]
}

export function validateOptional<T>(
  value: unknown,
  validator: (val: unknown) => T
): T | undefined {
  if (value === undefined || value === null) {
    return undefined
  }
  return validator(value)
}

