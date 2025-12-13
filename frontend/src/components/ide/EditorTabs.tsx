/**
 * Editor Tabs Component
 * VS Code-style tab bar with drag-and-drop support
 */
"use client"

import { memo, useEffect, useRef, useState } from "react"
import { CloseIcon, MoreIcon, SplitIcon } from "@/components/ui/icons"
import { IconButton } from "@/components/ui/primitives"
import { getFileIcon } from "@/lib/file-icons"
import { cn } from "@/lib/utils"

// Types
export interface Tab {
	path: string
	name: string
	isDirty: boolean
	isPinned?: boolean
}

interface EditorTabsProps {
	tabs: Tab[]
	activeTab: string | null
	onTabSelect: (path: string) => void
	onTabClose: (path: string) => void
	onTabPin?: (path: string) => void
	onTabsReorder?: (tabs: Tab[]) => void
}

export default function EditorTabs({ tabs, activeTab, onTabSelect, onTabClose }: EditorTabsProps) {
	const [draggedTab, setDraggedTab] = useState<string | null>(null)
	const [dropTarget, setDropTarget] = useState<string | null>(null)
	const tabsContainerRef = useRef<HTMLDivElement>(null)

	// Scroll active tab into view
	useEffect(() => {
		if (activeTab && tabsContainerRef.current) {
			const activeTabElement = tabsContainerRef.current.querySelector(`[data-path="${activeTab}"]`)
			activeTabElement?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" })
		}
	}, [activeTab])

	// Handle middle-click to close
	const handleMouseDown = (e: React.MouseEvent, path: string) => {
		if (e.button === 1) {
			e.preventDefault()
			onTabClose(path)
		}
	}

	// Handle close button click
	const handleClose = (e: React.MouseEvent, path: string) => {
		e.stopPropagation()
		onTabClose(path)
	}

	// Drag handlers
	const handleDragStart = (path: string) => setDraggedTab(path)
	const handleDragOver = (e: React.DragEvent, path: string) => {
		e.preventDefault()
		if (draggedTab && draggedTab !== path) {
			setDropTarget(path)
		}
	}
	const handleDragEnd = () => {
		setDraggedTab(null)
		setDropTarget(null)
	}

	if (tabs.length === 0) return null

	return (
		<div className="flex items-center h-tab bg-secondary border-b border-border-primary shrink-0">
			{/* Tabs Container */}
			<div className="flex flex-1 overflow-x-auto overflow-y-hidden scrollbar-none" ref={tabsContainerRef}>
				{tabs.map((tab) => (
					<TabItem
						isActive={activeTab === tab.path}
						isDragging={draggedTab === tab.path}
						isDropTarget={dropTarget === tab.path}
						key={tab.path}
						onClick={() => onTabSelect(tab.path)}
						onClose={(e) => handleClose(e, tab.path)}
						onDragEnd={handleDragEnd}
						onDragOver={(e) => handleDragOver(e, tab.path)}
						onDragStart={() => handleDragStart(tab.path)}
						onMouseDown={(e) => handleMouseDown(e, tab.path)}
						tab={tab}
					/>
				))}
			</div>

			{/* Tab Actions */}
			<div className="flex items-center gap-0.5 px-2 shrink-0 border-l border-border-primary">
				<IconButton size="sm" tooltip="Split Editor">
					<SplitIcon size={15} />
				</IconButton>
				<IconButton size="sm" tooltip="More Actions">
					<MoreIcon size={15} />
				</IconButton>
			</div>
		</div>
	)
}

// Memoized Tab Item Component
interface TabItemProps {
	tab: Tab
	isActive: boolean
	isDragging: boolean
	isDropTarget: boolean
	onClick: () => void
	onClose: (e: React.MouseEvent) => void
	onMouseDown: (e: React.MouseEvent) => void
	onDragStart: () => void
	onDragOver: (e: React.DragEvent) => void
	onDragEnd: () => void
}

const TabItem = memo(function TabItem({
	tab,
	isActive,
	isDragging,
	isDropTarget,
	onClick,
	onClose,
	onMouseDown,
	onDragStart,
	onDragOver,
	onDragEnd,
}: TabItemProps) {
	const { icon, color } = getFileIcon(tab.name, false)

	return (
		<div
			className={cn(
				"flex items-center gap-2 h-full px-3 pr-1.5 border-r border-border-primary",
				"cursor-pointer select-none shrink-0 max-w-[180px] group",
				"transition-colors duration-75",
				isActive
					? "bg-primary text-bright border-b-2 border-b-accent-bright -mb-[2px]"
					: "bg-secondary text-secondary hover:bg-tertiary hover:text-primary",
				isDragging && "opacity-50",
				isDropTarget && "border-l-2 border-l-accent-bright",
			)}
			data-path={tab.path}
			draggable
			onClick={onClick}
			onDragEnd={onDragEnd}
			onDragOver={onDragOver}
			onDragStart={onDragStart}
			onMouseDown={onMouseDown}>
			{/* File Icon */}
			<span className="flex items-center justify-center w-4 h-4 shrink-0" style={{ color }}>
				{icon}
			</span>

			{/* File Name */}
			<span className="text-[13px] truncate-text">{tab.name}</span>

			{/* Dirty Indicator */}
			{tab.isDirty && <span className="w-2 h-2 rounded-full bg-bright shrink-0" />}

			{/* Close Button */}
			<button
				aria-label={`Close ${tab.name}`}
				className={cn(
					"flex items-center justify-center w-5 h-5 p-0",
					"bg-transparent border-none rounded cursor-pointer shrink-0",
					"text-muted hover:text-primary hover:bg-surface-elevated",
					"transition-all duration-75",
					isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100",
				)}
				onClick={onClose}>
				<CloseIcon size={14} />
			</button>
		</div>
	)
})
