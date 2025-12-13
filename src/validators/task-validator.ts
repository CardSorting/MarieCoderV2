import { ValidationError } from "../errors"
import { CreateTaskRequest } from "../types"
import { validateArray, validateOptional, validateString } from "./common"

export function validateCreateTaskRequest(body: unknown): CreateTaskRequest {
	if (typeof body !== "object" || body === null) {
		throw new ValidationError("Request body must be an object")
	}

	const request = body as Record<string, unknown>

	// Validate prompt (required)
	const prompt = validateString(request.prompt, "prompt", 1, 10000)

	// Validate files (optional array)
	const files = validateOptional(request.files, (val) =>
		validateArray(val, "files", 50, (item) => {
			if (typeof item !== "string") {
				throw new ValidationError("Each file path must be a string")
			}
			return item
		}),
	)

	// Validate provider (optional, must be OPENROUTER)
	const provider = validateOptional(request.provider, (val) => {
		if (val !== "OPENROUTER") {
			throw new ValidationError("provider must be OPENROUTER")
		}
		return val as "OPENROUTER"
	})

	// Validate apiKey (optional string)
	const apiKey = validateOptional(request.apiKey, (val) => {
		if (typeof val !== "string") {
			throw new ValidationError("apiKey must be a string")
		}
		return val
	})

	return {
		prompt,
		files,
		provider: provider || "OPENROUTER",
		apiKey,
	}
}
