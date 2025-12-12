import { ClineClient } from './cline-client'
import { logger } from '../utils/logger'
import { configService } from '../config'
import { UpdateApiConfigurationRequest } from '../types/grpc'

export type Provider = 'ANTHROPIC' | 'OPENAI' | 'CLINE'

export async function configureProvider(
  client: ClineClient,
  provider: Provider,
  apiKey?: string
): Promise<void> {
  const apiKeys = configService.getApiKeys()
  const config: UpdateApiConfigurationRequest = {
    metadata: {},
    secrets: {},
    options: {}
  }
  
  switch (provider) {
    case 'ANTHROPIC':
      config.secrets.apiKey = apiKey || apiKeys.anthropic
      config.options.actModeApiProvider = 'ANTHROPIC'
      config.options.actModeApiModelId = 'claude-3-5-sonnet-20241022'
      break
    case 'OPENAI':
      config.secrets.openAiNativeApiKey = apiKey || apiKeys.openai
      config.options.actModeApiProvider = 'OPENAI'
      config.options.actModeApiModelId = 'gpt-4'
      break
    case 'CLINE':
      config.secrets.clineApiKey = apiKey || apiKeys.cline
      config.options.actModeApiProvider = 'CLINE'
      break
    default:
      throw new Error(`Unknown provider: ${provider}`)
  }
  
  try {
    await client.updateApiConfiguration(config.secrets, config.options)
    logger.info('Provider configured', { provider })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Failed to configure provider', { error: errorMessage, provider })
    throw error
  }
}

