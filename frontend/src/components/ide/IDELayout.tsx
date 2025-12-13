/**
 * IDE Layout Component
 * Main layout orchestrating all IDE components in VS Code style
 */
"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { MenuIcon, SearchIcon, SparkleIcon } from "@/components/ui/icons"
import { EmptyState, ResizeHandle } from "@/components/ui/primitives"
import { LAYOUT } from "@/lib/constants"
import { cn } from "@/lib/utils"
// Components
import ActivityBar, { ActivityType } from "./ActivityBar"
import AIChat from "./AIChat"
import Breadcrumbs from "./Breadcrumbs"
import CodeEditor from "./CodeEditor"
import CommandPalette, { CommandItem } from "./CommandPalette"
import EditorTabs, { Tab } from "./EditorTabs"
import FileTree from "./FileTree"
import PanelTabs, { PanelType } from "./PanelTabs"
import StatusBar from "./StatusBar"
import Terminal from "./Terminal"

interface IDELayoutProps {
	projectId: string
}

export default function IDELayout({ projectId }: IDELayoutProps) {
	// UI State
	const [activeActivity, setActiveActivity] = useState<ActivityType>("explorer")
	const [openTabs, setOpenTabs] = useState<Tab[]>([])
	const [activeTab, setActiveTab] = useState<string | null>(null)
	const [showSidebar, setShowSidebar] = useState(true)
	const [showPanel, setShowPanel] = useState(true)
	const [activePanel, setActivePanel] = useState<PanelType>("terminal")
	const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)

  // Layout dimensions
  const [sidebarWidth, setSidebarWidth] = useState<number>(LAYOUT.SIDEBAR_WIDTH)
  const [panelHeight, setPanelHeight] = useState<number>(LAYOUT.PANEL_HEIGHT)
	const [isPanelMaximized, setIsPanelMaximized] = useState(false)

	// Editor state
	const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 })
	const [currentLanguage, setCurrentLanguage] = useState("Plain Text")
	const [recentFiles, setRecentFiles] = useState<{ path: string; name: string }[]>([])

	// Resize refs
	const sidebarResizing = useRef(false)
	const panelResizing = useRef(false)

	const selectedFile = activeTab

	// ============================================================================
	// File Handling
	// ============================================================================

	const handleFileSelect = useCallback(
		(path: string) => {
			const existingTab = openTabs.find((tab) => tab.path === path)
			if (existingTab) {
				setActiveTab(path)
			} else {
				const name = path.split("/").pop() || path
				const newTab: Tab = { path, name, isDirty: false }
				setOpenTabs((prev) => [...prev, newTab])
				setActiveTab(path)
				setRecentFiles((prev) => {
					const filtered = prev.filter((f) => f.path !== path)
					return [{ path, name }, ...filtered].slice(0, 20)
				})
			}
		},
		[openTabs],
	)

	const handleTabClose = useCallback(
		(path: string) => {
			setOpenTabs((prev) => {
				const newTabs = prev.filter((tab) => tab.path !== path)
				if (activeTab === path && newTabs.length > 0) {
					const closedIndex = prev.findIndex((tab) => tab.path === path)
					const newActiveIndex = Math.min(closedIndex, newTabs.length - 1)
					setActiveTab(newTabs[newActiveIndex].path)
				} else if (newTabs.length === 0) {
					setActiveTab(null)
				}
				return newTabs
			})
		},
		[activeTab],
	)

	const handleFileChange = useCallback((path: string) => {
		setOpenTabs((prev) => prev.map((tab) => (tab.path === path ? { ...tab, isDirty: true } : tab)))
	}, [])

	// ============================================================================
	// Layout Controls
	// ============================================================================

	const toggleSidebar = useCallback(() => setShowSidebar((prev) => !prev), [])
	const togglePanel = useCallback(() => {
		setShowPanel((prev) => !prev)
		setIsPanelMaximized(false)
	}, [])
	const togglePanelMaximize = useCallback(() => setIsPanelMaximized((prev) => !prev), [])

	// ============================================================================
	// Resize Handling
	// ============================================================================

	const handleSidebarResizeStart = useCallback((e: React.MouseEvent) => {
		e.preventDefault()
		sidebarResizing.current = true
		document.body.style.cursor = "col-resize"
		document.body.style.userSelect = "none"
	}, [])

	const handlePanelResizeStart = useCallback((e: React.MouseEvent) => {
		e.preventDefault()
		panelResizing.current = true
		document.body.style.cursor = "row-resize"
		document.body.style.userSelect = "none"
	}, [])

	useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			if (sidebarResizing.current) {
				const newWidth = e.clientX - LAYOUT.ACTIVITY_BAR_WIDTH
				setSidebarWidth(Math.max(LAYOUT.SIDEBAR_MIN_WIDTH, Math.min(LAYOUT.SIDEBAR_MAX_WIDTH, newWidth)))
			}
			if (panelResizing.current) {
				const containerHeight = window.innerHeight - LAYOUT.TITLE_BAR_HEIGHT - LAYOUT.STATUS_BAR_HEIGHT
				const newHeight = containerHeight - e.clientY + LAYOUT.TITLE_BAR_HEIGHT
				setPanelHeight(Math.max(LAYOUT.PANEL_MIN_HEIGHT, Math.min(containerHeight - 200, newHeight)))
			}
		}

		const handleMouseUp = () => {
			sidebarResizing.current = false
			panelResizing.current = false
			document.body.style.cursor = ""
			document.body.style.userSelect = ""
		}

		window.addEventListener("mousemove", handleMouseMove)
		window.addEventListener("mouseup", handleMouseUp)

		return () => {
			window.removeEventListener("mousemove", handleMouseMove)
			window.removeEventListener("mouseup", handleMouseUp)
		}
	}, [])

	// ============================================================================
	// Keyboard Shortcuts
	// ============================================================================

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			const isMod = e.metaKey || e.ctrlKey

			// Command Palette
			if (isMod && e.key === "p" && !e.shiftKey) {
				e.preventDefault()
				setIsCommandPaletteOpen(true)
			}
			// Toggle Sidebar
			if (isMod && e.key === "b") {
				e.preventDefault()
				toggleSidebar()
			}
			// Toggle Panel
			if (isMod && e.key === "j") {
				e.preventDefault()
				togglePanel()
			}
			// Close Tab
			if (isMod && e.key === "w") {
				e.preventDefault()
				if (activeTab) handleTabClose(activeTab)
			}
			// Escape to close dialogs
			if (e.key === "Escape") {
				setIsCommandPaletteOpen(false)
			}
		}

		window.addEventListener("keydown", handleKeyDown)
		return () => window.removeEventListener("keydown", handleKeyDown)
	}, [activeTab, handleTabClose, toggleSidebar, togglePanel])

	// ============================================================================
	// Commands
	// ============================================================================

	const commands: CommandItem[] = [
		{ id: "toggle-sidebar", label: "Toggle Sidebar", shortcut: "⌘+B", action: toggleSidebar },
		{ id: "toggle-panel", label: "Toggle Panel", shortcut: "⌘+J", action: togglePanel },
		{
			id: "show-terminal",
			label: "Terminal: New Terminal",
			action: () => {
				setShowPanel(true)
				setActivePanel("terminal")
			},
		},
		{
			id: "show-ai",
			label: "Cline: Open AI Assistant",
			action: () => {
				setShowPanel(true)
				setActivePanel("ai")
			},
		},
		{
			id: "close-tab",
			label: "Close Active Tab",
			shortcut: "⌘+W",
			action: () => activeTab && handleTabClose(activeTab),
		},
		{
			id: "close-all-tabs",
			label: "Close All Tabs",
			action: () => {
				setOpenTabs([])
				setActiveTab(null)
			},
		},
	]

	// ============================================================================
	// Sidebar Content Renderer
	// ============================================================================

	const renderSidebarContent = () => {
		switch (activeActivity) {
			case "explorer":
				return <FileTree onFileSelect={handleFileSelect} projectId={projectId} selectedPath={selectedFile || undefined} />
			case "search":
				return <SearchPanel />
			case "git":
				return <GitPanel />
			case "ai":
				return <AIChat projectId={projectId} />
			default:
				return <EmptyState description="This feature is under development" title="Coming Soon" />
		}
	}

	// ============================================================================
	// Panel Content Renderer
	// ============================================================================

	const renderPanelContent = () => {
		switch (activePanel) {
			case "terminal":
				return <Terminal isActive={activePanel === "terminal"} projectId={projectId} />
			case "ai":
				return <AIChat projectId={projectId} />
			case "problems":
				return <ProblemsPanel />
			case "output":
				return <EmptyState description="Output will appear here..." title="No Output" />
			case "debug":
				return <EmptyState description="Debug output will appear here..." title="Debug Console" />
			default:
				return null
		}
	}

	// ============================================================================
	// Render
	// ============================================================================

	return (
		<div className="h-screen w-screen flex flex-col bg-primary overflow-hidden">
			{/* Title Bar */}
			<TitleBar onOpenCommandPalette={() => setIsCommandPaletteOpen(true)} />

			{/* Main Content */}
			<div className="flex-1 flex overflow-hidden">
				{/* Activity Bar */}
				<ActivityBar
					activeActivity={activeActivity}
					onActivityChange={(activity) => {
						setActiveActivity(activity)
						if (!showSidebar) setShowSidebar(true)
					}}
				/>

				{/* Sidebar */}
				{showSidebar && (
					<>
						<aside
							className="h-full bg-secondary border-r border-border-primary flex flex-col shrink-0 overflow-hidden animate-slide-in-left"
							style={{ width: sidebarWidth }}>
							{renderSidebarContent()}
						</aside>
						<ResizeHandle onMouseDown={handleSidebarResizeStart} orientation="horizontal" />
					</>
				)}

				{/* Main Editor Area */}
				<main className="flex-1 flex flex-col overflow-hidden min-w-0">
					{/* Editor Tabs */}
					<EditorTabs activeTab={activeTab} onTabClose={handleTabClose} onTabSelect={setActiveTab} tabs={openTabs} />

					{/* Breadcrumbs */}
					<Breadcrumbs path={selectedFile} />

					{/* Editor + Panel Container */}
					<div className="flex-1 flex flex-col overflow-hidden">
						{/* Editor Area */}
						{selectedFile ? (
							<div className={cn("overflow-hidden", isPanelMaximized ? "h-0" : "flex-1")}>
								<CodeEditor
									filePath={selectedFile}
									onCursorChange={(line, column) => setCursorPosition({ line, column })}
									onFileChange={handleFileChange}
									onLanguageDetected={setCurrentLanguage}
									projectId={projectId}
								/>
							</div>
						) : (
							<div
								className={cn(
									"flex-1 flex items-center justify-center bg-primary",
									isPanelMaximized && "hidden",
								)}>
								<WelcomeScreen />
							</div>
						)}

						{/* Panel */}
						{showPanel && (
							<>
								<ResizeHandle onMouseDown={handlePanelResizeStart} orientation="vertical" />
								<div
									className="flex flex-col bg-secondary border-t border-border-primary shrink-0 animate-fade-in-up"
									style={{ height: isPanelMaximized ? "calc(100% - 35px)" : panelHeight }}>
									<PanelTabs
										activePanel={activePanel}
										isMaximized={isPanelMaximized}
										onClose={togglePanel}
										onMaximize={togglePanelMaximize}
										onPanelChange={setActivePanel}
									/>
									<div className="flex-1 overflow-hidden">{renderPanelContent()}</div>
								</div>
							</>
						)}
					</div>
				</main>
			</div>

			{/* Status Bar */}
			<StatusBar
				columnNumber={cursorPosition.column}
				currentFile={selectedFile}
				gitBranch="main"
				language={currentLanguage}
				lineNumber={cursorPosition.line}
			/>

			{/* Command Palette */}
			<CommandPalette
				commands={commands}
				isOpen={isCommandPaletteOpen}
				onClose={() => setIsCommandPaletteOpen(false)}
				onFileSelect={handleFileSelect}
				recentFiles={recentFiles}
			/>
		</div>
	)
}

