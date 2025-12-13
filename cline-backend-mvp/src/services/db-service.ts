import Database from 'better-sqlite3'
import * as path from 'path'
import * as fs from 'fs/promises'
import { logger } from '../utils/logger'
import { getAllSchemaStatements } from '../db/schema'

export interface User {
  id: string
  username: string
  email: string
  password_hash: string
  created_at: number
  updated_at: number
}

export interface Project {
  id: string
  user_id: string
  name: string
  description?: string
  created_at: number
  updated_at: number
}

export interface UsageLog {
  id: string
  user_id: string
  project_id?: string
  action: string
  timestamp: number
}

class DatabaseService {
  private db: Database.Database | null = null
  private dbPath: string

  constructor() {
    // Get database path from config or use default
    const dbPath = process.env.DB_PATH || path.join(process.cwd(), 'data', 'cline.db')
    this.dbPath = dbPath
  }

  /**
   * Initialize the database connection and run migrations
   */
  async initialize(): Promise<void> {
    try {
      // Ensure data directory exists
      const dbDir = path.dirname(this.dbPath)
      await fs.mkdir(dbDir, { recursive: true })

      // Open database connection
      this.db = new Database(this.dbPath)
      
      // Enable foreign keys
      this.db.pragma('foreign_keys = ON')
      
      // Run schema migrations
      await this.runMigrations()
      
      logger.info('Database initialized', { dbPath: this.dbPath })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.error('Failed to initialize database', { error: errorMessage, dbPath: this.dbPath })
      throw error
    }
  }

  /**
   * Run database migrations
   */
  private async runMigrations(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized')
    }

    const statements = getAllSchemaStatements()
    
    // Run all schema statements in a transaction
    const transaction = this.db.transaction(() => {
      for (const statement of statements) {
        this.db!.exec(statement)
      }
    })
    
    transaction()
    logger.debug('Database migrations completed')
  }

  /**
   * Get database instance (throws if not initialized)
   */
  getDatabase(): Database.Database {
    if (!this.db) {
      throw new Error('Database not initialized. Call initialize() first.')
    }
    return this.db
  }

  /**
   * Close database connection
   */
  close(): void {
    if (this.db) {
      this.db.close()
      this.db = null
      logger.info('Database connection closed')
    }
  }

  // User operations
  createUser(user: Omit<User, 'created_at' | 'updated_at'>): User {
    const db = this.getDatabase()
    const now = Date.now()
    
    const stmt = db.prepare(`
      INSERT INTO users (id, username, email, password_hash, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `)
    
    stmt.run(
      user.id,
      user.username,
      user.email,
      user.password_hash,
      now,
      now
    )
    
    return this.getUserById(user.id)!
  }

  getUserById(id: string): User | undefined {
    const db = this.getDatabase()
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?')
    return stmt.get(id) as User | undefined
  }

  getUserByUsername(username: string): User | undefined {
    const db = this.getDatabase()
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?')
    return stmt.get(username) as User | undefined
  }

  getUserByEmail(email: string): User | undefined {
    const db = this.getDatabase()
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?')
    return stmt.get(email) as User | undefined
  }

  // Project operations
  createProject(project: Omit<Project, 'created_at' | 'updated_at'>): Project {
    const db = this.getDatabase()
    const now = Date.now()
    
    const stmt = db.prepare(`
      INSERT INTO projects (id, user_id, name, description, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `)
    
    stmt.run(
      project.id,
      project.user_id,
      project.name,
      project.description || null,
      now,
      now
    )
    
    return this.getProjectById(project.id)!
  }

  getProjectById(id: string): Project | undefined {
    const db = this.getDatabase()
    const stmt = db.prepare('SELECT * FROM projects WHERE id = ?')
    return stmt.get(id) as Project | undefined
  }

  getProjectsByUserId(userId: string): Project[] {
    const db = this.getDatabase()
    const stmt = db.prepare('SELECT * FROM projects WHERE user_id = ? ORDER BY updated_at DESC')
    return stmt.all(userId) as Project[]
  }

  updateProject(id: string, updates: Partial<Pick<Project, 'name' | 'description'>>): Project {
    const db = this.getDatabase()
    const now = Date.now()
    
    const fields: string[] = []
    const values: (string | number | null)[] = []
    
    if (updates.name !== undefined) {
      fields.push('name = ?')
      values.push(updates.name)
    }
    
    if (updates.description !== undefined) {
      fields.push('description = ?')
      values.push(updates.description)
    }
    
    fields.push('updated_at = ?')
    values.push(now)
    values.push(id)
    
    const stmt = db.prepare(`UPDATE projects SET ${fields.join(', ')} WHERE id = ?`)
    stmt.run(...values)
    
    return this.getProjectById(id)!
  }

  deleteProject(id: string): void {
    const db = this.getDatabase()
    const stmt = db.prepare('DELETE FROM projects WHERE id = ?')
    stmt.run(id)
  }

  // Usage logging
  logUsage(log: Omit<UsageLog, 'timestamp'>): void {
    const db = this.getDatabase()
    const stmt = db.prepare(`
      INSERT INTO usage_logs (id, user_id, project_id, action, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `)
    
    stmt.run(
      log.id,
      log.user_id,
      log.project_id || null,
      log.action,
      Date.now()
    )
  }
}

// Singleton instance
export const dbService = new DatabaseService()

