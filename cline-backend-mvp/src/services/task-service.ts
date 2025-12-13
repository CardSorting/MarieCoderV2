import { InstanceNotFoundError } from "../errors/instance-error"
import { instanceManager } from "../index"
import { CreateTaskRequest, CreateTaskResponse } from "../types"
import { logger } from "../utils/logger"
import { metrics } from "../utils/metrics"
import { clientFactory } from "./cline-client-factory"
import { configureProvider } from "./provider-config"

export class TaskService {
	async createTask(userId: string, projectId: string, request: CreateTaskRequest): Promise<CreateTaskResponse> {
		const startTime = Date.now()

		logger.info("Creating task", { userId, projectId, provider: request.provider })

		// Get or create instance
		const instanceStartTime = Date.now()
		const instance = await instanceManager.startInstance(userId, projectId)
		metrics.instanceStartDuration.observe(Date.now() - instanceStartTime)
		metrics.activeInstances.set(instanceManager.getInstanceCount())

		// Get client from factory (with connection pooling)
		const client = await clientFactory.getClient(instance.address)

		// Configure provider (idempotent - safe to call multiple times)
		// Use API key from request if provided, otherwise fall back to environment variable
		await configureProvider(client, request.provider || "OPENROUTER", request.apiKey)

		// Create task
		const taskId = await client.createTask(request.prompt, request.files)
		metrics.tasksCreated.inc({ provider: request.provider || "OPENROUTER" })

		const duration = Date.now() - startTime
		logger.info("Task created", { taskId, userId, projectId, duration })

		return {
			taskId,
			instanceId: instance.instanceId,
			status: "created",
			estimatedDuration: "30-60 seconds",
		}
	}

	async getTask(userId: string, projectId: string, taskId: string): Promise<unknown> {
		const instanceId = `${userId}-${projectId}`
		const instance = instanceManager.getInstance(instanceId)

		if (!instance) {
			throw new InstanceNotFoundError(instanceId)
		}

		const client = await clientFactory.getClient(instance.address)
		return await client.getTask(taskId)
	}
}

// Singleton instance
export const taskService = new TaskService()
