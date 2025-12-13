"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { Header } from "@/components/shared"
import { Button, EmptyState, Input, TextArea } from "@/components/ui/primitives"
import { apiClient } from "@/lib/api-client"
import { cn, formatRelativeTime } from "@/lib/utils"
import { useAuthStore } from "@/stores/auth-store"

interface Project {
	id: string
	name: string
	description?: string
	created_at: number
	updated_at: number
}

const templates = [
	{
		id: "nextjs",
		name: "Next.js App",
		description: "Full-stack React framework with server components",
		icon: "⚡",
		color: "from-zinc-500 to-zinc-700",
	},
	{
		id: "react",
		name: "React + Vite",
		description: "Lightning-fast React development",
		icon: "⚛️",
		color: "from-cyan-500 to-blue-600",
	},
	{
		id: "python",
		name: "Python API",
		description: "FastAPI backend with modern Python",
		icon: "🐍",
		color: "from-emerald-500 to-teal-600",
	},
	{
		id: "node",
		name: "Node.js Server",
		description: "Express.js REST API starter",
		icon: "🟢",
		color: "from-green-500 to-emerald-600",
	},
	{
		id: "static",
		name: "Static Site",
		description: "HTML, CSS, and JavaScript",
		icon: "📄",
		color: "from-orange-500 to-amber-600",
	},
	{
		id: "blank",
		name: "Blank Project",
		description: "Start from scratch",
		icon: "✨",
		color: "from-violet-500 to-purple-600",
	},
]

