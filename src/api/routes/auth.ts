import { Router } from "express"
import { jwtService } from "../../services/jwt-service"
import { userService } from "../../services/user-service"
import { logger } from "../../utils/logger"
import { AuthRequest, authenticate } from "../middleware/auth"

const router = Router()

// Register a new user
router.post("/register", async (req, res, next) => {
	try {
		const { username, email, password } = req.body

		if (!username || !email || !password) {
			return res.status(400).json({ error: "Username, email, and password are required" })
		}

		const user = await userService.register({ username, email, password })
		const tokenResponse = jwtService.generateToken({
			userId: user.id,
			username: user.username,
			email: user.email,
		})

		logger.info("User registered", { userId: user.id, username: user.username })

		res.status(201).json({
			token: tokenResponse.token,
			expiresIn: tokenResponse.expiresIn,
			user: {
				id: user.id,
				username: user.username,
				email: user.email,
			},
		})
	} catch (error) {
		next(error)
	}
})

// Login user
router.post("/login", async (req, res, next) => {
	try {
		const { username, password } = req.body

		if (!username || !password) {
			return res.status(400).json({ error: "Username and password are required" })
		}

		const user = await userService.login({ username, password })
		const tokenResponse = jwtService.generateToken({
			userId: user.id,
			username: user.username,
			email: user.email,
		})

		logger.info("User logged in", { userId: user.id, username: user.username })

		res.json({
			token: tokenResponse.token,
			expiresIn: tokenResponse.expiresIn,
			user: {
				id: user.id,
				username: user.username,
				email: user.email,
			},
		})
	} catch (error) {
		next(error)
	}
})

// Get current user (requires authentication)
router.get("/me", authenticate, async (req: AuthRequest, res, next) => {
	try {
		if (!req.user) {
			return res.status(401).json({ error: "Unauthorized" })
		}

		res.json({ user: req.user })
	} catch (error) {
		next(error)
	}
})

export default router
