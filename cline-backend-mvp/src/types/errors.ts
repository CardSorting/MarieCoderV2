export interface ErrorResponse {
  error: string
  message: string
  statusCode: number
  [key: string]: unknown
}

export interface ValidationErrorResponse extends ErrorResponse {
  fields?: Record<string, string[]>
}

export interface InstanceErrorResponse extends ErrorResponse {
  instanceId?: string
}

export interface GrpcErrorResponse extends ErrorResponse {
  grpcCode?: string
  grpcDetails?: string
}

export interface ClientErrorResponse extends ErrorResponse {
  address?: string
  grpcError?: GrpcErrorResponse
}

