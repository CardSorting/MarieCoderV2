/**
 * Command Palette Component
 * VS Code-style quick access to files and commands
 */
"use client"

import { memo, useCallback, useEffect, useRef, useState } from "react"
import { FileIcon } from "@/components/ui/icons"
import { Input, Kbd } from "@/components/ui/primitives"
import { cn } from "@/lib/utils"

// Types
export interface CommandItem {
	id: string
	label: string
	description?: string
	shortcut?: string
	icon?: React.ReactNode
	category?: string
	action: () => void
}

interface CommandPaletteProps {
	isOpen: boolean
	onClose: () => void
	commands: CommandItem[]
	recentFiles?: { path: string; name: string }[]
	onFileSelect?: (path: string) => void
}

export default function CommandPalette({ isOpen, onClose, commands, recentFiles = [], onFileSelect }: CommandPaletteProps) {
	const [query, setQuery] = useState("")
	const [selectedIndex, setSelectedIndex] = useState(0)
	const [mode, setMode] = useState<"commands" | "files">("files")
	const inputRef = useRef<HTMLInputElement>(null)
	const listRef = useRef<HTMLDivElement>(null)

	// Determine mode based on query
	useEffect(() => {
		setMode(query.startsWith(">") ? "commands" : "files")
	}, [query])

	// Filter items based on mode and query
	const filteredItems = useCallback(() => {
		const searchQuery = mode === "commands" ? query.slice(1).toLowerCase() : query.toLowerCase()

		if (mode === "commands") {
			return commands.filter(
				(cmd) => cmd.label.toLowerCase().includes(searchQuery) || cmd.description?.toLowerCase().includes(searchQuery),
			)
		}
		return recentFiles.filter(
			(file) => file.path.toLowerCase().includes(searchQuery) || file.name.toLowerCase().includes(searchQuery),
		)
	}, [mode, query, commands, recentFiles])

	const items = filteredItems()

	// Reset selection when query changes
	useEffect(() => {
		setSelectedIndex(0)
	}, [query])

	// Focus input when opening
	useEffect(() => {
		if (isOpen) {
			setQuery("")
			setSelectedIndex(0)
			setTimeout(() => inputRef.current?.focus(), 10)
		}
	}, [isOpen])

	// Scroll selected item into view
	useEffect(() => {
		if (listRef.current) {
			const selectedElement = listRef.current.querySelector('[data-selected="true"]')
			selectedElement?.scrollIntoView({ block: "nearest" })
		}
	}, [selectedIndex])

	// Keyboard navigation
	useEffect(() => {
		if (!isOpen) return

		const handleKeyDown = (e: KeyboardEvent) => {
			switch (e.key) {
				case "ArrowDown":
					e.preventDefault()
					setSelectedIndex((prev) => Math.min(prev + 1, items.length - 1))
					break
				case "ArrowUp":
					e.preventDefault()
					setSelectedIndex((prev) => Math.max(prev - 1, 0))
					break
				case "Enter":
					e.preventDefault()
					if (items[selectedIndex]) {
						if (mode === "commands") {
							;(items[selectedIndex] as CommandItem).action()
						} else {
							onFileSelect?.((items[selectedIndex] as { path: string; name: string }).path)
						}
						onClose()
					}
					break
				case "Escape":
					e.preventDefault()
					onClose()
					break
				case "Backspace":
					if (query === "" || query === ">") {
						onClose()
					}
					break
			}
		}

		window.addEventListener("keydown", handleKeyDown)
		return () => window.removeEventListener("keydown", handleKeyDown)
	}, [isOpen, items, selectedIndex, mode, onClose, onFileSelect, query])

	// Handle Cmd+Shift+P for commands mode
	useEffect(() => {
		const handleGlobalKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "p") {
				e.preventDefault()
				setQuery(">")
			}
		}

		window.addEventListener("keydown", handleGlobalKeyDown)
		return () => window.removeEventListener("keydown", handleGlobalKeyDown)
	}, [])

	if (!isOpen) return null

	return (
		<>
			{/* Backdrop */}
			<div className="fixed inset-0 bg-black/50 z-[9998]" onClick={onClose} />

			{/* Palette Container */}
			<div className="fixed top-[12%] left-1/2 -translate-x-1/2 w-[600px] max-w-[calc(100vw-40px)] max-h-[70vh] bg-tertiary border border-border-secondary rounded-lg shadow-xl z-[9999] flex flex-col overflow-hidden animate-fade-in-down">
				{/* Search Input */}
				<div className="p-3 border-b border-border-primary">
					<Input
						autoComplete="off"
						className="h-10 text-lg"
						onChange={(e) => setQuery(e.target.value)}
						placeholder={mode === "commands" ? "Type a command..." : "Search files by name (> for commands)"}
						ref={inputRef}
						spellCheck={false}
						type="text"
						value={query}
					/>
				</div>

				{/* Results List */}
				<div className="flex-1 overflow-y-auto p-1 scrollbar-thin" ref={listRef}>
					{/* Empty state for files mode */}
					{mode === "files" && items.length === 0 && query === "" && (
						<EmptyState>
							<span className="text-muted">Start typing to search files...</span>
							<span className="text-muted text-xs mt-2">
								Tip: Type <code className="px-1.5 py-0.5 bg-surface-elevated rounded font-mono">&gt;</code> to
								access commands
							</span>
						</EmptyState>
					)}

					{/* No results */}
					{items.length === 0 && query !== "" && (
						<EmptyState>
							<span className="text-muted">No results found</span>
						</EmptyState>
					)}

					{/* File Results */}
					{mode === "files" &&
						items.map((file, index) => {
							const f = file as { path: string; name: string }
							return (
								<ResultItem
									isSelected={index === selectedIndex}
									key={f.path}
									onClick={() => {
										onFileSelect?.(f.path)
										onClose()
									}}
									onMouseEnter={() => setSelectedIndex(index)}>
									<div className="flex items-center justify-center w-6 h-6 text-secondary shrink-0">
										<FileIcon size={16} />
									</div>
									<div className="flex-1 min-w-0">
										<div className="text-[13px] text-primary truncate-text">{f.name}</div>
										<div className="text-xs text-muted truncate-text">{f.path}</div>
									</div>
								</ResultItem>
							)
						})}

					{/* Command Results */}
					{mode === "commands" &&
						items.map((cmd, index) => {
							const c = cmd as CommandItem
							return (
								<ResultItem
									isSelected={index === selectedIndex}
									key={c.id}
									onClick={() => {
										c.action()
										onClose()
									}}
									onMouseEnter={() => setSelectedIndex(index)}>
									{c.icon && (
										<div className="flex items-center justify-center w-6 h-6 text-secondary shrink-0">
											{c.icon}
										</div>
									)}
									<div className="flex-1 min-w-0">
										<div className="text-[13px] text-primary truncate-text">{c.label}</div>
										{c.description && <div className="text-xs text-muted truncate-text">{c.description}</div>}
									</div>
									{c.shortcut && (
										<div className="flex gap-1 shrink-0">
											{c.shortcut.split("+").map((key, i) => (
												<Kbd key={i}>{key}</Kbd>
											))}
										</div>
									)}
								</ResultItem>
							)
						})}
				</div>

				{/* Footer */}
				<div className="flex gap-4 py-2 px-3 border-t border-border-primary bg-secondary">
					<FooterHint keyLabel="↑↓">navigate</FooterHint>
					<FooterHint keyLabel="↵">select</FooterHint>
					<FooterHint keyLabel="esc">close</FooterHint>
				</div>
			</div>
		</>
	)
}

// Empty State Component
function EmptyState({ children }: { children: React.ReactNode }) {
	return <div className="flex flex-col items-center justify-center p-8 text-center">{children}</div>
}

// Result Item Component
interface ResultItemProps {
	isSelected: boolean
	onClick: () => void
	onMouseEnter: () => void
	children: React.ReactNode
}

const ResultItem = memo(function ResultItem({ isSelected, onClick, onMouseEnter, children }: ResultItemProps) {
	return (
		<div
			className={cn(
				"flex items-center gap-3 py-2 px-3 rounded-md cursor-pointer transition-colors duration-75",
				isSelected ? "bg-accent-muted" : "hover:bg-surface-tertiary",
			)}
			data-selected={isSelected}
			onClick={onClick}
			onMouseEnter={onMouseEnter}>
			{children}
		</div>
	)
})

// Footer Hint Component
function FooterHint({ keyLabel, children }: { keyLabel: string; children: React.ReactNode }) {
	return (
		<span className="flex items-center gap-1.5 text-xs text-muted">
			<Kbd>{keyLabel}</Kbd>
			{children}
		</span>
	)
}
