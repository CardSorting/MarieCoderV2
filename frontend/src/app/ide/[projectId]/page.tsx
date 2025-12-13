"use client"

import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { use } from "react"
import { AuthGuard } from "@/components/auth-guard"
import IDELayout from "@/components/ide/IDELayout"
import { apiClient } from "@/lib/api-client"
import { useAuthStore } from "@/stores/auth-store"

interface PageProps {
	params: Promise<{ projectId: string }>
}

function IDEContent({ projectId }: { projectId: string }) {
	const router = useRouter()
	const { isAuthenticated } = useAuthStore()

	const {
		data: project,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["project", projectId],
		queryFn: () => apiClient.getProject(projectId),
		enabled: !!projectId && isAuthenticated,
	})

	if (isLoading) {
		return (
			<div className="h-screen flex items-center justify-center bg-bg-primary text-text-primary">
				<div className="flex flex-col items-center gap-4">
					<svg className="w-16 h-16 text-accent-bright animate-pulse" fill="currentColor" viewBox="0 0 24 24">
						<path d="M12 2L14.5 8L21 9L16 14L17.5 21L12 17.5L6.5 21L8 14L3 9L9.5 8L12 2Z" />
					</svg>
					<span>Loading project...</span>
				</div>
			</div>
		)
	}

	if (error || !project) {
		return (
			<div className="h-screen flex items-center justify-center bg-bg-primary text-text-primary">
				<div className="text-center">
					<svg
						className="w-16 h-16 mx-auto mb-4 text-error opacity-50"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.5"
						viewBox="0 0 24 24">
						<circle cx="12" cy="12" r="10" />
						<path d="M15 9L9 15M9 9L15 15" />
					</svg>
					<p className="text-lg mb-4">Project not found</p>
					<button className="btn btn-primary" onClick={() => router.push("/projects")}>
						Back to Projects
					</button>
				</div>
			</div>
		)
	}

	return <IDELayout projectId={projectId} />
}

export default function IDEPage({ params }: PageProps) {
	// Use React.use() for async params in Next.js 16
	const resolvedParams = use(params)

	return (
		<AuthGuard>
			<IDEContent projectId={resolvedParams.projectId} />
		</AuthGuard>
	)
}
