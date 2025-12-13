import winston from 'winston'
import * as path from 'path'
import * as fs from 'fs'
import { configService } from '../config'

const serverConfig = configService.getServer()
const isCloudRun = process.env.K_SERVICE !== undefined || process.env.GOOGLE_CLOUD_PROJECT !== undefined
const isProduction = serverConfig.nodeEnv === 'production'

// Cloud Run requires logs to stdout/stderr - no file logging
// File logging only for local development
const transports: winston.transport[] = []

if (!isCloudRun && !isProduction) {
  // Ensure logs directory exists only for local development
  const logsDir = path.join(process.cwd(), 'logs')
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true })
  }
  
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error'
    }),
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log')
    })
  )
}

// Console transport - required for Cloud Run (logs to stdout/stderr)
// Use JSON format for Cloud Run (better for structured logging)
if (isCloudRun || isProduction) {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      )
    })
  )
} else {
  // Development: human-readable console logs
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const metaString = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
          return `${timestamp} [${level}]: ${message} ${metaString}`
        })
      )
    })
  )
}

export const logger = winston.createLogger({
  level: serverConfig.logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp'] })
  ),
  defaultMeta: {
    service: 'cline-backend',
    version: process.env.npm_package_version || '1.0.0',
    ...(isCloudRun && { environment: 'cloud-run' })
  },
  transports
})

