"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useAuthStore } from "@/stores/auth-store"

interface AuthGuardProps {
	children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
	const router = useRouter()
	const { isAuthenticated, loadUser } = useAuthStore()

	useEffect(() => {
		// Try to load user from stored token
		if (typeof window !== "undefined") {
			const token = localStorage.getItem("auth_token")
			if (token && !isAuthenticated) {
				loadUser().catch(() => {
					router.replace("/login")
				})
			} else if (!token && !isAuthenticated) {
				router.replace("/login")
			}
		}
	}, [isAuthenticated, loadUser, router])

	if (!isAuthenticated) {
		return (
			<div className="h-screen flex items-center justify-center bg-bg-primary">
				<div className="flex flex-col items-center gap-4">
					<svg className="w-16 h-16 text-accent-bright animate-pulse" fill="currentColor" viewBox="0 0 24 24">
						<path d="M12 2L14.5 8L21 9L16 14L17.5 21L12 17.5L6.5 21L8 14L3 9L9.5 8L12 2Z" />
					</svg>
					<div className="w-6 h-6 border-2 border-border-primary border-t-accent-bright rounded-full animate-spin" />
				</div>
			</div>
		)
	}

	return <>{children}</>
}
