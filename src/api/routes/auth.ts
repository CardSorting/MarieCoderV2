import { Router } from "express"
import { clineAuthService } from "../../services/cline-auth-service"
import { dbService } from "../../services/db-service"
import { logger } from "../../utils/logger"
import { AuthRequest, authenticate } from "../middleware/auth"

const router = Router()

// Get Cline OAuth authorization URL
router.get("/authorize", async (req, res, next) => {
	try {
		// Frontend callback URL (where to redirect after auth completes)
		const frontendCallbackUrl = (req.query.callback_url as string) || `${process.env.FRONTEND_URL || "http://localhost:5173"}/auth/callback`
		
		// For web clients, Cline's OAuth redirects to their callback first
		// We need to use the frontend callback URL so Cline can redirect there after processing
		// The frontend will then exchange the code via our backend
		const callbackUrl = frontendCallbackUrl
		
		// Store backend info in state for frontend to use when exchanging code
		const state = Buffer.from(JSON.stringify({ 
			frontendCallbackUrl,
			backendUrl: `${req.protocol}://${req.get("host")}`
		})).toString('base64')
		
		// Get auth URL from Cline API using frontend callback
		// Cline will redirect to frontend, which will then call backend to exchange code
		const authUrl = await clineAuthService.getAuthUrl(callbackUrl, state)

		res.json({ authUrl })
	} catch (error) {
		next(error)
	}
})

// OAuth callback - exchange code for tokens
router.get("/callback", async (req, res, _next) => {
	try {
		const { code, provider, state } = req.query

		if (!code || typeof code !== "string") {
			return res.status(400).json({ error: "Authorization code is required" })
		}

		const callbackUrl = `${req.protocol}://${req.get("host")}/api/v1/auth/callback`

		const tokens = await clineAuthService.exchangeCodeForTokens(code, callbackUrl, provider as string)

		// Store tokens in database (link to user)
		// For now, we'll store the access token and user info
		// In production, you'd want to encrypt these
		const userId = tokens.userInfo?.id || tokens.userInfo?.clineUserId || "unknown"

		// Create or update user in our database
		let user = dbService.getUserById(userId)
		if (!user) {
			// Create user from Cline auth
			user = dbService.createUser({
				id: userId,
				username: tokens.userInfo?.email?.split("@")[0] || "user",
				email: tokens.userInfo?.email || "",
				password_hash: "", // No password needed for OAuth
			})
		}

		// Extract frontend callback URL from state if provided
		let frontendCallbackUrl = process.env.FRONTEND_URL || "http://localhost:5173"
		if (state && typeof state === "string") {
			try {
				const stateData = JSON.parse(Buffer.from(state, "base64").toString())
				if (stateData.frontendCallbackUrl) {
					frontendCallbackUrl = stateData.frontendCallbackUrl
				}
			} catch {
				// Invalid state, use default
			}
		}

		// Redirect to frontend with token
		// Ensure we're redirecting to the auth/callback route
		const frontendCallbackPath = frontendCallbackUrl.includes('/auth/callback') 
			? frontendCallbackUrl 
			: `${frontendCallbackUrl}/auth/callback`
		res.redirect(
			`${frontendCallbackPath}?token=${encodeURIComponent(tokens.accessToken)}&refreshToken=${encodeURIComponent(tokens.refreshToken)}`,
		)
	} catch (error) {
		logger.error("OAuth callback error", { error })
		const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173"
		res.redirect(`${frontendUrl}/login?error=auth_failed`)
	}
})

// Exchange code for tokens (POST endpoint for flexibility)
router.post("/token", async (req, res, next) => {
	try {
		const { code, callback_url, provider } = req.body

		if (!code) {
			return res.status(400).json({ error: "Authorization code is required" })
		}

		const callbackUrl = callback_url || `${req.protocol}://${req.get("host")}/api/v1/auth/callback`

		const tokens = await clineAuthService.exchangeCodeForTokens(code, callbackUrl, provider)

		res.json({
			accessToken: tokens.accessToken,
			refreshToken: tokens.refreshToken,
			expiresAt: tokens.expiresAt,
			user: tokens.userInfo,
		})
	} catch (error) {
		next(error)
	}
})

// Refresh access token
router.post("/refresh", async (req, res, next) => {
	try {
		const { refreshToken } = req.body

		if (!refreshToken) {
			return res.status(400).json({ error: "Refresh token is required" })
		}

		const tokens = await clineAuthService.refreshToken(refreshToken)

		res.json({
			accessToken: tokens.accessToken,
			refreshToken: tokens.refreshToken,
			expiresAt: tokens.expiresAt,
			user: tokens.userInfo,
		})
	} catch (error) {
		next(error)
	}
})

// Get current user (requires Cline authentication)
router.get("/me", authenticate, async (req: AuthRequest, res, next) => {
	try {
		const token = req.headers.authorization?.replace("Bearer ", "")

		if (!token) {
			return res.status(401).json({ error: "Unauthorized" })
		}

		const userInfo = await clineAuthService.getUserInfo(token)
		res.json({ user: userInfo })
	} catch (error) {
		next(error)
	}
})

export default router
