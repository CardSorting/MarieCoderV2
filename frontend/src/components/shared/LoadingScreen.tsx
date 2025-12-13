/**
 * Loading Screen Component
 * Full-screen loading state with branded spinner
 */

"use client"

import { memo } from "react"

export const LoadingScreen = memo(function LoadingScreen() {
	return (
		<div aria-label="Loading" className="h-screen flex items-center justify-center bg-surface-primary" role="status">
			<div className="flex flex-col items-center gap-4">
				<div className="relative">
					<div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-primary to-accent-cyan flex items-center justify-center animate-pulse">
						<svg aria-hidden="true" className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
							<path d="M12 2L14.5 8L21 9L16 14L17.5 21L12 17.5L6.5 21L8 14L3 9L9.5 8L12 2Z" />
						</svg>
					</div>
				</div>
				<div className="w-6 h-6 border-2 border-border-primary border-t-accent-primary rounded-full animate-spin" />
				<span className="sr-only">Loading...</span>
			</div>
		</div>
	)
})
