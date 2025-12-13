import axios, { AxiosInstance } from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export class ClineApiClient {
  private client: AxiosInstance
  private token: string | null = null

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Load token from localStorage (only in browser)
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('auth_token')
      if (storedToken) {
        this.setToken(storedToken)
      }
    }

    // Add request interceptor to include token
    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`
      }
      return config
    })

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 && typeof window !== 'undefined') {
          // Token expired or invalid, redirect to login
          this.setToken('')
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token)
      } else {
        localStorage.removeItem('auth_token')
      }
    }
  }

  // Authentication
  async login(username: string, password: string) {
    const response = await this.client.post('/api/v1/auth/login', {
      username,
      password,
    })
    return response.data
  }

  async register(username: string, email: string, password: string) {
    const response = await this.client.post('/api/v1/auth/register', {
      username,
      email,
      password,
    })
    return response.data
  }

  async getCurrentUser() {
    const response = await this.client.get('/api/v1/auth/me')
    return response.data.user
  }

  // Projects
  async createProject(name: string, description?: string) {
    const response = await this.client.post('/api/v1/projects', {
      name,
      description,
    })
    return response.data
  }

  async listProjects() {
    const response = await this.client.get('/api/v1/projects')
    return response.data.projects
  }

  async getProject(projectId: string) {
    const response = await this.client.get(`/api/v1/projects/${projectId}`)
    return response.data
  }

  async updateProject(projectId: string, updates: { name?: string; description?: string }) {
    const response = await this.client.put(`/api/v1/projects/${projectId}`, updates)
    return response.data
  }

  async deleteProject(projectId: string) {
    const response = await this.client.delete(`/api/v1/projects/${projectId}`)
    return response.data
  }

  // Files
  async readFile(projectId: string, filePath: string) {
    const response = await this.client.get(`/api/v1/projects/${projectId}/files/${filePath}`)
    return response.data.content
  }

  async writeFile(projectId: string, filePath: string, content: string) {
    const response = await this.client.put(`/api/v1/projects/${projectId}/files/${filePath}`, {
      content,
    })
    return response.data
  }

  async createFile(projectId: string, filePath: string, content: string) {
    const response = await this.client.post(`/api/v1/projects/${projectId}/files`, {
      path: filePath,
      content,
    })
    return response.data
  }

  async deleteFile(projectId: string, filePath: string) {
    const response = await this.client.delete(`/api/v1/projects/${projectId}/files/${filePath}`)
    return response.data
  }

  async moveFile(projectId: string, oldPath: string, newPath: string) {
    const response = await this.client.post(`/api/v1/projects/${projectId}/files/${oldPath}/move`, { newPath })
    return response.data
  }

  async getFileTree(projectId: string) {
    const response = await this.client.get(`/api/v1/projects/${projectId}/files/tree`)
    return response.data
  }

  async searchFiles(projectId: string, query: string, limit = 10) {
    const response = await this.client.get(
      `/api/v1/projects/${projectId}/files/search?q=${encodeURIComponent(query)}&limit=${limit}`
    )
    return response.data.files
  }

  // Tasks
  async createTask(projectId: string, prompt: string, files?: string[], provider = 'OPENROUTER', apiKey?: string) {
    const storedApiKey = typeof window !== 'undefined' ? localStorage.getItem('openrouter_api_key') : null
    const response = await this.client.post(`/api/v1/projects/${projectId}/tasks`, {
      prompt,
      files: files || [],
      provider,
      apiKey: apiKey || storedApiKey || undefined,
    })
    return response.data
  }

  async getTask(projectId: string, taskId: string) {
    const response = await this.client.get(`/api/v1/projects/${projectId}/tasks/${taskId}`)
    return response.data
  }

  // Terminal
  async createTerminalSession(projectId: string) {
    const response = await this.client.post(`/api/v1/projects/${projectId}/terminal/sessions`)
    return response.data
  }

  async executeTerminalCommand(projectId: string, sessionId: string, command: string) {
    const response = await this.client.post(`/api/v1/projects/${projectId}/terminal/sessions/${sessionId}/execute`, {
      command,
    })
    return response.data
  }

  async getTerminalSession(projectId: string, sessionId: string) {
    const response = await this.client.get(`/api/v1/projects/${projectId}/terminal/sessions/${sessionId}`)
    return response.data
  }

  async closeTerminalSession(projectId: string, sessionId: string) {
    const response = await this.client.delete(`/api/v1/projects/${projectId}/terminal/sessions/${sessionId}`)
    return response.data
  }
}

// Singleton instance
export const apiClient = new ClineApiClient()
