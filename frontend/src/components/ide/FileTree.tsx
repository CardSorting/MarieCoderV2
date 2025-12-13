/**
 * File Tree Component
 * VS Code-style file explorer with optimized rendering
 */
"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { memo, useCallback, useEffect, useRef, useState } from "react"
import {
  ChevronRightIcon,
  CollapseIcon,
  DeleteIcon,
  NewFileIcon,
  NewFolderIcon,
  RefreshIcon,
  RenameIcon,
} from "@/components/ui/icons"
import { IconButton, Skeleton } from "@/components/ui/primitives"
import { apiClient } from "@/lib/api-client"
import { getFileIcon } from "@/lib/file-icons"
import { cn } from "@/lib/utils"
import { wsClient } from "@/lib/websocket-client"

// Types
interface FileTreeNode {
	name: string
	path: string
	type: "file" | "directory"
	children?: FileTreeNode[]
}

interface FileTreeProps {
	projectId: string
	onFileSelect: (path: string) => void
	selectedPath?: string
}

interface ContextMenuState {
	x: number
	y: number
	path: string
	type: "file" | "directory"
}

// Main FileTree Component
export default function FileTree({ projectId, onFileSelect, selectedPath }: FileTreeProps) {
	const [expanded, setExpanded] = useState<Set<string>>(new Set(["."]))
	const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null)
	const [renaming, setRenaming] = useState<string | null>(null)
	const [newName, setNewName] = useState("")
	const queryClient = useQueryClient()
	const treeRef = useRef<HTMLDivElement>(null)

	// Fetch file tree
	const { data: tree, isLoading } = useQuery<FileTreeNode>({
		queryKey: ["fileTree", projectId],
		queryFn: () => apiClient.getFileTree(projectId),
		refetchInterval: 10000,
	})

	// Listen for file changes
	useEffect(() => {
		const unsubscribe = wsClient.on("file-change", () => {
			queryClient.invalidateQueries({ queryKey: ["fileTree", projectId] })
		})
		return unsubscribe
	}, [projectId, queryClient])

	// Close context menu on click outside
	useEffect(() => {
		const handleClick = () => setContextMenu(null)
		window.addEventListener("click", handleClick)
		return () => window.removeEventListener("click", handleClick)
	}, [])

	// Mutations
	const createFileMutation = useMutation({
		mutationFn: ({ path, content }: { path: string; content: string }) => apiClient.createFile(projectId, path, content),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["fileTree", projectId] }),
	})

	const deleteFileMutation = useMutation({
		mutationFn: (path: string) => apiClient.deleteFile(projectId, path),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["fileTree", projectId] }),
	})

	// Handlers
	const toggleExpand = useCallback((path: string) => {
		setExpanded((prev) => {
			const next = new Set(prev)
			if (next.has(path)) {
				next.delete(path)
			} else {
				next.add(path)
			}
			return next
		})
	}, [])

	const handleContextMenu = (e: React.MouseEvent, path: string, type: "file" | "directory") => {
		e.preventDefault()
		e.stopPropagation()
		setContextMenu({ x: e.clientX, y: e.clientY, path, type })
	}

	const handleCreateFile = () => {
		const fileName = prompt("Enter file name:")
		if (fileName) {
			const basePath = contextMenu?.type === "directory" ? contextMenu.path : ""
			const fullPath = basePath ? `${basePath}/${fileName}` : fileName
			createFileMutation.mutate({ path: fullPath, content: "" })
		}
		setContextMenu(null)
	}

	const handleCreateFolder = () => {
		const folderName = prompt("Enter folder name:")
		if (folderName) {
			const basePath = contextMenu?.type === "directory" ? contextMenu.path : ""
			const fullPath = basePath ? `${basePath}/${folderName}/.gitkeep` : `${folderName}/.gitkeep`
			createFileMutation.mutate({ path: fullPath, content: "" })
		}
		setContextMenu(null)
	}

	const handleDelete = () => {
		if (contextMenu && confirm(`Delete ${contextMenu.path}?`)) {
			deleteFileMutation.mutate(contextMenu.path)
		}
		setContextMenu(null)
	}

	const handleRename = () => {
		if (contextMenu) {
			setRenaming(contextMenu.path)
			setNewName(contextMenu.path.split("/").pop() || "")
		}
		setContextMenu(null)
	}

	const collapseAll = () => {
		setExpanded(new Set(["."]))
	}

	// Loading state
	if (isLoading || !tree) {
		return (
			<div className="h-full flex flex-col bg-secondary select-none">
				<TreeHeader
					onCollapseAll={collapseAll}
					onNewFile={() => createFileMutation.mutate({ path: "untitled", content: "" })}
					onRefresh={() => queryClient.invalidateQueries({ queryKey: ["fileTree", projectId] })}
				/>
				<div className="p-3 space-y-2">
					<Skeleton className="w-4/5 h-4" />
					<Skeleton className="w-3/5 h-4 ml-4" />
					<Skeleton className="w-[70%] h-4 ml-4" />
					<Skeleton className="w-1/2 h-4 ml-8" />
					<Skeleton className="w-3/4 h-4" />
					<Skeleton className="w-2/3 h-4 ml-4" />
				</div>
			</div>
		)
	}

	return (
		<div className="h-full flex flex-col bg-secondary select-none" ref={treeRef}>
			<TreeHeader
				onCollapseAll={collapseAll}
				onNewFile={() => createFileMutation.mutate({ path: "untitled", content: "" })}
				onRefresh={() => queryClient.invalidateQueries({ queryKey: ["fileTree", projectId] })}
			/>

			{/* File Tree */}
			<div className="flex-1 overflow-y-auto overflow-x-hidden py-0.5 scrollbar-thin">
				<FileTreeNodeComponent
					depth={0}
					expanded={expanded}
					newName={newName}
					node={tree}
					onContextMenu={handleContextMenu}
					onNewNameChange={setNewName}
					onRenameComplete={() => setRenaming(null)}
					onSelect={onFileSelect}
					onToggle={toggleExpand}
					renaming={renaming}
					selectedPath={selectedPath}
				/>
			</div>

			{/* Context Menu */}
			{contextMenu && (
				<ContextMenu
					onDelete={handleDelete}
					onNewFile={handleCreateFile}
					onNewFolder={handleCreateFolder}
					onRename={handleRename}
					x={contextMenu.x}
					y={contextMenu.y}
				/>
			)}
		</div>
	)
}

