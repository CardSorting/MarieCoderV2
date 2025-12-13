import { randomUUID } from "crypto"
import { ValidationError } from "../errors/validation-error"
import { instanceManager } from "../index"
import { logger } from "../utils/logger"
import { dbService, Project } from "./db-service"

export class ProjectService {
	/**
	 * Create a new project
	 */
	async createProject(userId: string, name: string, description?: string): Promise<Project> {
		if (!name || name.trim().length === 0) {
			throw new ValidationError("Project name is required")
		}

		if (name.length > 100) {
			throw new ValidationError("Project name must be less than 100 characters")
		}

		const projectId = randomUUID()
		const project = dbService.createProject({
			id: projectId,
			user_id: userId,
			name: name.trim(),
			description: description?.trim(),
		})

		// Create workspace for the project (instance will be created on first task)
		// Don't create instance here to avoid failures if standalone isn't built
		logger.info("Project created", { userId, projectId, name })

		return project
	}

	/**
	 * Get project by ID
	 */
	async getProject(userId: string, projectId: string): Promise<Project> {
		const project = dbService.getProjectById(projectId)

		if (!project) {
			throw new ValidationError("Project not found")
		}

		if (project.user_id !== userId) {
			throw new ValidationError("Access denied")
		}

		return project
	}

	/**
	 * List user's projects
	 */
	async listProjects(userId: string): Promise<Project[]> {
		return dbService.getProjectsByUserId(userId)
	}

	/**
	 * Update project
	 */
	async updateProject(userId: string, projectId: string, updates: { name?: string; description?: string }): Promise<Project> {
		// Verify ownership
		await this.getProject(userId, projectId)

		return dbService.updateProject(projectId, updates)
	}

	/**
	 * Delete project
	 */
	async deleteProject(userId: string, projectId: string): Promise<void> {
		// Verify ownership
		await this.getProject(userId, projectId)

		// Stop and remove instance
		try {
			await instanceManager.stopInstance(`${userId}-${projectId}`)
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Unknown error"
			logger.warn("Failed to stop instance when deleting project", {
				userId,
				projectId,
				error: errorMessage,
			})
		}

		// Delete from database
		dbService.deleteProject(projectId)

		logger.info("Project deleted", { userId, projectId })
	}
}

// Singleton instance
export const projectService = new ProjectService()
