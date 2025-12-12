import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'
import * as path from 'path'
import { promisify } from 'util'
import { logger } from '../utils/logger'

export class ClineClient {
  private clients: any = {}
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
      
      const proto = grpc.loadPackageDefinition(packageDefinition) as any
      
      const creds = grpc.credentials.createInsecure()
      const options = { 'grpc.enable_http_proxy': 0 }
      
      this.clients = {
        Task: new proto.cline.TaskService(this.address, creds, options),
        File: new proto.cline.FileService(this.address, creds, options),
        State: new proto.cline.StateService(this.address, creds, options),
        Models: new proto.cline.ModelsService(this.address, creds, options)
      }
      
      this.connected = true
      logger.debug('gRPC client connected', { address: this.address })
    } catch (error: any) {
      logger.error('Failed to connect gRPC client', { error: error.message, address: this.address })
      throw error
    }
  }
  
  async createTask(prompt: string, files?: string[]): Promise<string> {
    const newTask = promisify(this.clients.Task.newTask.bind(this.clients.Task))
    const response = await newTask({
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
    })
    return response.value
  }
  
  async getTask(taskId: string): Promise<any> {
    const showTask = promisify(
      this.clients.Task.showTaskWithId.bind(this.clients.Task)
    )
    return await showTask({ value: taskId })
  }
  
  async searchFiles(query: string, maxResults = 10): Promise<string[]> {
    const searchFiles = promisify(
      this.clients.File.searchFiles.bind(this.clients.File)
    )
    const response = await searchFiles({
      metadata: {},
      query,
      max_results: maxResults
    })
    return response.results?.map((r: any) => r.path) || []
  }
  
  async updateApiConfiguration(secrets: any, options: any): Promise<void> {
    const updateConfig = promisify(
      this.clients.Models.updateApiConfiguration.bind(this.clients.Models)
    )
    await updateConfig({
      metadata: {},
      secrets,
      options
    })
  }
  
  subscribeToState(callback: (state: any) => void): any {
    const call = this.clients.State.subscribeToState({})
    call.on('data', callback)
    call.on('error', (err: any) => {
      logger.error('State stream error', { error: err.message })
    })
    return call
  }
  
  async cancelTask(): Promise<void> {
    const cancelTask = promisify(
      this.clients.Task.cancelTask.bind(this.clients.Task)
    )
    await cancelTask({})
  }
  
  disconnect(): void {
    Object.values(this.clients).forEach((client: any) => {
      if (client && typeof client.close === 'function') {
        client.close()
      }
    })
    this.connected = false
    logger.debug('gRPC client disconnected', { address: this.address })
  }
}