// Tree Header Component
interface TreeHeaderProps {
	onNewFile: () => void
	onRefresh: () => void
	onCollapseAll: () => void
}

function TreeHeader({ onNewFile, onRefresh, onCollapseAll }: TreeHeaderProps) {
	return (
		<div className="flex items-center justify-between py-2 px-3 border-b border-border-primary shrink-0 group">
			<span className="text-[11px] font-semibold text-secondary uppercase tracking-wider">Explorer</span>
			<div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-100">
				<IconButton onClick={onNewFile} size="sm" tooltip="New File">
					<NewFileIcon size={15} />
				</IconButton>
				<IconButton size="sm" tooltip="New Folder">
					<NewFolderIcon size={15} />
				</IconButton>
				<IconButton onClick={onRefresh} size="sm" tooltip="Refresh">
					<RefreshIcon size={15} />
				</IconButton>
				<IconButton onClick={onCollapseAll} size="sm" tooltip="Collapse All">
					<CollapseIcon size={15} />
				</IconButton>
			</div>
		</div>
	)
}

// File Tree Node Component (memoized for performance)
interface FileTreeNodeProps {
	node: FileTreeNode
	depth: number
	expanded: Set<string>
	selectedPath?: string
	renaming: string | null
	newName: string
	onToggle: (path: string) => void
	onSelect: (path: string) => void
	onContextMenu: (e: React.MouseEvent, path: string, type: "file" | "directory") => void
	onNewNameChange: (name: string) => void
	onRenameComplete: () => void
}

