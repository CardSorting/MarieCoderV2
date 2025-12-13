/**
 * Panel Tabs Component
 * VS Code-style panel tab bar for terminal, problems, output, etc.
 */
"use client"

import { CloseIcon, MaximizeIcon, PlusIcon, RestoreIcon, SplitIcon } from "@/components/ui/icons"
import { Badge, IconButton } from "@/components/ui/primitives"
import { cn } from "@/lib/utils"

export type PanelType = "terminal" | "problems" | "output" | "debug" | "ai"

interface PanelConfig {
	id: PanelType
	label: string
	badge?: number
}

interface PanelTabsProps {
	activePanel: PanelType
	onPanelChange: (panel: PanelType) => void
	onClose: () => void
	onMaximize?: () => void
	problemCount?: number
	isMaximized?: boolean
}

export default function PanelTabs({
	activePanel,
	onPanelChange,
	onClose,
	onMaximize,
	problemCount = 0,
	isMaximized = false,
}: PanelTabsProps) {
	const panels: PanelConfig[] = [
		{ id: "problems", label: "Problems", badge: problemCount > 0 ? problemCount : undefined },
		{ id: "output", label: "Output" },
		{ id: "debug", label: "Debug Console" },
		{ id: "terminal", label: "Terminal" },
		{ id: "ai", label: "AI Assistant" },
	]

	return (
		<div className="flex items-center justify-between h-tab bg-secondary border-b border-border-primary shrink-0">
			{/* Panel Tabs */}
			<div className="flex items-center pl-3 overflow-x-auto scrollbar-none">
				{panels.map((panel) => (
					<button
						className={cn(
							"flex items-center gap-1.5 h-tab px-3",
							"bg-transparent border-none text-xs uppercase tracking-wide",
							"cursor-pointer transition-colors duration-75",
							"border-b-2 -mb-[2px]",
							activePanel === panel.id
								? "text-primary border-b-accent-bright"
								: "text-muted border-b-transparent hover:text-secondary",
						)}
						key={panel.id}
						onClick={() => onPanelChange(panel.id)}>
						<span className="whitespace-nowrap">{panel.label}</span>
						{panel.badge !== undefined && <Badge variant="default">{panel.badge}</Badge>}
					</button>
				))}
			</div>

			{/* Panel Actions */}
			<div className="flex items-center gap-0.5 px-2">
				{/* New Terminal Button (only for terminal panel) */}
				{activePanel === "terminal" && (
					<IconButton size="sm" tooltip="New Terminal">
						<PlusIcon size={14} />
					</IconButton>
				)}

				{/* Split Panel */}
				<IconButton size="sm" tooltip="Split Panel">
					<SplitIcon size={14} />
				</IconButton>

				{/* Maximize/Restore */}
				<IconButton onClick={onMaximize} size="sm" tooltip={isMaximized ? "Restore" : "Maximize"}>
					{isMaximized ? <RestoreIcon size={14} /> : <MaximizeIcon size={14} />}
				</IconButton>

				{/* Close Panel */}
				<IconButton onClick={onClose} size="sm" tooltip="Close Panel">
					<CloseIcon size={14} />
				</IconButton>
			</div>
		</div>
	)
}
