import { AppError } from './app-error'
import { GrpcError } from './grpc-error'

export class ClientError extends AppError {
  public readonly address?: string
  public readonly grpcError?: GrpcError

  constructor(
    message: string,
    address?: string,
    grpcError?: GrpcError,
    statusCode: number = 500
  ) {
    super(message, statusCode, 'CLIENT_ERROR', true)
    this.address = address
    this.grpcError = grpcError
    Object.setPrototypeOf(this, ClientError.prototype)
  }

  static fromGrpcError(error: unknown, address?: string): ClientError {
    try {
      const grpcError = GrpcError.fromGrpcError(error)
      return new ClientError(
        `gRPC client error: ${grpcError.message}`,
        address,
        grpcError,
        grpcError.statusCode
      )
    } catch {
      // Fallback if GrpcError.fromGrpcError fails
      const errorMessage = error instanceof Error ? error.message : 'Unknown gRPC error'
      return new ClientError(
        `gRPC client error: ${errorMessage}`,
        address,
        undefined,
        500
      )
    }
  }

  toJSON() {
    return {
      ...super.toJSON(),
      address: this.address,
      grpcError: this.grpcError?.toJSON()
    }
  }
}

export class ClientConnectionError extends ClientError {
  constructor(address: string, message: string = 'Failed to connect to gRPC client') {
    super(message, address, undefined, 503)
    this.code = 'CLIENT_CONNECTION_ERROR'
    Object.setPrototypeOf(this, ClientConnectionError.prototype)
  }
}

