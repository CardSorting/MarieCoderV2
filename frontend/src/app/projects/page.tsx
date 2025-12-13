"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { apiClient } from "@/lib/api-client"
import { useAuthStore } from "@/stores/auth-store"

interface Project {
	id: string
	name: string
	description?: string
	created_at: number
	updated_at: number
}

function ProjectsContent() {
	const router = useRouter()
	const { logout, user } = useAuthStore()
	const queryClient = useQueryClient()
	const [showCreateModal, setShowCreateModal] = useState(false)
	const [projectName, setProjectName] = useState("")
	const [projectDescription, setProjectDescription] = useState("")

	const { data: projects = [], isLoading, error } = useQuery<Project[]>({
		queryKey: ["projects"],
		queryFn: () => apiClient.listProjects(),
		retry: (failureCount, error: any) => {
			// Don't retry on 401 errors
			if (error?.response?.status === 401) {
				return false
			}
			return failureCount < 3
		},
	})

	const createMutation = useMutation({
		mutationFn: (data: { name: string; description?: string }) => apiClient.createProject(data.name, data.description),
		onSuccess: (project) => {
			queryClient.invalidateQueries({ queryKey: ["projects"] })
			setShowCreateModal(false)
			setProjectName("")
			setProjectDescription("")
			router.push(`/ide/${project.id}`)
		},
	})

	const deleteMutation = useMutation({
		mutationFn: (projectId: string) => apiClient.deleteProject(projectId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["projects"] })
		},
	})

	const handleCreate = (e: React.FormEvent) => {
		e.preventDefault()
		if (projectName.trim()) {
			createMutation.mutate({
				name: projectName.trim(),
				description: projectDescription.trim() || undefined,
			})
		}
	}

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-bg-primary">
				<div className="text-text-primary">Loading projects...</div>
			</div>
		)
	}

	if (error) {
		// Error will be handled by axios interceptor (redirects to login on 401)
		return (
			<div className="min-h-screen flex items-center justify-center bg-bg-primary">
				<div className="text-text-primary">Error loading projects. Redirecting...</div>
			</div>
		)
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
					<button className="btn btn-secondary" onClick={() => router.push("/settings")}>
						Settings
					</button>
					<span className="text-sm text-text-secondary">Welcome, {user?.username || user?.email || "User"}</span>
					<button className="btn btn-secondary" onClick={logout}>
						Logout
					</button>
				</div>
			</header>

			{/* Main content */}
			<main className="max-w-6xl mx-auto px-6 py-8">
				<div className="flex justify-between items-center mb-6">
					<h2 className="text-xl font-semibold text-text-bright">My Projects</h2>
					<button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
						+ New Project
					</button>
				</div>

				{/* Projects grid */}
				{projects.length === 0 ? (
					<div className="text-center py-12 text-text-muted">
						<svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="currentColor" viewBox="0 0 24 24">
							<path d="M3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V9C21 7.89543 20.1046 7 19 7H13L11 5H5C3.89543 5 3 5.89543 3 7Z" />
						</svg>
						<p className="text-lg mb-4">No projects yet</p>
						<p className="text-sm">Create your first project to get started</p>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{projects.map((project) => (
							<div
								className="bg-bg-secondary border border-border-primary rounded-lg p-4 hover:border-accent-bright cursor-pointer transition-colors duration-fast"
								key={project.id}
								onClick={() => router.push(`/ide/${project.id}`)}>
								<h3 className="text-lg font-semibold text-text-bright mb-2">{project.name}</h3>
								{project.description && <p className="text-sm text-text-secondary mb-4">{project.description}</p>}
								<div className="flex justify-between items-center text-xs text-text-muted">
									<span>Updated {new Date(project.updated_at).toLocaleDateString()}</span>
									<button
										className="text-error hover:text-error/80 transition-colors duration-fast"
										onClick={(e) => {
											e.stopPropagation()
											if (confirm("Are you sure you want to delete this project?")) {
												deleteMutation.mutate(project.id)
											}
										}}>
										Delete
									</button>
								</div>
							</div>
						))}
					</div>
				)}
			</main>

			{/* Create project modal */}
			{showCreateModal && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<div className="bg-bg-secondary border border-border-primary rounded-lg p-6 w-full max-w-md animate-scale-in">
						<h3 className="text-xl font-semibold text-text-bright mb-4">Create New Project</h3>
						<form onSubmit={handleCreate}>
							<div className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-text-secondary mb-1">Project Name</label>
									<input
										className="input"
										onChange={(e) => setProjectName(e.target.value)}
										placeholder="My Awesome Project"
										required
										type="text"
										value={projectName}
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-text-secondary mb-1">
										Description (optional)
									</label>
									<textarea
										className="input resize-none"
										onChange={(e) => setProjectDescription(e.target.value)}
										placeholder="A brief description of your project"
										rows={3}
										value={projectDescription}
									/>
								</div>
							</div>
							<div className="flex gap-3 mt-6">
								<button
									className="btn btn-secondary flex-1"
									onClick={() => {
										setShowCreateModal(false)
										setProjectName("")
										setProjectDescription("")
									}}
									type="button">
									Cancel
								</button>
								<button
									className="btn btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
									disabled={createMutation.isPending || !projectName.trim()}
									type="submit">
									{createMutation.isPending ? "Creating..." : "Create"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	)
}

export default function ProjectsPage() {
	return (
		<AuthGuard>
			<ProjectsContent />
		</AuthGuard>
	)
}