const FileTreeNodeComponent = memo(function FileTreeNodeComponent({
	node,
	depth,
	expanded,
	selectedPath,
	renaming,
	newName,
	onToggle,
	onSelect,
	onContextMenu,
	onNewNameChange,
	onRenameComplete,
}: FileTreeNodeProps) {
	const isExpanded = expanded.has(node.path)
	const isSelected = selectedPath === node.path
	const isRenaming = renaming === node.path
	const isDirectory = node.type === "directory"
	const { icon, color } = getFileIcon(node.name, isDirectory, isExpanded)

	// Sort children: directories first, then alphabetically
	const sortedChildren = node.children?.slice().sort((a, b) => {
		if (a.type !== b.type) return a.type === "directory" ? -1 : 1
		return a.name.localeCompare(b.name)
	})

	const handleClick = () => {
		if (isDirectory) {
			onToggle(node.path)
		} else {
			onSelect(node.path)
		}
	}

	const paddingLeft = depth * 12 + 8

	return (
		<div>
			<div
				className={cn(
					"flex items-center gap-1.5 py-[3px] pr-2 cursor-pointer transition-colors duration-75 group",
					isSelected ? "bg-accent-muted text-bright" : "hover:bg-surface-tertiary text-primary",
				)}
				onClick={handleClick}
				onContextMenu={(e) => onContextMenu(e, node.path, node.type)}
				style={{ paddingLeft }}>
				{/* Expand/Collapse Chevron */}
				{isDirectory && (
					<span
						className={cn(
							"flex items-center justify-center w-4 h-4 text-muted transition-transform duration-100 shrink-0",
							isExpanded && "rotate-90",
						)}>
						<ChevronRightIcon size={12} />
					</span>
				)}

				{/* File/Folder Icon */}
				<span
					className="flex items-center justify-center w-4 h-4 shrink-0"
					style={{ color, marginLeft: isDirectory ? 0 : 16 }}>
					{icon}
				</span>

				{/* Name or Rename Input */}
				{isRenaming ? (
					<input
						autoFocus
						className="flex-1 py-0.5 px-1.5 text-sm text-primary bg-primary border border-accent-bright rounded outline-none"
						onBlur={onRenameComplete}
						onChange={(e) => onNewNameChange(e.target.value)}
						onClick={(e) => e.stopPropagation()}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === "Escape") onRenameComplete()
						}}
						type="text"
						value={newName}
					/>
				) : (
					<span className="text-[13px] truncate-text">{node.name}</span>
				)}
			</div>

			{/* Children */}
			{isDirectory && isExpanded && sortedChildren && (
				<div className="animate-fade-in">
					{sortedChildren.map((child) => (
						<FileTreeNodeComponent
							depth={depth + 1}
							expanded={expanded}
							key={child.path}
							newName={newName}
							node={child}
							onContextMenu={onContextMenu}
							onNewNameChange={onNewNameChange}
							onRenameComplete={onRenameComplete}
							onSelect={onSelect}
							onToggle={onToggle}
							renaming={renaming}
							selectedPath={selectedPath}
						/>
					))}
				</div>
			)}
		</div>
	)
})

// Context Menu Component
interface ContextMenuProps {
	x: number
	y: number
	onNewFile: () => void
	onNewFolder: () => void
	onRename: () => void
	onDelete: () => void
}

function ContextMenu({ x, y, onNewFile, onNewFolder, onRename, onDelete }: ContextMenuProps) {
	return (
		<div
			className="fixed min-w-[180px] py-1 bg-tertiary border border-border-secondary rounded-md shadow-lg z-[10000] animate-scale-in"
			style={{ left: x, top: y }}>
			<ContextMenuItem icon={<NewFileIcon size={14} />} onClick={onNewFile}>
				New File
			</ContextMenuItem>
			<ContextMenuItem icon={<NewFolderIcon size={14} />} onClick={onNewFolder}>
				New Folder
			</ContextMenuItem>
			<div className="h-px mx-2 my-1 bg-border-primary" />
			<ContextMenuItem icon={<RenameIcon size={14} />} onClick={onRename}>
				Rename
			</ContextMenuItem>
			<ContextMenuItem icon={<DeleteIcon size={14} />} onClick={onDelete} variant="danger">
				Delete
			</ContextMenuItem>
		</div>
	)
}

interface ContextMenuItemProps {
	icon: React.ReactNode
	children: React.ReactNode
	onClick: () => void
	variant?: "default" | "danger"
}

function ContextMenuItem({ icon, children, onClick, variant = "default" }: ContextMenuItemProps) {
	return (
		<button
			className={cn(
				"flex items-center gap-2.5 w-full py-1.5 px-3 text-left text-sm",
				"bg-transparent border-none cursor-pointer transition-colors duration-75",
				variant === "danger" ? "text-status-error hover:bg-status-error/10" : "text-primary hover:bg-surface-elevated",
			)}
			onClick={onClick}>
			<span className="text-secondary">{icon}</span>
			{children}
		</button>
	)
}
