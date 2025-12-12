import * as fs from 'fs/promises'
import * as path from 'path'
import { logger } from '../utils/logger'

/**
 * Service for managing isolated workspaces per user/project.
 * Handles workspace creation, cleanup, and size calculation.
 */
export class WorkspaceManager {
  constructor(private baseDir: string) {}

  /**
   * Create a workspace directory for a user/project.
   */
  async createWorkspace(userId: string, projectId: string): Promise<string> {
    const workspacePath = path.join(
      this.baseDir,
      userId,
      projectId
    )
    
    await fs.mkdir(workspacePath, { recursive: true })
    
    // Create .cline directory for workspace-specific config
    const clineDir = path.join(workspacePath, '.cline')
    await fs.mkdir(clineDir, { recursive: true })
    
    logger.debug('Workspace created', { workspacePath, userId, projectId })
    
    return workspacePath
  }

  /**
   * Get workspace path for a user/project.
   */
  getWorkspacePath(userId: string, projectId: string): string {
    return path.join(this.baseDir, userId, projectId)
  }

  /**
   * Check if workspace exists.
   */
  async workspaceExists(userId: string, projectId: string): Promise<boolean> {
    const workspacePath = this.getWorkspacePath(userId, projectId)
    try {
      await fs.access(workspacePath)
      return true
    } catch {
      return false
    }
  }

  /**
   * Calculate workspace size in bytes.
   */
  async getWorkspaceSize(workspacePath: string): Promise<number> {
    let totalSize = 0
    
    async function calculateSize(dirPath: string): Promise<void> {
      const entries = await fs.readdir(dirPath, { withFileTypes: true })
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name)
        
        if (entry.isDirectory()) {
          await calculateSize(fullPath)
        } else {
          const stats = await fs.stat(fullPath)
          totalSize += stats.size
        }
      }
    }
    
    try {
      await calculateSize(workspacePath)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.warn('Error calculating workspace size', { workspacePath, error: errorMessage })
    }
    
    return totalSize
  }

  /**
   * Clean up workspace (use with caution - removes all files).
   */
  async cleanupWorkspace(workspacePath: string): Promise<void> {
    try {
      await fs.rm(workspacePath, { recursive: true, force: true })
      logger.info('Workspace cleaned up', { workspacePath })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.error('Error cleaning up workspace', { workspacePath, error: errorMessage })
      throw error
    }
  }
}

