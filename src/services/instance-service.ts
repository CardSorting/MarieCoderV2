import { instanceManager } from '../index'
import { logger } from '../utils/logger'
import { InstanceInfo } from '../types'
import { InstanceNotFoundError } from '../errors/instance-error'

export class InstanceService {
  async getOrCreateInstance(userId: string, projectId: string): Promise<InstanceInfo> {
    return await instanceManager.startInstance(userId, projectId)
  }

  async getInstance(userId: string, projectId: string): Promise<InstanceInfo> {
    const instanceId = `${userId}-${projectId}`
    const instance = instanceManager.getInstance(instanceId)
    
    if (!instance) {
      throw new InstanceNotFoundError(instanceId)
    }
    
    return instance
  }

  async stopInstance(userId: string, projectId: string): Promise<void> {
    const instanceId = `${userId}-${projectId}`
    await instanceManager.stopInstance(instanceId)
    logger.info('Instance stopped', { instanceId, userId, projectId })
  }

  getInstanceCount(): number {
    return instanceManager.getInstanceCount()
  }
}

// Singleton instance
export const instanceService = new InstanceService()