// ============================================================================
// Sub-components
// ============================================================================

// Title Bar
function TitleBar({ onOpenCommandPalette }: { onOpenCommandPalette: () => void }) {
	return (
		<header className="h-title-bar flex items-center justify-between px-2 bg-secondary border-b border-border-primary shrink-0">
			{/* Left */}
			<div className="flex items-center gap-2 w-[200px]">
				<button
					aria-label="Menu"
					className="flex items-center justify-center w-7 h-7 p-0 bg-transparent border-none rounded text-secondary cursor-pointer transition-colors duration-75 hover:bg-surface-tertiary hover:text-primary">
					<MenuIcon size={16} />
				</button>
				<span className="flex items-center text-accent-bright">
					<SparkleIcon size={18} />
				</span>
				<span className="text-sm font-medium text-secondary">Cline IDE</span>
			</div>

			{/* Center - Search */}
			<div className="flex-1 flex justify-center">
				<button
					className="flex items-center gap-2 py-1.5 px-3 min-w-[320px] bg-tertiary border border-border-primary rounded-md text-muted text-sm cursor-pointer transition-all duration-100 hover:bg-elevated hover:border-border-secondary"
					onClick={onOpenCommandPalette}>
					<SearchIcon size={14} />
					<span className="flex-1 text-left">Search or type a command</span>
					<kbd className="px-1.5 py-0.5 text-[10px] text-secondary bg-secondary border border-border-primary rounded">
						⌘P
					</kbd>
				</button>
			</div>

			{/* Right */}
			<div className="w-[200px] flex justify-end" />
		</header>
	)
}

