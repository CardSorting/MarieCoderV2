import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'
import * as path from 'path'
import { promisify } from 'util'
import { logger } from '../utils/logger'
import { GrpcClientMap, GrpcPackageDefinition, NewTaskRequest, NewTaskResponse, ShowTaskRequest, FileSearchRequest, FileSearchResponse, UpdateApiConfigurationRequest, StateUpdate } from '../types/grpc'
import { ClientError, ClientConnectionError } from '../errors/client-error'

export class ClineClient {
  private clients: GrpcClientMap = {} as GrpcClientMap
  private protoPath: string
  private connected: boolean = false
  
  constructor(
    private address: string,
    protoDir: string = './proto' // Path to proto directory
  ) {
    this.protoPath = protoDir
  }
  
  async connect(): Promise<void> {
    if (this.connected) {
      return
    }
    
    try {
      // Load all proto files
      const protoFiles = [
        'cline/task.proto',
        'cline/file.proto',
        'cline/state.proto',
        'cline/models.proto',
        'cline/common.proto'
      ]
      
      const packageDefinition = await protoLoader.load(
        protoFiles.map(f => path.join(this.protoPath, f)),
        {
          keepCase: true,
          longs: String,
          enums: String,
          defaults: true,
          oneofs: true,
          includeDirs: [this.protoPath]
        }
      )
      
      const proto = grpc.loadPackageDefinition(packageDefinition) as unknown as GrpcPackageDefinition
      
      const creds = grpc.credentials.createInsecure()
      const options = { 'grpc.enable_http_proxy': 0 }
      
      this.clients = {
        Task: new proto.cline.TaskService(this.address, creds, options) as grpc.Client,
        File: new proto.cline.FileService(this.address, creds, options) as grpc.Client,
        State: new proto.cline.StateService(this.address, creds, options) as grpc.Client,
        Models: new proto.cline.ModelsService(this.address, creds, options) as grpc.Client
      }
      
      this.connected = true
      logger.debug('gRPC client connected', { address: this.address })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.error('Failed to connect gRPC client', { error: errorMessage, address: this.address })
      throw new ClientConnectionError(this.address, `Failed to connect: ${errorMessage}`)
    }
  }
  
  async createTask(prompt: string, files?: string[]): Promise<string> {
    try {
      const newTask = promisify((this.clients.Task as any).newTask.bind(this.clients.Task))
      const request: NewTaskRequest = {
        metadata: {},
        text: prompt,
        files: files || [],
        images: [],
        task_settings: {
          auto_approve_actions: {
            read_files: true,
            write_files: true,
            run_commands: true
          }
        }
      }
      const response = await newTask(request) as NewTaskResponse
      return response.value
    } catch (error: unknown) {
      throw ClientError.fromGrpcError(error, this.address)
    }
  }
  
  async getTask(taskId: string): Promise<unknown> {
    try {
      const showTask = promisify((this.clients.Task as any).showTaskWithId.bind(this.clients.Task))
      const request: ShowTaskRequest = { value: taskId }
      return await showTask(request)
    } catch (error: unknown) {
      throw ClientError.fromGrpcError(error, this.address)
    }
  }
  
  async searchFiles(query: string, maxResults = 10): Promise<string[]> {
    try {
      const searchFiles = promisify((this.clients.File as any).searchFiles.bind(this.clients.File))
      const request: FileSearchRequest = {
        metadata: {},
        query,
        max_results: maxResults
      }
      const response = await searchFiles(request) as FileSearchResponse
      return response.results?.map((r) => r.path) || []
    } catch (error: unknown) {
      throw ClientError.fromGrpcError(error, this.address)
    }
  }
  
  async updateApiConfiguration(secrets: UpdateApiConfigurationRequest['secrets'], options: UpdateApiConfigurationRequest['options']): Promise<void> {
    try {
      const updateConfig = promisify((this.clients.Models as any).updateApiConfiguration.bind(this.clients.Models))
      const request: UpdateApiConfigurationRequest = {
        metadata: {},
        secrets,
        options
      }
      await updateConfig(request)
    } catch (error: unknown) {
      throw ClientError.fromGrpcError(error, this.address)
    }
  }
  
  subscribeToState(callback: (state: StateUpdate) => void): grpc.ClientReadableStream<StateUpdate> {
    const call = (this.clients.State as any).subscribeToState({}) as grpc.ClientReadableStream<StateUpdate>
    call.on('data', callback)
    call.on('error', (err: unknown) => {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      logger.error('State stream error', { error: errorMessage })
    })
    return call
  }
  
  async cancelTask(): Promise<void> {
    try {
      const cancelTask = promisify((this.clients.Task as any).cancelTask.bind(this.clients.Task))
      await cancelTask({})
    } catch (error: unknown) {
      throw ClientError.fromGrpcError(error, this.address)
    }
  }
  
  disconnect(): void {
    Object.values(this.clients).forEach((client) => {
      if (client && typeof client.close === 'function') {
        client.close()
      }
    })
    this.connected = false
    logger.debug('gRPC client disconnected', { address: this.address })
  }
}