function ProjectsContent() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const { user } = useAuthStore()
	const queryClient = useQueryClient()
	const [showCreateModal, setShowCreateModal] = useState(false)
	const [projectName, setProjectName] = useState("")
	const [projectDescription, setProjectDescription] = useState("")
	const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
	const [searchQuery, setSearchQuery] = useState("")

	// Open create modal if query param is present
	useEffect(() => {
		if (searchParams?.get("create") === "true") {
			setShowCreateModal(true)
		}
	}, [searchParams])

	const {
		data: projects = [],
		isLoading,
		error,
	} = useQuery<Project[]>({
		queryKey: ["projects"],
		queryFn: () => apiClient.listProjects(),
		retry: (failureCount, error: any) => {
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
			resetForm()
			router.push(`/ide/${project.id}`)
		},
	})

	const deleteMutation = useMutation({
		mutationFn: (projectId: string) => apiClient.deleteProject(projectId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["projects"] })
		},
	})

	const resetForm = () => {
		setProjectName("")
		setProjectDescription("")
		setSelectedTemplate(null)
	}

	const handleCreate = (e: React.FormEvent) => {
		e.preventDefault()
		if (projectName.trim()) {
			createMutation.mutate({
				name: projectName.trim(),
				description: projectDescription.trim() || undefined,
			})
		}
	}

	const handleTemplateSelect = (templateId: string) => {
		setSelectedTemplate(templateId)
		const template = templates.find((t) => t.id === templateId)
		if (template && template.id !== "blank") {
			setProjectName(`My ${template.name}`)
			setProjectDescription(template.description)
		}
	}

	const filteredProjects = projects.filter(
		(project) =>
			project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			project.description?.toLowerCase().includes(searchQuery.toLowerCase()),
	)

	const recentProjects = [...projects].sort((a, b) => b.updated_at - a.updated_at).slice(0, 3)

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-surface-primary">
				<div className="flex flex-col items-center gap-4">
					<div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-primary to-accent-cyan flex items-center justify-center animate-pulse">
						<svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
							<path d="M12 2L14.5 8L21 9L16 14L17.5 21L12 17.5L6.5 21L8 14L3 9L9.5 8L12 2Z" />
						</svg>
					</div>
					<div className="text-text-secondary">Loading your projects...</div>
				</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-surface-primary">
				<div className="text-center">
					<div className="w-16 h-16 rounded-full bg-accent-rose/20 flex items-center justify-center mx-auto mb-4">
						<svg className="w-8 h-8 text-accent-rose" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
							/>
						</svg>
					</div>
					<h2 className="text-xl font-semibold text-text-bright mb-2">Error loading projects</h2>
					<p className="text-text-secondary mb-4">Something went wrong. Please try again.</p>
					<Button onClick={() => window.location.reload()} variant="primary">
						Retry
					</Button>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-surface-primary">
			<Header variant="dashboard" />

			<main className="container-app py-8">
				{/* Welcome Section */}
				<div className="mb-8 animate-fade-in-up">
					<h1 className="text-3xl font-bold text-text-bright mb-2">
						Welcome back{user?.username ? `, ${user.username}` : ""}! 👋
					</h1>
					<p className="text-text-secondary">Create, manage, and deploy your projects with AI assistance</p>
				</div>

				{/* Quick Actions Grid */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10 animate-fade-in-up stagger-1 animate-fill-both">
					<button
						className="group p-5 rounded-xl bg-gradient-to-br from-accent-primary to-accent-cyan text-white text-left transition-all hover:scale-[1.02] hover:shadow-lg glow-on-hover"
						onClick={() => setShowCreateModal(true)}>
						<div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
							</svg>
						</div>
						<div className="font-semibold mb-1">New Project</div>
						<div className="text-sm text-white/80">Start from template or scratch</div>
					</button>

					<button className="group p-5 rounded-xl bg-surface-secondary border border-border-primary text-left transition-all hover:border-accent-primary/50 hover:bg-surface-tertiary">
						<div className="w-10 h-10 rounded-lg bg-accent-cyan/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
							<svg className="w-5 h-5 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
								/>
							</svg>
						</div>
						<div className="font-semibold text-text-bright mb-1">Import from Git</div>
						<div className="text-sm text-text-secondary">Clone from GitHub or GitLab</div>
					</button>

					<button className="group p-5 rounded-xl bg-surface-secondary border border-border-primary text-left transition-all hover:border-accent-primary/50 hover:bg-surface-tertiary">
						<div className="w-10 h-10 rounded-lg bg-accent-amber/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
							<svg className="w-5 h-5 text-accent-amber" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
								/>
							</svg>
						</div>
						<div className="font-semibold text-text-bright mb-1">AI Generate</div>
						<div className="text-sm text-text-secondary">Describe and let AI build</div>
					</button>

					<button className="group p-5 rounded-xl bg-surface-secondary border border-border-primary text-left transition-all hover:border-accent-primary/50 hover:bg-surface-tertiary">
						<div className="w-10 h-10 rounded-lg bg-accent-emerald/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
							<svg className="w-5 h-5 text-accent-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
								/>
							</svg>
						</div>
						<div className="font-semibold text-text-bright mb-1">Browse Templates</div>
						<div className="text-sm text-text-secondary">Production-ready starters</div>
					</button>
				</div>

				{/* Recent Projects (if any) */}
				{recentProjects.length > 0 && (
					<div className="mb-10 animate-fade-in-up stagger-2 animate-fill-both">
						<h2 className="text-lg font-semibold text-text-bright mb-4">Recently Opened</h2>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							{recentProjects.map((project) => (
								<button
									className="group p-4 rounded-xl bg-surface-secondary border border-border-primary text-left transition-all hover:border-accent-primary/50 hover:bg-surface-tertiary"
									key={project.id}
									onClick={() => router.push(`/ide/${project.id}`)}>
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-primary/30 to-accent-cyan/30 flex items-center justify-center shrink-0">
											<svg
												className="w-5 h-5 text-accent-bright"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24">
												<path
													d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
												/>
											</svg>
										</div>
										<div className="min-w-0 flex-1">
											<div className="font-medium text-text-bright truncate group-hover:text-accent-bright transition-colors">
												{project.name}
											</div>
											<div className="text-xs text-text-muted">
												{formatRelativeTime(project.updated_at)}
											</div>
										</div>
										<svg
											className="w-4 h-4 text-text-muted group-hover:text-accent-bright transition-colors"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24">
											<path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
										</svg>
									</div>
								</button>
							))}
						</div>
					</div>
				)}

				{/* All Projects Section */}
				<div className="animate-fade-in-up stagger-3 animate-fill-both">
					<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
						<div>
							<h2 className="text-lg font-semibold text-text-bright mb-1">All Projects</h2>
							<p className="text-sm text-text-secondary">
								{projects.length === 0
									? "Get started by creating your first project"
									: `${projects.length} project${projects.length !== 1 ? "s" : ""}`}
							</p>
						</div>
						<div className="flex items-center gap-3 w-full sm:w-auto">
							{/* Search */}
							<div className="relative flex-1 sm:w-64">
								<svg
									className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24">
									<path
										d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
									/>
								</svg>
								<input
									className="w-full h-9 pl-10 pr-4 rounded-lg bg-surface-tertiary border border-border-primary text-sm text-text-primary placeholder:text-text-muted focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary transition-all"
									onChange={(e) => setSearchQuery(e.target.value)}
									placeholder="Search projects..."
									type="text"
									value={searchQuery}
								/>
							</div>
							{/* View Toggle */}
							<div className="flex rounded-lg bg-surface-tertiary border border-border-primary p-0.5">
								<button
									className={cn(
										"p-1.5 rounded-md transition-all",
										viewMode === "grid"
											? "bg-surface-elevated text-text-bright"
											: "text-text-muted hover:text-text-secondary",
									)}
									onClick={() => setViewMode("grid")}>
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
										/>
									</svg>
								</button>
								<button
									className={cn(
										"p-1.5 rounded-md transition-all",
										viewMode === "list"
											? "bg-surface-elevated text-text-bright"
											: "text-text-muted hover:text-text-secondary",
									)}
									onClick={() => setViewMode("list")}>
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											d="M4 6h16M4 12h16M4 18h16"
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
										/>
									</svg>
								</button>
							</div>
						</div>
					</div>

					{/* Projects Display */}
					{filteredProjects.length === 0 && projects.length === 0 ? (
						<div className="bg-surface-secondary border border-border-primary rounded-2xl p-12">
							<EmptyState
								action={
									<Button
										className="glow-on-hover"
										onClick={() => setShowCreateModal(true)}
										size="lg"
										variant="primary">
										<svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												d="M12 4v16m8-8H4"
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
											/>
										</svg>
										Create Your First Project
									</Button>
								}
								description="Create your first project to start coding with AI assistance. Build web apps, APIs, or anything you can imagine."
								icon={
									<div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-primary/20 to-accent-cyan/20 flex items-center justify-center">
										<svg
											className="w-10 h-10 text-accent-bright"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24">
											<path
												d="M3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V9C21 7.89543 20.1046 7 19 7H13L11 5H5C3.89543 5 3 5.89543 3 7Z"
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={1.5}
											/>
										</svg>
									</div>
								}
								title="No projects yet"
							/>
						</div>
					) : filteredProjects.length === 0 ? (
						<div className="bg-surface-secondary border border-border-primary rounded-2xl p-12 text-center">
							<p className="text-text-secondary">No projects match "{searchQuery}"</p>
						</div>
					) : viewMode === "grid" ? (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{filteredProjects.map((project) => (
								<div
									className="group bg-surface-secondary border border-border-primary rounded-xl p-5 hover:border-accent-primary/50 cursor-pointer transition-all duration-200 card-hover"
									key={project.id}
									onClick={() => router.push(`/ide/${project.id}`)}>
									<div className="flex items-start justify-between mb-4">
										<div className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent-primary/20 to-accent-cyan/20 flex items-center justify-center group-hover:scale-105 transition-transform">
											<svg
												className="w-5 h-5 text-accent-bright"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24">
												<path
													d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
												/>
											</svg>
										</div>
										<button
											className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-accent-rose/20 text-text-muted hover:text-accent-rose transition-all"
											onClick={(e) => {
												e.stopPropagation()
												if (confirm("Are you sure you want to delete this project?")) {
													deleteMutation.mutate(project.id)
												}
											}}>
											<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path
													d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
												/>
											</svg>
										</button>
									</div>
									<h3 className="text-base font-semibold text-text-bright mb-1.5 group-hover:text-accent-bright transition-colors truncate">
										{project.name}
									</h3>
									{project.description && (
										<p className="text-sm text-text-secondary mb-4 line-clamp-2">{project.description}</p>
									)}
									<div className="flex items-center justify-between text-xs text-text-muted pt-4 border-t border-border-primary">
										<span>Updated {formatRelativeTime(project.updated_at)}</span>
										<div className="flex items-center gap-1 text-accent-bright opacity-0 group-hover:opacity-100 transition-opacity">
											<span>Open</span>
											<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path
													d="M9 5l7 7-7 7"
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
												/>
											</svg>
										</div>
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="bg-surface-secondary border border-border-primary rounded-xl overflow-hidden">
							{filteredProjects.map((project, index) => (
								<div
									className={cn(
										"group flex items-center gap-4 p-4 hover:bg-surface-tertiary cursor-pointer transition-colors",
										index !== filteredProjects.length - 1 && "border-b border-border-primary",
									)}
									key={project.id}
									onClick={() => router.push(`/ide/${project.id}`)}>
									<div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-primary/20 to-accent-cyan/20 flex items-center justify-center shrink-0">
										<svg
											className="w-5 h-5 text-accent-bright"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24">
											<path
												d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
											/>
										</svg>
									</div>
									<div className="flex-1 min-w-0">
										<div className="font-medium text-text-bright truncate group-hover:text-accent-bright transition-colors">
											{project.name}
										</div>
										{project.description && (
											<div className="text-sm text-text-secondary truncate">{project.description}</div>
										)}
									</div>
									<div className="text-xs text-text-muted shrink-0">
										{formatRelativeTime(project.updated_at)}
									</div>
									<button
										className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-accent-rose/20 text-text-muted hover:text-accent-rose transition-all shrink-0"
										onClick={(e) => {
											e.stopPropagation()
											if (confirm("Are you sure you want to delete this project?")) {
												deleteMutation.mutate(project.id)
											}
										}}>
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
											/>
										</svg>
									</button>
								</div>
							))}
						</div>
					)}
				</div>
			</main>

			{/* Create Project Modal */}
			{showCreateModal && (
				<div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
					<div className="bg-surface-secondary border border-border-primary rounded-2xl w-full max-w-2xl shadow-2xl animate-scale-in max-h-[90vh] overflow-hidden flex flex-col">
						{/* Modal Header */}
						<div className="flex items-center justify-between p-6 border-b border-border-primary shrink-0">
							<div>
								<h3 className="text-xl font-semibold text-text-bright">Create New Project</h3>
								<p className="text-sm text-text-secondary mt-1">Choose a template or start from scratch</p>
							</div>
							<button
								className="p-2 rounded-lg hover:bg-surface-tertiary text-text-secondary hover:text-text-primary transition-colors"
								onClick={() => {
									setShowCreateModal(false)
									resetForm()
								}}>
								<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
								</svg>
							</button>
						</div>

						{/* Modal Body */}
						<div className="p-6 overflow-y-auto">
							{/* Template Selection */}
							<div className="mb-6">
								<label className="block text-sm font-medium text-text-secondary mb-3">Choose a template</label>
								<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
									{templates.map((template) => (
										<button
											className={cn(
												"p-4 rounded-xl border text-left transition-all",
												selectedTemplate === template.id
													? "border-accent-primary bg-accent-primary/10"
													: "border-border-primary hover:border-accent-primary/50 hover:bg-surface-tertiary",
											)}
											key={template.id}
											onClick={() => handleTemplateSelect(template.id)}
											type="button">
											<div
												className={cn(
													"w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center mb-3 text-xl",
													template.color,
												)}>
												{template.icon}
											</div>
											<div className="font-medium text-text-bright text-sm mb-0.5">{template.name}</div>
											<div className="text-xs text-text-muted line-clamp-2">{template.description}</div>
										</button>
									))}
								</div>
							</div>

							{/* Project Details Form */}
							<form onSubmit={handleCreate}>
								<div className="space-y-4">
									<div>
										<label className="block text-sm font-medium text-text-secondary mb-2">Project Name</label>
										<Input
											autoFocus
											className="h-11"
											onChange={(e) => setProjectName(e.target.value)}
											placeholder="my-awesome-project"
											required
											type="text"
											value={projectName}
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-text-secondary mb-2">
											Description <span className="text-text-muted">(optional)</span>
										</label>
										<TextArea
											onChange={(e) => setProjectDescription(e.target.value)}
											placeholder="A brief description of your project..."
											rows={3}
											value={projectDescription}
										/>
									</div>
								</div>
								<div className="flex gap-3 mt-6">
									<Button
										className="flex-1"
										onClick={() => {
											setShowCreateModal(false)
											resetForm()
										}}
										size="lg"
										type="button"
										variant="secondary">
										Cancel
									</Button>
									<Button
										className="flex-1 glow-on-hover"
										disabled={createMutation.isPending || !projectName.trim()}
										isLoading={createMutation.isPending}
										size="lg"
										type="submit"
										variant="primary">
										Create Project
									</Button>
								</div>
							</form>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

function ProjectsPageContent() {
	return (
		<AuthGuard>
			<ProjectsContent />
		</AuthGuard>
	)
}

export default function ProjectsPage() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen flex items-center justify-center bg-surface-primary">
					<div className="w-6 h-6 border-2 border-border-primary border-t-accent-primary rounded-full animate-spin" />
				</div>
			}>
			<ProjectsPageContent />
		</Suspense>
	)
}
