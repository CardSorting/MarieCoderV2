"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { useAuthStore } from "@/stores/auth-store"

function SettingsContent() {
	const router = useRouter()
	const { logout, user } = useAuthStore()
	const [openRouterApiKey, setOpenRouterApiKey] = useState("")
	const [saved, setSaved] = useState(false)
	const [error, setError] = useState("")

	useEffect(() => {
		// Load existing API key from localStorage
		const stored = localStorage.getItem("openrouter_api_key")
		if (stored) {
			setOpenRouterApiKey(stored)
		}
	}, [])

	const handleSave = (e: React.FormEvent) => {
		e.preventDefault()
		setError("")
		setSaved(false)

		if (!openRouterApiKey.trim()) {
			setError("OpenRouter API key is required")
			return
		}

		// Save to localStorage
		localStorage.setItem("openrouter_api_key", openRouterApiKey.trim())
		setSaved(true)

		// Clear saved message after 3 seconds
		setTimeout(() => setSaved(false), 3000)
	}

	const handleClear = () => {
		localStorage.removeItem("openrouter_api_key")
		setOpenRouterApiKey("")
		setSaved(false)
		setError("")
	}

	return (
		<div className="min-h-screen bg-bg-primary text-text-primary">
			{/* Header */}
			<header className="bg-bg-secondary border-b border-border-primary px-6 py-4 flex justify-between items-center">
				<div className="flex items-center gap-3">
					<svg className="w-8 h-8 text-accent-bright" fill="currentColor" viewBox="0 0 24 24">
						<path d="M12 2L14.5 8L21 9L16 14L17.5 21L12 17.5L6.5 21L8 14L3 9L9.5 8L12 2Z" />
					</svg>
					<h1 className="text-2xl font-bold text-text-bright">Cline IDE</h1>
				</div>
				<div className="flex items-center gap-4">
					<button className="btn btn-secondary" onClick={() => router.push("/projects")}>
						Back to Projects
					</button>
					<span className="text-sm text-text-secondary">Welcome, {user?.username || user?.email || "User"}</span>
					<button className="btn btn-secondary" onClick={logout}>
						Logout
					</button>
				</div>
			</header>

			{/* Main content */}
			<main className="max-w-2xl mx-auto px-6 py-8">
				<h2 className="text-2xl font-semibold text-text-bright mb-6">Settings</h2>

				<div className="bg-bg-secondary border border-border-primary rounded-lg p-6">
					<h3 className="text-lg font-semibold text-text-bright mb-4">OpenRouter API Key</h3>
					<p className="text-sm text-text-secondary mb-4">
						Enter your OpenRouter API key to use AI models. Your API key is stored locally in your browser and will be
						used for all AI tasks.
					</p>

					{saved && (
						<div className="mb-4 p-3 bg-success/20 border border-success/30 rounded-md text-success text-sm">
							API key saved successfully!
						</div>
					)}

					{error && (
						<div className="mb-4 p-3 bg-error/20 border border-error/30 rounded-md text-error text-sm">{error}</div>
					)}

					<form onSubmit={handleSave}>
						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-text-secondary mb-2">API Key</label>
								<input
									className="input"
									onChange={(e) => setOpenRouterApiKey(e.target.value)}
									placeholder="sk-or-v1-..."
									type="password"
									value={openRouterApiKey}
								/>
								<p className="mt-2 text-xs text-text-muted">
									Get your API key from{" "}
									<a
										className="text-text-accent hover:text-accent-hover underline"
										href="https://openrouter.ai/keys"
										rel="noopener noreferrer"
										target="_blank">
										openrouter.ai/keys
									</a>
								</p>
							</div>
						</div>
						<div className="flex gap-3 mt-6">
							<button className="btn btn-secondary" onClick={handleClear} type="button">
								Clear
							</button>
							<button
								className="btn btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
								disabled={!openRouterApiKey.trim()}
								type="submit">
								Save
							</button>
						</div>
					</form>
				</div>
			</main>
		</div>
	)
}

export default function SettingsPage() {
	return (
		<AuthGuard>
			<SettingsContent />
		</AuthGuard>
	)
}
