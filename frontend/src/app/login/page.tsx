"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useAuthStore } from "@/stores/auth-store"

export default function LoginPage() {
	const [error, setError] = useState("")
	const [loading, setLoading] = useState(false)
	const [isLogin, setIsLogin] = useState(true)
	const [username, setUsername] = useState("")
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const { isAuthenticated, login, register } = useAuthStore()
	const router = useRouter()

	useEffect(() => {
		if (isAuthenticated) {
			router.push("/projects")
		}
	}, [isAuthenticated, router])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError("")
		setLoading(true)

		try {
			if (isLogin) {
				await login(username, password)
			} else {
				if (!email.trim()) {
					setError("Email is required for registration")
					setLoading(false)
					return
				}
				await register(username, email, password)
			}
			router.push("/projects")
		} catch (err: unknown) {
			const errorMessage = err instanceof Error ? err.message : "Failed to authenticate. Please try again."
			setError(errorMessage)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-bg-primary">
			<div className="max-w-md w-full space-y-8 p-8 bg-bg-secondary rounded-lg shadow-lg border border-border-primary">
				<div>
					<div className="flex justify-center mb-6">
						<svg className="w-16 h-16 text-accent-bright" fill="currentColor" viewBox="0 0 24 24">
							<path d="M12 2L14.5 8L21 9L16 14L17.5 21L12 17.5L6.5 21L8 14L3 9L9.5 8L12 2Z" />
						</svg>
					</div>
					<h2 className="text-2xl font-bold text-center text-text-bright">{isLogin ? "Sign in" : "Create account"}</h2>
					<p className="mt-2 text-center text-sm text-text-secondary">
						{isLogin ? "Sign in to your account to continue" : "Create a new account to get started"}
					</p>
				</div>

				{error && (
					<div className="text-error text-sm text-center bg-error/20 p-3 rounded-md border border-error/30">
						{error}
					</div>
				)}

				<form className="space-y-4" onSubmit={handleSubmit}>
					<div>
						<label className="block text-sm font-medium text-text-secondary mb-2">Username</label>
						<input
							className="input"
							onChange={(e) => setUsername(e.target.value)}
							placeholder="Enter your username"
							required
							type="text"
							value={username}
						/>
					</div>

					{!isLogin && (
						<div>
							<label className="block text-sm font-medium text-text-secondary mb-2">Email</label>
							<input
								className="input"
								onChange={(e) => setEmail(e.target.value)}
								placeholder="Enter your email"
								required
								type="email"
								value={email}
							/>
						</div>
					)}

					<div>
						<label className="block text-sm font-medium text-text-secondary mb-2">Password</label>
						<input
							className="input"
							minLength={isLogin ? undefined : 8}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="Enter your password"
							required
							type="password"
							value={password}
						/>
						{!isLogin && <p className="mt-1 text-xs text-text-muted">Password must be at least 8 characters</p>}
					</div>

					<button
						className="w-full py-3 px-4 rounded-md text-sm font-medium text-text-bright bg-accent-primary hover:bg-accent-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-bright disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-fast"
						disabled={loading}
						type="submit">
						{loading ? (
							<span className="flex items-center justify-center gap-2">
								<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-text-bright" />
								{isLogin ? "Signing in..." : "Creating account..."}
							</span>
						) : (
							<span>{isLogin ? "Sign in" : "Create account"}</span>
						)}
					</button>
				</form>

				<div className="text-center">
					<button
						className="text-sm text-text-accent hover:text-accent-hover transition-colors duration-fast"
						onClick={() => {
							setIsLogin(!isLogin)
							setError("")
							setUsername("")
							setEmail("")
							setPassword("")
						}}
						type="button">
						{isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
					</button>
				</div>
			</div>
		</div>
	)
}
