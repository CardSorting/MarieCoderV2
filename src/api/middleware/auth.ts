import { NextFunction, Request, Response } from "express"
import { clineAuthService } from "../../services/cline-auth-service"
import { logger } from "../../utils/logger"

export interface AuthRequest extends Request {
	userId?: string
	user?: {
		id: string
		email: string
		name?: string
	}
	clineToken?: string
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
	const authHeader = req.headers.authorization

	if (!authHeader?.startsWith("Bearer ")) {
		logger.warn("Unauthorized request - no token", { path: req.path })
		return res.status(401).json({ error: "Unauthorized" })
	}

	const token = authHeader.substring(7)

	// Verify token with Cline API
	clineAuthService
		.verifyToken(token)
		.then((isValid) => {
			if (!isValid) {
				logger.warn("Invalid Cline token", { path: req.path })
				return res.status(401).json({ error: "Invalid token" })
			}

			// Get user info from token
			clineAuthService
				.getUserInfo(token)
				.then((userInfo) => {
					req.userId = userInfo.id
					req.user = {
						id: userInfo.id,
						email: userInfo.email,
						name: userInfo.name,
					}
					req.clineToken = token
					next()
				})
				.catch((error) => {
					const errorMessage = error instanceof Error ? error.message : "Unknown error"
					logger.warn("Failed to get user info", { error: errorMessage })
					return res.status(401).json({ error: "Invalid token" })
				})
		})
		.catch((error) => {
			const errorMessage = error instanceof Error ? error.message : "Unknown error"
			logger.warn("Token verification failed", { error: errorMessage })
			return res.status(401).json({ error: "Invalid token" })
		})
}

export function requireRole(..._roles: string[]) {
	// Note: Role-based access control not implemented for Cline OAuth
	// This function is kept for compatibility but always allows access for authenticated users
	return (req: AuthRequest, res: Response, next: NextFunction) => {
		if (!req.user) {
			return res.status(401).json({ error: "Unauthorized" })
		}

		// For now, all authenticated users have access
		// Can be extended later with organization-based permissions from Cline
		next()
	}
}
