import * as fs from 'fs/promises'
import * as path from 'path'
import { instanceManager } from '../index'
import { clientFactory } from './cline-client-factory'
import { logger } from '../utils/logger'
import { InstanceNotFoundError } from '../errors/instance-error'
import { FileSearchRequest } from '../validators/file-validator'
import { ValidationError } from '../errors/validation-error'

export class FileService {
  async searchFiles(
    userId: string,
    projectId: string,
    request: FileSearchRequest
  ): Promise<{ files: string[] }> {
    const instanceId = `${userId}-${projectId}`
    const instance = instanceManager.getInstance(instanceId)
    
    if (!instance) {
      throw new InstanceNotFoundError(instanceId)
    }

    const client = await clientFactory.getClient(instance.address)
    const files = await client.searchFiles(request.query, request.limit)
    
    logger.debug('Files searched', { userId, projectId, query: request.query, resultCount: files.length })
    
    return { files }
  }

  /**
   * Read file content from workspace
   */
  async readFile(userId: string, projectId: string, filePath: string): Promise<string> {
    const instanceId = `${userId}-${projectId}`
    const instance = instanceManager.getInstance(instanceId)
    
    if (!instance) {
      throw new InstanceNotFoundError(instanceId)
    }

    const fullPath = this.resolveFilePath(instance.workspacePath, filePath)
    this.validateFilePath(fullPath, instance.workspacePath)

    try {
      const content = await fs.readFile(fullPath, 'utf-8')
      logger.debug('File read', { userId, projectId, filePath })
      return content
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.error('Failed to read file', { userId, projectId, filePath, error: errorMessage })
      throw new ValidationError(`Failed to read file: ${errorMessage}`)
    }
  }

  /**
   * Write file content to workspace
   */
  async writeFile(userId: string, projectId: string, filePath: string, content: string): Promise<void> {
    const instanceId = `${userId}-${projectId}`
    const instance = instanceManager.getInstance(instanceId)
    
    if (!instance) {
      throw new InstanceNotFoundError(instanceId)
    }

    const fullPath = this.resolveFilePath(instance.workspacePath, filePath)
    this.validateFilePath(fullPath, instance.workspacePath)

    // Check file size limit (10MB)
    const sizeInBytes = Buffer.byteLength(content, 'utf-8')
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (sizeInBytes > maxSize) {
      throw new ValidationError(`File size exceeds limit of ${maxSize} bytes`)
    }

    try {
      // Create parent directories if they don't exist
      const dir = path.dirname(fullPath)
      await fs.mkdir(dir, { recursive: true })

      await fs.writeFile(fullPath, content, 'utf-8')
      logger.debug('File written', { userId, projectId, filePath, size: sizeInBytes })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.error('Failed to write file', { userId, projectId, filePath, error: errorMessage })
      throw new ValidationError(`Failed to write file: ${errorMessage}`)
    }
  }

  /**
   * Delete file from workspace
   */
  async deleteFile(userId: string, projectId: string, filePath: string): Promise<void> {
    const instanceId = `${userId}-${projectId}`
    const instance = instanceManager.getInstance(instanceId)
    
    if (!instance) {
      throw new InstanceNotFoundError(instanceId)
    }

    const fullPath = this.resolveFilePath(instance.workspacePath, filePath)
    this.validateFilePath(fullPath, instance.workspacePath)

    try {
      await fs.unlink(fullPath)
      logger.debug('File deleted', { userId, projectId, filePath })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.error('Failed to delete file', { userId, projectId, filePath, error: errorMessage })
      throw new ValidationError(`Failed to delete file: ${errorMessage}`)
    }
  }

  /**
   * Move/rename file in workspace
   */
  async moveFile(userId: string, projectId: string, oldPath: string, newPath: string): Promise<void> {
    const instanceId = `${userId}-${projectId}`
    const instance = instanceManager.getInstance(instanceId)
    
    if (!instance) {
      throw new InstanceNotFoundError(instanceId)
    }

    const fullOldPath = this.resolveFilePath(instance.workspacePath, oldPath)
    const fullNewPath = this.resolveFilePath(instance.workspacePath, newPath)
    
    this.validateFilePath(fullOldPath, instance.workspacePath)
    this.validateFilePath(fullNewPath, instance.workspacePath)

    try {
      // Create parent directories if they don't exist
      const dir = path.dirname(fullNewPath)
      await fs.mkdir(dir, { recursive: true })

      await fs.rename(fullOldPath, fullNewPath)
      logger.debug('File moved', { userId, projectId, oldPath, newPath })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.error('Failed to move file', { userId, projectId, oldPath, newPath, error: errorMessage })
      throw new ValidationError(`Failed to move file: ${errorMessage}`)
    }
  }

  /**
   * Get file tree structure
   */
  async getFileTree(userId: string, projectId: string): Promise<FileTreeNode> {
    const instanceId = `${userId}-${projectId}`
    const instance = instanceManager.getInstance(instanceId)
    
    if (!instance) {
      throw new InstanceNotFoundError(instanceId)
    }

    const workspacePath = instance.workspacePath
    return this.buildFileTree(workspacePath, workspacePath)
  }

  /**
   * Build file tree recursively
   */
  private async buildFileTree(rootPath: string, currentPath: string): Promise<FileTreeNode> {
    const stats = await fs.stat(currentPath)
    const relativePath = path.relative(rootPath, currentPath) || '.'
    const name = path.basename(currentPath)

    if (stats.isDirectory()) {
      const entries = await fs.readdir(currentPath)
      const children: FileTreeNode[] = []

      for (const entry of entries) {
        // Skip hidden files and .cline directory
        if (entry.startsWith('.') && entry !== '.') {
          continue
        }

        const entryPath = path.join(currentPath, entry)
        try {
          const child = await this.buildFileTree(rootPath, entryPath)
          children.push(child)
        } catch (error) {
          // Skip entries we can't read
          logger.debug('Skipping file tree entry', { entryPath, error })
        }
      }

      return {
        name,
        path: relativePath,
        type: 'directory',
        children: children.sort((a, b) => {
          // Directories first, then files, both alphabetically
          if (a.type !== b.type) {
            return a.type === 'directory' ? -1 : 1
          }
          return a.name.localeCompare(b.name)
        })
      }
    } else {
      return {
        name,
        path: relativePath,
        type: 'file'
      }
    }
  }

  /**
   * Resolve file path relative to workspace
   */
  private resolveFilePath(workspacePath: string, filePath: string): string {
    // Remove leading slash if present
    const normalizedPath = filePath.startsWith('/') ? filePath.slice(1) : filePath
    return path.join(workspacePath, normalizedPath)
  }

  /**
   * Validate file path to prevent directory traversal attacks
   */
  private validateFilePath(fullPath: string, workspacePath: string): void {
    const resolved = path.resolve(fullPath)
    const resolvedWorkspace = path.resolve(workspacePath)

    if (!resolved.startsWith(resolvedWorkspace)) {
      throw new ValidationError('Invalid file path: directory traversal detected')
    }
  }
}

export interface FileTreeNode {
  name: string
  path: string
  type: 'file' | 'directory'
  children?: FileTreeNode[]
}

// Singleton instance
export const fileService = new FileService()

