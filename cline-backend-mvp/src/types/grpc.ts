import * as grpc from '@grpc/grpc-js'

export interface GrpcClientMap {
  Task: grpc.Client
  File: grpc.Client
  State: grpc.Client
  Models: grpc.Client
}

export interface GrpcServiceDefinition {
  [key: string]: grpc.ServiceDefinition<any>
}

export interface GrpcPackageDefinition {
  cline: {
    TaskService: grpc.ServiceClientConstructor
    FileService: grpc.ServiceClientConstructor
    StateService: grpc.ServiceClientConstructor
    ModelsService: grpc.ServiceClientConstructor
  }
}

export interface NewTaskRequest {
  metadata: Record<string, unknown>
  text: string
  files?: string[]
  images?: string[]
  task_settings?: {
    auto_approve_actions?: {
      read_files?: boolean
      write_files?: boolean
      run_commands?: boolean
    }
  }
}

export interface NewTaskResponse {
  value: string // Task ID
}

export interface ShowTaskRequest {
  value: string // Task ID
}

export interface FileSearchRequest {
  metadata: Record<string, unknown>
  query: string
  max_results?: number
}

export interface FileSearchResult {
  path: string
  name?: string
  is_directory?: boolean
}

export interface FileSearchResponse {
  results?: FileSearchResult[]
}

export interface UpdateApiConfigurationRequest {
  metadata: Record<string, unknown>
  secrets: {
    openRouterApiKey?: string
    [key: string]: unknown
  }
  options: {
    actModeApiProvider?: string
    actModeApiModelId?: string
    [key: string]: unknown
  }
}

export interface StateUpdate {
  current_task_id?: string
  task_history?: unknown[]
  [key: string]: unknown
}

