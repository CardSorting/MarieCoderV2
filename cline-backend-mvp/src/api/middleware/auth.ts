import { NextFunction, Request, Response } from "express"
import { jwtService } from "../../services/jwt-service"
import { logger } from "../../utils/logger"

export interface AuthRequest extends Request {
	userId?: string
	user?: {
		id: string
		email: string
		username: string
	}
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
	const authHeader = req.headers.authorization

	if (!authHeader?.startsWith("Bearer ")) {
		logger.warn("Unauthorized request - no token", { path: req.path })
		return res.status(401).json({ error: "Unauthorized" })
	}

	const token = authHeader.substring(7)

	try {
		// Verify and decode JWT token
		const payload = jwtService.verifyToken(token)

		// Attach user info to request
		req.userId = payload.userId
		req.user = {
			id: payload.userId,
			email: payload.email,
			username: payload.username,
		}

		next()
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : "Unknown error"
		logger.warn("Token verification failed", { error: errorMessage, path: req.path })
		return res.status(401).json({ error: "Invalid or expired token" })
	}
}

export function requireRole(..._roles: string[]) {
	// Role-based access control - can be extended later
	return (req: AuthRequest, res: Response, next: NextFunction) => {
		if (!req.user) {
			return res.status(401).json({ error: "Unauthorized" })
		}

		// For now, all authenticated users have access
		// Can be extended later with role-based permissions
		next()
	}
}
