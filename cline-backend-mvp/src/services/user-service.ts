import { randomUUID } from 'crypto'
import * as bcrypt from 'bcrypt'
import { dbService, User } from './db-service'
import { logger } from '../utils/logger'
import { ValidationError } from '../errors/validation-error'

export interface RegisterRequest {
  username: string
  email: string
  password: string
}

export interface LoginRequest {
  username: string
  password: string
}

export class UserService {
  /**
   * Register a new user
   */
  async register(request: RegisterRequest): Promise<Omit<User, 'password_hash'>> {
    // Validate input
    if (!request.username || request.username.trim().length === 0) {
      throw new ValidationError('Username is required')
    }

    if (request.username.length < 3 || request.username.length > 50) {
      throw new ValidationError('Username must be between 3 and 50 characters')
    }

    if (!request.email || !this.isValidEmail(request.email)) {
      throw new ValidationError('Valid email is required')
    }

    if (!request.password || request.password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters')
    }

    // Check if username already exists
    if (dbService.getUserByUsername(request.username)) {
      throw new ValidationError('Username already exists')
    }

    // Check if email already exists
    if (dbService.getUserByEmail(request.email)) {
      throw new ValidationError('Email already exists')
    }

    // Hash password
    const passwordHash = await bcrypt.hash(request.password, 10)

    // Create user
    const user = dbService.createUser({
      id: randomUUID(),
      username: request.username.trim(),
      email: request.email.trim().toLowerCase(),
      password_hash: passwordHash
    })

    logger.info('User registered', { userId: user.id, username: user.username })

    // Return user without password hash
    const { password_hash, ...userWithoutPassword } = user
    return userWithoutPassword
  }

  /**
   * Login user
   */
  async login(request: LoginRequest): Promise<Omit<User, 'password_hash'>> {
    if (!request.username || !request.password) {
      throw new ValidationError('Username and password are required')
    }

    // Find user by username
    const user = dbService.getUserByUsername(request.username)
    if (!user) {
      throw new ValidationError('Invalid username or password')
    }

    // Verify password
    const isValid = await bcrypt.compare(request.password, user.password_hash)
    if (!isValid) {
      throw new ValidationError('Invalid username or password')
    }

    logger.info('User logged in', { userId: user.id, username: user.username })

    // Return user without password hash
    const { password_hash, ...userWithoutPassword } = user
    return userWithoutPassword
  }

  /**
   * Get user by ID
   */
  getUserById(userId: string): Omit<User, 'password_hash'> | undefined {
    const user = dbService.getUserById(userId)
    if (!user) {
      return undefined
    }

    const { password_hash, ...userWithoutPassword } = user
    return userWithoutPassword
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
}

// Singleton instance
export const userService = new UserService()

