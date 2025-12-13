"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button, Input } from "@/components/ui/primitives"
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
		<div className="min-h-screen bg-surface-primary flex">
			{/* Left Panel - Branding */}
			<div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
				{/* Background Effects */}
				<div className="absolute inset-0 bg-gradient-to-br from-accent-primary/20 via-surface-primary to-accent-cyan/20" />
				<div className="absolute inset-0 bg-grid opacity-30" />
				<div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-primary/30 rounded-full blur-[128px] animate-float" />
				<div
					className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-cyan/30 rounded-full blur-[128px] animate-float"
					style={{ animationDelay: "-3s" }}
				/>

				{/* Content */}
				<div className="relative z-10 flex flex-col justify-between p-12 w-full">
					{/* Logo */}
					<Link className="flex items-center gap-3 group" href="/">
						<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-primary to-accent-cyan flex items-center justify-center transition-transform group-hover:scale-105">
							<svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
								<path d="M12 2L14.5 8L21 9L16 14L17.5 21L12 17.5L6.5 21L8 14L3 9L9.5 8L12 2Z" />
							</svg>
						</div>
						<span className="text-xl font-bold text-text-bright">Cline IDE</span>
					</Link>

					{/* Main Message */}
					<div className="max-w-md">
						<h1 className="text-4xl font-bold text-text-bright mb-4 leading-tight">
							Build the future with
							<span className="gradient-text"> AI-powered</span> development
						</h1>
						<p className="text-text-secondary text-lg leading-relaxed">
							Join thousands of developers creating production-ready applications in minutes, not months.
						</p>

						{/* Stats */}
						<div className="flex gap-8 mt-10">
							<div>
								<div className="text-3xl font-bold text-text-bright">50K+</div>
								<div className="text-sm text-text-muted">Developers</div>
							</div>
							<div>
								<div className="text-3xl font-bold text-text-bright">1M+</div>
								<div className="text-sm text-text-muted">Projects</div>
							</div>
							<div>
								<div className="text-3xl font-bold text-text-bright">99.9%</div>
								<div className="text-sm text-text-muted">Uptime</div>
							</div>
						</div>
					</div>

					{/* Testimonial */}
					<div className="max-w-md p-6 rounded-2xl bg-surface-secondary/50 border border-border-primary backdrop-blur-sm">
						<div className="flex gap-1 mb-3">
							{[...Array(5)].map((_, i) => (
								<svg className="w-4 h-4 text-accent-amber" fill="currentColor" key={i} viewBox="0 0 20 20">
									<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
								</svg>
							))}
						</div>
						<p className="text-text-primary text-sm leading-relaxed mb-4">
							"Cline has completely changed how our team builds software. We shipped our MVP in 2 weeks instead of 2
							months."
						</p>
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-primary to-accent-cyan flex items-center justify-center text-white font-medium text-sm">
								S
							</div>
							<div>
								<div className="text-text-bright font-medium text-sm">Sarah Chen</div>
								<div className="text-text-muted text-xs">CTO at TechStartup</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Right Panel - Auth Form */}
			<div className="flex-1 flex items-center justify-center p-6 lg:p-12">
				<div className="w-full max-w-md">
					{/* Mobile Logo */}
					<div className="lg:hidden mb-8 text-center">
						<Link className="inline-flex items-center gap-3 group" href="/">
							<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-primary to-accent-cyan flex items-center justify-center transition-transform group-hover:scale-105">
								<svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
									<path d="M12 2L14.5 8L21 9L16 14L17.5 21L12 17.5L6.5 21L8 14L3 9L9.5 8L12 2Z" />
								</svg>
							</div>
							<span className="text-xl font-bold text-text-bright">Cline IDE</span>
						</Link>
					</div>

					{/* Form Header */}
					<div className="text-center lg:text-left mb-8">
						<h2 className="text-2xl font-bold text-text-bright mb-2">
							{isLogin ? "Welcome back" : "Create your account"}
						</h2>
						<p className="text-text-secondary">
							{isLogin
								? "Sign in to continue building amazing things"
								: "Get started with AI-powered development for free"}
						</p>
					</div>

					{/* Auth Card */}
					<div className="bg-surface-secondary border border-border-primary rounded-2xl p-8">
						{error && (
							<div className="mb-6 p-4 rounded-xl bg-accent-rose/10 border border-accent-rose/30 text-accent-rose text-sm flex items-start gap-3">
								<svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
									/>
								</svg>
								{error}
							</div>
						)}

						<form className="space-y-5" onSubmit={handleSubmit}>
							<div>
								<label className="block text-sm font-medium text-text-secondary mb-2">Username</label>
								<Input
									className="h-11"
									onChange={(e) => setUsername(e.target.value)}
									placeholder="Enter your username"
									required
									type="text"
									value={username}
								/>
							</div>

							{!isLogin && (
								<div className="animate-fade-in-down">
									<label className="block text-sm font-medium text-text-secondary mb-2">Email</label>
									<Input
										className="h-11"
										onChange={(e) => setEmail(e.target.value)}
										placeholder="you@example.com"
										required
										type="email"
										value={email}
									/>
								</div>
							)}

							<div>
								<div className="flex items-center justify-between mb-2">
									<label className="block text-sm font-medium text-text-secondary">Password</label>
									{isLogin && (
										<button className="text-xs text-accent-primary hover:underline" type="button">
											Forgot password?
										</button>
									)}
								</div>
								<Input
									className="h-11"
									minLength={isLogin ? undefined : 8}
									onChange={(e) => setPassword(e.target.value)}
									placeholder={isLogin ? "Enter your password" : "Create a password (min. 8 chars)"}
									required
									type="password"
									value={password}
								/>
							</div>

							<Button
								className="w-full h-11 glow-on-hover"
								disabled={loading}
								isLoading={loading}
								size="lg"
								type="submit"
								variant="primary">
								{isLogin ? "Sign In" : "Create Account"}
							</Button>
						</form>

						{/* Divider */}
						<div className="relative my-6">
							<div className="absolute inset-0 flex items-center">
								<div className="w-full border-t border-border-primary" />
							</div>
							<div className="relative flex justify-center text-xs">
								<span className="px-3 bg-surface-secondary text-text-muted">Or continue with</span>
							</div>
						</div>

						{/* Social Auth Buttons */}
						<div className="grid grid-cols-2 gap-3">
							<button
								className="flex items-center justify-center gap-2 h-11 rounded-lg bg-surface-tertiary border border-border-primary text-text-primary text-sm font-medium hover:bg-surface-elevated transition-colors disabled:opacity-50"
								disabled
								type="button">
								<svg className="w-5 h-5" viewBox="0 0 24 24">
									<path
										d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
										fill="#4285F4"
									/>
									<path
										d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
										fill="#34A853"
									/>
									<path
										d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
										fill="#FBBC05"
									/>
									<path
										d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
										fill="#EA4335"
									/>
								</svg>
								Google
							</button>
							<button
								className="flex items-center justify-center gap-2 h-11 rounded-lg bg-surface-tertiary border border-border-primary text-text-primary text-sm font-medium hover:bg-surface-elevated transition-colors disabled:opacity-50"
								disabled
								type="button">
								<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
									<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
								</svg>
								GitHub
							</button>
						</div>

						{/* Toggle Auth Mode */}
						<div className="mt-6 text-center">
							<button
								className="text-sm text-text-secondary hover:text-text-primary transition-colors"
								onClick={() => {
									setIsLogin(!isLogin)
									setError("")
									setUsername("")
									setEmail("")
									setPassword("")
								}}
								type="button">
								{isLogin ? (
									<>
										Don't have an account?{" "}
										<span className="text-accent-primary font-medium">Sign up for free</span>
									</>
								) : (
									<>
										Already have an account? <span className="text-accent-primary font-medium">Sign in</span>
									</>
								)}
							</button>
						</div>
					</div>

					{/* Footer */}
					<div className="mt-8 text-center">
						<p className="text-xs text-text-muted">
							By continuing, you agree to our{" "}
							<Link className="text-accent-primary hover:underline" href="/terms">
								Terms of Service
							</Link>{" "}
							and{" "}
							<Link className="text-accent-primary hover:underline" href="/privacy">
								Privacy Policy
							</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}
