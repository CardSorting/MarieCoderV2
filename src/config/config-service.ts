import dotenv from 'dotenv'

dotenv.config()

export interface ServerConfig {
  port: number
  nodeEnv: 'development' | 'production' | 'test'
  logLevel: 'error' | 'warn' | 'info' | 'debug'
}

export interface ClineConfig {
  corePath: string
  hostPath: string
  workspaceDir: string
  clineDir?: string
}

export interface SecurityConfig {
  jwtSecret: string
  allowedOrigins: string[]
}

export interface ApiKeysConfig {
  openrouter?: string
}

export interface RedisConfig {
  url?: string
}

export interface MonitoringConfig {
  enableMetrics: boolean
}

export interface AppConfig {
  server: ServerConfig
  cline: ClineConfig
  security: SecurityConfig
  apiKeys: ApiKeysConfig
  redis: RedisConfig
  monitoring: MonitoringConfig
}

class ConfigService {
  private config: AppConfig

  constructor() {
    this.config = this.loadConfig()
    this.validateConfig()
  }

  private loadConfig(): AppConfig {
    const nodeEnv = (process.env.NODE_ENV || 'development') as ServerConfig['nodeEnv']
    const logLevel = (process.env.LOG_LEVEL || 'info') as ServerConfig['logLevel']

    return {
      server: {
        // Cloud Run requires PORT env var, defaults to 8080
        port: parseInt(process.env.PORT || '8080', 10),
        nodeEnv,
        logLevel
      },
      cline: {
        corePath: process.env.CLINE_CORE_PATH || './dist-standalone/cline-core.js',
        hostPath: process.env.CLINE_HOST_PATH || './cline-host',
        workspaceDir: process.env.WORKSPACE_DIR || './workspaces',
        clineDir: process.env.CLINE_DIR
      },
      security: {
        jwtSecret: process.env.JWT_SECRET || '',
        allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',').map(s => s.trim()) || ['http://localhost:3000', 'http://localhost:5173']
      },
      apiKeys: {
        openrouter: process.env.OPENROUTER_API_KEY
      },
      redis: {
        url: process.env.REDIS_URL
      },
      monitoring: {
        enableMetrics: process.env.ENABLE_METRICS !== 'false'
      }
    }
  }

  private validateConfig(): void {
    const warnings: string[] = []

    if (!this.config.security.jwtSecret) {
      warnings.push('WARNING: JWT_SECRET not set. Authentication will not work properly.')
    }

    if (!this.config.apiKeys.openrouter) {
      warnings.push('INFO: OPENROUTER_API_KEY not set in environment. Users can provide their own API key via the frontend settings.')
    }

    if (this.config.server.port < 1 || this.config.server.port > 65535) {
      throw new Error(`Invalid PORT: ${this.config.server.port}. Must be between 1 and 65535.`)
    }

    if (warnings.length > 0 && this.config.server.nodeEnv !== 'test') {
      warnings.forEach(warning => console.warn(warning))
    }
  }

  getConfig(): AppConfig {
    return this.config
  }

  getServer(): ServerConfig {
    return this.config.server
  }

  getCline(): ClineConfig {
    return this.config.cline
  }

  getSecurity(): SecurityConfig {
    return this.config.security
  }

  getApiKeys(): ApiKeysConfig {
    return this.config.apiKeys
  }

  getRedis(): RedisConfig {
    return this.config.redis
  }

  getMonitoring(): MonitoringConfig {
    return this.config.monitoring
  }

  isDevelopment(): boolean {
    return this.config.server.nodeEnv === 'development'
  }

  isProduction(): boolean {
    return this.config.server.nodeEnv === 'production'
  }

  isTest(): boolean {
    return this.config.server.nodeEnv === 'test'
  }
}

// Singleton instance
export const configService = new ConfigService()

