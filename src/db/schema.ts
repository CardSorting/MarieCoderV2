/**
 * SQLite database schema for MVP
 * Handles users, projects, and usage tracking
 */

export const SCHEMA_VERSION = 1

export const CREATE_USERS_TABLE = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
)
`

export const CREATE_PROJECTS_TABLE = `
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)
`

export const CREATE_USAGE_LOGS_TABLE = `
CREATE TABLE IF NOT EXISTS usage_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  project_id TEXT,
  action TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
)
`

export const CREATE_INDEXES = [
  'CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id)',
  'CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON usage_logs(user_id)',
  'CREATE INDEX IF NOT EXISTS idx_usage_logs_project_id ON usage_logs(project_id)',
  'CREATE INDEX IF NOT EXISTS idx_usage_logs_timestamp ON usage_logs(timestamp)'
]

export function getAllSchemaStatements(): string[] {
  return [
    CREATE_USERS_TABLE,
    CREATE_PROJECTS_TABLE,
    CREATE_USAGE_LOGS_TABLE,
    ...CREATE_INDEXES
  ]
}

