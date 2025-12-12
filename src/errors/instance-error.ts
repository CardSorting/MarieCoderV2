import { AppError } from './app-error'

export class InstanceError extends AppError {
  public readonly instanceId?: string

  constructor(
    message: string,
    instanceId?: string,
    statusCode: number = 500
  ) {
    super(message, statusCode, 'INSTANCE_ERROR', true)
    this.instanceId = instanceId
    Object.setPrototypeOf(this, InstanceError.prototype)
  }

  toJSON() {
    return {
      ...super.toJSON(),
      instanceId: this.instanceId
    }
  }
}

export class InstanceNotFoundError extends InstanceError {
  constructor(instanceId: string) {
    super(`Instance not found: ${instanceId}`, instanceId, 404)
    this.code = 'INSTANCE_NOT_FOUND'
    Object.setPrototypeOf(this, InstanceNotFoundError.prototype)
  }
}

export class InstanceNotReadyError extends InstanceError {
  constructor(instanceId: string, message: string = 'Instance is not ready') {
    super(message, instanceId, 503)
    this.code = 'INSTANCE_NOT_READY'
    Object.setPrototypeOf(this, InstanceNotReadyError.prototype)
  }
}

