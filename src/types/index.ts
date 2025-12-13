import { ChildProcess } from 'child_process'

export interface InstanceInfo {
  instanceId: string
  address: string
  hostBridgePort: number
  workspacePath: string
  clineDataDir: string
  userId: string
  projectId: string
  coreProcess?: ChildProcess
  hostProcess?: ChildProcess
  startedAt: Date
  lastActivity: Date
}

export interface CreateTaskRequest {
  prompt: string
  files?: string[]
  provider?: 'OPENROUTER'
}

export interface CreateTaskResponse {
  taskId: string
  instanceId: string
  status: string
  estimatedDuration: string
}

export interface TaskResponse {
  id: string
  task: string
  ts: number
  is_favorited: boolean
  size: number
  total_cost: number
  tokens_in: number
  tokens_out: number
  cache_writes: number
  cache_reads: number
  model_id: string
}

