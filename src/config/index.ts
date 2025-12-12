import dotenv from 'dotenv'

dotenv.config()

export const config = {
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    logLevel: process.env.LOG_LEVEL || 'info'
  },
  cline: {
    corePath: process.env.CLINE_CORE_PATH || './dist-standalone/cline-core.js',
    hostPath: process.env.CLINE_HOST_PATH || './cline-host',
    workspaceDir: process.env.WORKSPACE_DIR || './workspaces',
    clineDir: process.env.CLINE_DIR
  },
  security: {
    jwtSecret: process.env.JWT_SECRET || '',
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000']
  },
  apiKeys: {
    anthropic: process.env.ANTHROPIC_API_KEY,
    cline: process.env.CLINE_API_KEY,
    openai: process.env.OPENAI_API_KEY
  },
  redis: {
    url: process.env.REDIS_URL
  },
  monitoring: {
    enableMetrics: process.env.ENABLE_METRICS !== 'false'
  }
}

// Validate required configuration
if (!config.security.jwtSecret) {
  console.warn('WARNING: JWT_SECRET not set. Authentication will not work properly.')
}

if (!config.apiKeys.anthropic && !config.apiKeys.cline && !config.apiKeys.openai) {
  console.warn('WARNING: No API keys configured. Tasks will fail without a provider.')
}

