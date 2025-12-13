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

	// Validate provider (optional, must be one of the allowed values)
	const provider = validateOptional(request.provider, (val) => {
		if (val !== "ANTHROPIC" && val !== "OPENAI" && val !== "CLINE") {
			throw new ValidationError("provider must be one of: ANTHROPIC, OPENAI, CLINE")
		}
		return val as "ANTHROPIC" | "OPENAI" | "CLINE"
	})

	return {
		prompt,
		files,
		provider: provider || "ANTHROPIC",
	}
}
