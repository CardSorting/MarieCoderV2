import { ClineClient } from './cline-client'
import { logger } from '../utils/logger'

export type Provider = 'ANTHROPIC' | 'OPENAI' | 'CLINE'

export async function configureProvider(
  client: ClineClient,
  provider: Provider,
  apiKey?: string
): Promise<void> {
  const config: any = {
    metadata: {},
    secrets: {},
    options: {}
  }
  
  switch (provider) {
    case 'ANTHROPIC':
      config.secrets.apiKey = apiKey || process.env.ANTHROPIC_API_KEY
      config.options.actModeApiProvider = 'ANTHROPIC'
      config.options.actModeApiModelId = 'claude-3-5-sonnet-20241022'
      break
    case 'OPENAI':
      config.secrets.openAiNativeApiKey = apiKey || process.env.OPENAI_API_KEY
      config.options.actModeApiProvider = 'OPENAI'
      config.options.actModeApiModelId = 'gpt-4'
      break
    case 'CLINE':
      config.secrets.clineApiKey = apiKey || process.env.CLINE_API_KEY
      config.options.actModeApiProvider = 'CLINE'
      break
    default:
      throw new Error(`Unknown provider: ${provider}`)
  }
  
  try {
    await client.updateApiConfiguration(config.secrets, config.options)
    logger.info('Provider configured', { provider })
  } catch (error: any) {
    logger.error('Failed to configure provider', { error: error.message, provider })
    throw error
  }
}