// Welcome Screen
function WelcomeScreen() {
	const shortcuts = [
		{ key: "⌘P", label: "Quick Open" },
		{ key: "⌘B", label: "Toggle Sidebar" },
		{ key: "⌘J", label: "Toggle Panel" },
	]

	return (
		<div className="flex flex-col items-center text-center p-8 animate-fade-in">
			<div className="w-24 h-24 flex items-center justify-center mb-6 text-accent-primary opacity-30">
				<SparkleIcon size={80} />
			</div>
			<h2 className="text-xl font-medium text-secondary mb-2">Welcome to Cline IDE</h2>
			<p className="text-[13px] text-muted mb-6">Start by opening a file from the explorer</p>
			<div className="flex gap-6">
				{shortcuts.map((shortcut) => (
					<div className="flex flex-col items-center gap-1.5" key={shortcut.key}>
						<kbd className="py-1.5 px-2.5 text-sm text-primary bg-tertiary border border-border-secondary rounded">
							{shortcut.key}
						</kbd>
						<span className="text-xs text-muted">{shortcut.label}</span>
					</div>
				))}
			</div>
		</div>
	)
}

// Search Panel (placeholder)
function SearchPanel() {
	return (
		<div className="h-full flex flex-col">
			<div className="flex items-center justify-between py-2 px-3 border-b border-border-primary">
				<span className="text-[11px] font-semibold text-secondary uppercase tracking-wider">Search</span>
			</div>
			<div className="p-2 flex gap-1.5">
				<input
					className="flex-1 h-8 px-3 text-sm text-primary bg-tertiary border border-border-primary rounded-md outline-none transition-colors duration-100 focus:border-accent-bright placeholder:text-muted"
					placeholder="Search files..."
					type="text"
				/>
			</div>
			<div className="flex-1 flex items-center justify-center text-muted text-sm">
				<span>Enter a search term</span>
			</div>
		</div>
	)
}

// Git Panel (placeholder)
function GitPanel() {
	return (
		<div className="h-full flex flex-col">
			<div className="flex items-center justify-between py-2 px-3 border-b border-border-primary">
				<span className="text-[11px] font-semibold text-secondary uppercase tracking-wider">Source Control</span>
			</div>
			<div className="flex-1 flex items-center justify-center text-muted text-sm">
				<span>No changes detected</span>
			</div>
		</div>
	)
}

// Problems Panel (placeholder)
function ProblemsPanel() {
	return (
		<div className="h-full flex flex-col items-center justify-center gap-3 text-muted text-sm">
			<svg
				className="opacity-30"
				fill="none"
				height="32"
				stroke="currentColor"
				strokeWidth="1.5"
				viewBox="0 0 24 24"
				width="32">
				<circle cx="12" cy="12" r="10" />
				<path d="M8 12L11 15L16 9" />
			</svg>
			<span>No problems detected</span>
		</div>
	)
}
