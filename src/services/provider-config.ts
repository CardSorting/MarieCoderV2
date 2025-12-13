import { configService } from "../config"
import { UpdateApiConfigurationRequest } from "../types/grpc"
import { logger } from "../utils/logger"
import { ClineClient } from "./cline-client"

export type Provider = "ANTHROPIC" | "OPENAI" | "CLINE"

export async function configureProvider(client: ClineClient, provider: Provider, apiKey?: string): Promise<void> {
	const apiKeys = configService.getApiKeys()
	const config: UpdateApiConfigurationRequest = {
		metadata: {},
		secrets: {},
		options: {},
	}

	switch (provider) {
		case "ANTHROPIC":
			config.secrets.apiKey = apiKey || apiKeys.anthropic
			config.options.actModeApiProvider = "ANTHROPIC"
			config.options.actModeApiModelId = "claude-3-5-sonnet-20241022"
			break
		case "OPENAI":
			config.secrets.openAiNativeApiKey = apiKey || apiKeys.openai
			config.options.actModeApiProvider = "OPENAI"
			config.options.actModeApiModelId = "gpt-4"
			break
		case "CLINE":
			// For Cline provider, use API key from environment or provided parameter
			if (apiKey) {
				config.secrets.clineApiKey = apiKey.startsWith("workos:") ? apiKey : `workos:${apiKey}`
			} else if (apiKeys.cline) {
				config.secrets.clineApiKey = apiKeys.cline
			} else {
				throw new Error("Cline API key is required for CLINE provider. Set CLINE_API_KEY environment variable or provide apiKey parameter.")
			}
			config.options.actModeApiProvider = "CLINE"
			break
		default:
			throw new Error(`Unknown provider: ${provider}`)
	}

	try {
		await client.updateApiConfiguration(config.secrets, config.options)
		logger.info("Provider configured", { provider })
	} catch (error: unknown) {
		const errorMessage = error instanceof Error ? error.message : "Unknown error"
		logger.error("Failed to configure provider", { error: errorMessage, provider })
		throw error
	}
}
