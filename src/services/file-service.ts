import { instanceManager } from '../index'
import { clientFactory } from './cline-client-factory'
import { logger } from '../utils/logger'
import { InstanceNotFoundError } from '../errors/instance-error'
import { FileSearchRequest } from '../validators/file-validator'

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
}

// Singleton instance
export const fileService = new FileService()

