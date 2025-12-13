import { ValidationError } from '../errors'
import { validateString } from './common'

export interface FileSearchRequest {
  query: string
  limit: number
}

export function validateFileSearchRequest(query: Record<string, unknown>): FileSearchRequest {
  // Validate query parameter (required)
  const q = validateString(query.q, 'q', 1, 200)

  // Validate limit (optional, default 10, max 100)
  let limit = 10
  if (query.limit !== undefined) {
    if (typeof query.limit !== 'string' && typeof query.limit !== 'number') {
      throw new ValidationError('limit must be a number or numeric string')
    }
    
    const limitNum = typeof query.limit === 'string' ? parseInt(query.limit, 10) : query.limit
    
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      throw new ValidationError('limit must be between 1 and 100')
    }
    
    limit = limitNum
  }

  return {
    query: q,
    limit
  }
}

