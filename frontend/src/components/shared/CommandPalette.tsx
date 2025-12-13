"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Kbd } from "@/components/ui/primitives"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/stores/auth-store"
import { toast } from "./Toaster"

interface Command {
	id: string
	label: string
	description?: string
	icon?: React.ReactNode
	action: () => void
	keywords: string[]
	category: "navigation" | "actions" | "settings"
}

interface CommandPaletteProps {
	isOpen: boolean
	onClose: () => void
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
	const router = useRouter()
	const { logout } = useAuthStore()
	const [search, setSearch] = useState("")
	const [selectedIndex, setSelectedIndex] = useState(0)

	const commands: Command[] = [
		{
			id: "new-project",
			label: "New Project",
			description: "Create a new project",
			icon: (
				<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
				</svg>
			),
			action: () => {
				onClose()
				// Trigger project creation modal
				window.dispatchEvent(new CustomEvent("open-create-project"))
			},
			keywords: ["new", "create", "project", "add"],
			category: "actions",
		},
		{
			id: "projects",
			label: "Go to Projects",
			description: "View all your projects",
			icon: (
				<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						d="M3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V9C21 7.89543 20.1046 7 19 7H13L11 5H5C3.89543 5 3 5.89543 3 7Z"
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
					/>
				</svg>
			),
			action: () => {
				onClose()
				router.push("/projects")
			},
			keywords: ["projects", "dashboard", "home"],
			category: "navigation",
		},
		{
			id: "settings",
			label: "Settings",
			description: "Open settings",
			icon: (
				<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
					/>
					<path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
				</svg>
			),
			action: () => {
				onClose()
				router.push("/settings")
			},
			keywords: ["settings", "preferences", "config"],
			category: "settings",
		},
		{
			id: "logout",
			label: "Logout",
			description: "Sign out of your account",
			icon: (
				<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
					/>
				</svg>
			),
			action: () => {
				onClose()
				logout()
				toast("Logged out successfully", "success")
			},
			keywords: ["logout", "sign out", "exit"],
			category: "settings",
		},
	]

	const filteredCommands = commands.filter((cmd) => {
		if (!search) return true
		const searchLower = search.toLowerCase()
		return (
			cmd.label.toLowerCase().includes(searchLower) ||
			cmd.description?.toLowerCase().includes(searchLower) ||
			cmd.keywords.some((kw) => kw.toLowerCase().includes(searchLower))
		)
	})

	const groupedCommands = filteredCommands.reduce(
		(acc, cmd) => {
			if (!acc[cmd.category]) acc[cmd.category] = []
			acc[cmd.category].push(cmd)
			return acc
		},
		{} as Record<string, Command[]>,
	)

	useEffect(() => {
		if (!isOpen) {
			setSearch("")
			setSelectedIndex(0)
		}
	}, [isOpen])

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (!isOpen) return

			if (e.key === "Escape") {
				onClose()
			} else if (e.key === "ArrowDown") {
				e.preventDefault()
				setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1))
			} else if (e.key === "ArrowUp") {
				e.preventDefault()
				setSelectedIndex((prev) => Math.max(prev - 1, 0))
			} else if (e.key === "Enter" && filteredCommands[selectedIndex]) {
				e.preventDefault()
				filteredCommands[selectedIndex].action()
			}
		}

		window.addEventListener("keydown", handleKeyDown)
		return () => window.removeEventListener("keydown", handleKeyDown)
	}, [isOpen, filteredCommands, selectedIndex, onClose])

	if (!isOpen) return null

	return (
		<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-[20vh] p-6 animate-fade-in">
			<div className="bg-bg-secondary border border-border-primary rounded-xl shadow-2xl w-full max-w-2xl animate-scale-in">
				{/* Search Input */}
				<div className="p-4 border-b border-border-primary">
					<div className="flex items-center gap-3">
						<svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
							/>
						</svg>
						<input
							autoFocus
							className="flex-1 bg-transparent text-text-bright placeholder-text-muted outline-none"
							onChange={(e) => {
								setSearch(e.target.value)
								setSelectedIndex(0)
							}}
							placeholder="Type a command or search..."
							type="text"
							value={search}
						/>
						<div className="flex items-center gap-1 text-xs text-text-muted">
							<Kbd>↑</Kbd>
							<Kbd>↓</Kbd>
							<span className="mx-1">to navigate</span>
							<Kbd>↵</Kbd>
							<span className="mx-1">to select</span>
							<Kbd>Esc</Kbd>
							<span className="mx-1">to close</span>
						</div>
					</div>
				</div>

				{/* Commands List */}
				<div className="max-h-96 overflow-y-auto p-2">
					{filteredCommands.length === 0 ? (
						<div className="p-8 text-center text-text-secondary">
							<p>No commands found</p>
							<p className="text-sm text-text-muted mt-2">Try a different search term</p>
						</div>
					) : (
						Object.entries(groupedCommands).map(([category, cmds]) => (
							<div className="mb-4 last:mb-0" key={category}>
								<div className="px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider">
									{category}
								</div>
								{cmds.map((cmd, index) => {
									const globalIndex = filteredCommands.indexOf(cmd)
									return (
										<button
											className={cn(
												"w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
												globalIndex === selectedIndex
													? "bg-bg-tertiary text-text-bright"
													: "text-text-secondary hover:bg-bg-tertiary hover:text-text-bright",
											)}
											key={cmd.id}
											onClick={cmd.action}
											onMouseEnter={() => setSelectedIndex(globalIndex)}
											type="button">
											<div className="flex-shrink-0 text-text-muted">{cmd.icon}</div>
											<div className="flex-1 min-w-0">
												<div className="font-medium">{cmd.label}</div>
												{cmd.description && (
													<div className="text-xs text-text-muted truncate">{cmd.description}</div>
												)}
											</div>
										</button>
									)
								})}
							</div>
						))
					)}
				</div>
			</div>
		</div>
	)
}
