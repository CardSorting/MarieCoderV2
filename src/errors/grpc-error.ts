import { AppError } from './app-error'
import * as grpc from '@grpc/grpc-js'

export class GrpcError extends AppError {
  public readonly grpcCode: grpc.status
  public readonly grpcDetails?: string

  constructor(
    message: string,
    grpcCode: grpc.status,
    grpcDetails?: string
  ) {
    const statusCode = mapGrpcToHttpStatus(grpcCode)
    const code = mapGrpcToErrorCode(grpcCode)
    
    super(message, statusCode, code, true)
    this.grpcCode = grpcCode
    this.grpcDetails = grpcDetails
    Object.setPrototypeOf(this, GrpcError.prototype)
  }

  static fromGrpcError(error: unknown): GrpcError {
    const grpcError = error as { code?: grpc.status; message?: string; details?: string }
    const grpcCode = grpcError.code || grpc.status.INTERNAL
    const message = grpcError.message || 'gRPC error occurred'
    const details = grpcError.details

    return new GrpcError(message, grpcCode, details)
  }

  toJSON() {
    return {
      ...super.toJSON(),
      grpcCode: grpc.status[this.grpcCode],
      grpcDetails: this.grpcDetails
    }
  }
}

function mapGrpcToHttpStatus(grpcCode: grpc.status): number {
  switch (grpcCode) {
    case grpc.status.OK:
      return 200
    case grpc.status.INVALID_ARGUMENT:
      return 400
    case grpc.status.FAILED_PRECONDITION:
      return 400
    case grpc.status.OUT_OF_RANGE:
      return 400
    case grpc.status.UNAUTHENTICATED:
      return 401
    case grpc.status.PERMISSION_DENIED:
      return 403
    case grpc.status.NOT_FOUND:
      return 404
    case grpc.status.ABORTED:
      return 409
    case grpc.status.ALREADY_EXISTS:
      return 409
    case grpc.status.RESOURCE_EXHAUSTED:
      return 429
    case grpc.status.CANCELLED:
      return 499
    case grpc.status.DATA_LOSS:
      return 500
    case grpc.status.UNKNOWN:
      return 500
    case grpc.status.INTERNAL:
      return 500
    case grpc.status.NOT_IMPLEMENTED:
      return 501
    case grpc.status.UNAVAILABLE:
      return 503
    case grpc.status.DEADLINE_EXCEEDED:
      return 504
    default:
      return 500
  }
}

function mapGrpcToErrorCode(grpcCode: grpc.status): string {
  switch (grpcCode) {
    case grpc.status.INVALID_ARGUMENT:
      return 'INVALID_ARGUMENT'
    case grpc.status.FAILED_PRECONDITION:
      return 'FAILED_PRECONDITION'
    case grpc.status.UNAUTHENTICATED:
      return 'UNAUTHENTICATED'
    case grpc.status.PERMISSION_DENIED:
      return 'PERMISSION_DENIED'
    case grpc.status.NOT_FOUND:
      return 'NOT_FOUND'
    case grpc.status.ALREADY_EXISTS:
      return 'ALREADY_EXISTS'
    case grpc.status.RESOURCE_EXHAUSTED:
      return 'RESOURCE_EXHAUSTED'
    case grpc.status.UNAVAILABLE:
      return 'SERVICE_UNAVAILABLE'
    case grpc.status.DEADLINE_EXCEEDED:
      return 'DEADLINE_EXCEEDED'
    case grpc.status.INTERNAL:
      return 'INTERNAL_ERROR'
    case grpc.status.NOT_IMPLEMENTED:
      return 'NOT_IMPLEMENTED'
    default:
      return 'UNKNOWN_ERROR'
  }
}

