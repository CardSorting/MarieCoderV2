import { configService } from "../config"
import { UpdateApiConfigurationRequest } from "../types/grpc"
import { logger } from "../utils/logger"
import { ClineClient } from "./cline-client"

export type Provider = "OPENROUTER"

export async function configureProvider(client: ClineClient, provider: Provider, apiKey?: string): Promise<void> {
	const apiKeys = configService.getApiKeys()
	const config: UpdateApiConfigurationRequest = {
		metadata: {},
		secrets: {},
		options: {},
	}

	if (provider !== "OPENROUTER") {
		throw new Error(`Unsupported provider: ${provider}. Only OPENROUTER is supported.`)
	}

	// For OpenRouter provider, use API key from environment or provided parameter
	if (apiKey) {
		config.secrets.openRouterApiKey = apiKey
	} else if (apiKeys.openrouter) {
		config.secrets.openRouterApiKey = apiKeys.openrouter
	} else {
		throw new Error("OpenRouter API key is required. Set OPENROUTER_API_KEY environment variable or provide apiKey parameter.")
	}
	config.options.actModeApiProvider = "openrouter" // Provider name must be lowercase
	config.options.actModeApiModelId = "openai/gpt-4" // Default model for OpenRouter

	try {
		await client.updateApiConfiguration(config.secrets, config.options)
		logger.info("Provider configured", { provider })
	} catch (error: unknown) {
		const errorMessage = error instanceof Error ? error.message : "Unknown error"
		logger.error("Failed to configure provider", { error: errorMessage, provider })
		throw error
	}
}
