import jwt from 'jsonwebtoken'
import { configService } from '../config/config-service'
import { logger } from '../utils/logger'

export interface TokenPayload {
  userId: string
  username: string
  email: string
}

export interface TokenResponse {
  token: string
  expiresIn: number
}

export class JwtService {
  private secret: string
  private expiresIn: string = '7d' // Token expires in 7 days

  constructor() {
    this.secret = configService.getSecurity().jwtSecret
    if (!this.secret) {
      throw new Error('JWT_SECRET must be set in environment variables')
    }
  }

  /**
   * Generate a JWT token for a user
   */
  generateToken(payload: TokenPayload): TokenResponse {
    try {
      const token = jwt.sign(payload, this.secret, {
        expiresIn: this.expiresIn,
      })

      // Calculate expiration time in seconds
      const expiresIn = 7 * 24 * 60 * 60 // 7 days in seconds

      return {
        token,
        expiresIn,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.error('Failed to generate token', { error: errorMessage })
      throw new Error('Failed to generate token')
    }
  }

  /**
   * Verify and decode a JWT token
   */
  verifyToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, this.secret) as TokenPayload
      return decoded
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        logger.warn('Invalid token', { error: error.message })
        throw new Error('Invalid token')
      }
      if (error instanceof jwt.TokenExpiredError) {
        logger.warn('Token expired', { error: error.message })
        throw new Error('Token expired')
      }
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.error('Token verification failed', { error: errorMessage })
      throw new Error('Token verification failed')
    }
  }

  /**
   * Decode token without verification (for debugging only)
   */
  decodeToken(token: string): TokenPayload | null {
    try {
      return jwt.decode(token) as TokenPayload
    } catch {
      return null
    }
  }
}

// Singleton instance
export const jwtService = new JwtService()

