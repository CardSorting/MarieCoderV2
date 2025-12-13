/**
 * Error Boundary Component
 * Catches and displays React errors gracefully
 */

"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"
import { Button } from "@/components/ui/primitives"

interface Props {
	children: ReactNode
	fallback?: ReactNode
}

interface State {
	hasError: boolean
	error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props)
		this.state = { hasError: false }
	}

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error }
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error("ErrorBoundary caught an error:", error, errorInfo)
	}

	render() {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback
			}

			return (
				<div className="min-h-screen flex items-center justify-center bg-surface-primary p-4">
					<div className="max-w-md w-full text-center">
						<div className="w-16 h-16 rounded-2xl bg-accent-rose/20 flex items-center justify-center mx-auto mb-6">
							<svg className="w-8 h-8 text-accent-rose" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
								/>
							</svg>
						</div>
						<h1 className="text-2xl font-bold text-text-bright mb-2">Something went wrong</h1>
						<p className="text-text-secondary mb-6">
							{this.state.error?.message || "An unexpected error occurred. Please try refreshing the page."}
						</p>
						<div className="flex gap-3 justify-center">
							<Button
								onClick={() => {
									this.setState({ hasError: false, error: undefined })
									window.location.reload()
								}}
								variant="primary">
								Refresh Page
							</Button>
							<Button onClick={() => (window.location.href = "/")} variant="secondary">
								Go Home
							</Button>
						</div>
					</div>
				</div>
			)
		}

		return this.props.children
	}
}

