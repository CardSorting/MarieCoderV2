/**
 * Activity Bar Component
 * VS Code-style vertical navigation sidebar
 */
"use client"

import { useState } from "react"
import {
  DebugIcon,
  ExplorerIcon,
  ExtensionsIcon,
  GitBranchIcon,
  SearchIcon,
  SettingsIcon,
  SparkleIcon,
  UserIcon,
} from "@/components/ui/icons"
import { cn } from "@/lib/utils"

// Activity types matching VS Code
export type ActivityType = "explorer" | "search" | "git" | "debug" | "extensions" | "ai"

interface ActivityItem {
	id: ActivityType
	label: string
	icon: React.ReactNode
	badge?: number
}

interface ActivityBarProps {
	activeActivity: ActivityType
	onActivityChange: (activity: ActivityType) => void
	aiNotificationCount?: number
}

export default function ActivityBar({ activeActivity, onActivityChange, aiNotificationCount = 0 }: ActivityBarProps) {
	const [hoveredItem, setHoveredItem] = useState<ActivityType | null>(null)

	const topActivities: ActivityItem[] = [
		{
			id: "explorer",
			label: "Explorer",
			icon: <ExplorerIcon />,
		},
		{
			id: "search",
			label: "Search",
			icon: <SearchIcon />,
		},
		{
			id: "git",
			label: "Source Control",
			icon: <GitBranchIcon />,
		},
		{
			id: "debug",
			label: "Run and Debug",
			icon: <DebugIcon />,
		},
		{
			id: "extensions",
			label: "Extensions",
			icon: <ExtensionsIcon />,
		},
		{
			id: "ai",
			label: "AI Assistant",
			icon: <SparkleIcon />,
			badge: aiNotificationCount,
		},
	]

	return (
		<div className="w-activity-bar h-full bg-secondary border-r border-border-primary flex flex-col justify-between shrink-0">
			{/* Top Activities */}
			<nav aria-label="Primary" className="flex flex-col items-center py-1" role="tablist">
				{topActivities.map((activity) => (
					<ActivityButton
						activity={activity}
						isActive={activeActivity === activity.id}
						isHovered={hoveredItem === activity.id}
						key={activity.id}
						onClick={() => onActivityChange(activity.id)}
						onMouseEnter={() => setHoveredItem(activity.id)}
						onMouseLeave={() => setHoveredItem(null)}
					/>
				))}
			</nav>

			{/* Bottom Actions */}
			<nav aria-label="Secondary" className="flex flex-col items-center py-1" role="tablist">
				<button
					aria-label="Accounts"
					className="relative w-full h-11 flex items-center justify-center bg-transparent border-none cursor-pointer text-muted hover:text-primary transition-colors duration-100">
					<UserIcon size={20} />
				</button>
				<button
					aria-label="Settings"
					className="relative w-full h-11 flex items-center justify-center bg-transparent border-none cursor-pointer text-muted hover:text-primary transition-colors duration-100">
					<SettingsIcon size={20} />
				</button>
			</nav>
		</div>
	)
}

// Separate component for activity button to keep things clean
interface ActivityButtonProps {
	activity: ActivityItem
	isActive: boolean
	isHovered: boolean
	onClick: () => void
	onMouseEnter: () => void
	onMouseLeave: () => void
}

function ActivityButton({ activity, isActive, isHovered, onClick, onMouseEnter, onMouseLeave }: ActivityButtonProps) {
	return (
		<button
			aria-label={activity.label}
			aria-selected={isActive}
			className={cn(
				"relative w-full h-12 flex items-center justify-center",
				"bg-transparent border-none cursor-pointer transition-colors duration-100",
				isActive ? "text-bright" : "text-muted hover:text-primary",
			)}
			onClick={onClick}
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
			role="tab">
			{/* Active indicator line */}
			<span
				className={cn(
					"absolute left-0 top-1/2 -translate-y-1/2 w-0.5 bg-bright rounded-r-sm transition-all duration-150",
					isActive ? "h-6 opacity-100" : "h-0 opacity-0",
				)}
			/>

			{/* Icon wrapper */}
			<span className="relative flex items-center justify-center">
				{activity.icon}

				{/* Badge for notifications */}
				{activity.badge !== undefined && activity.badge > 0 && (
					<span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 text-[10px] font-semibold text-bright bg-status-info rounded-full flex items-center justify-center">
						{activity.badge > 9 ? "9+" : activity.badge}
					</span>
				)}
			</span>

			{/* Tooltip */}
			{isHovered && (
				<span className="absolute left-[calc(100%+8px)] top-1/2 -translate-y-1/2 z-50 py-1.5 px-2.5 text-sm font-medium text-bright bg-tertiary border border-border-secondary rounded-md shadow-lg whitespace-nowrap pointer-events-none animate-fade-in">
					{activity.label}
				</span>
			)}
		</button>
	)
}
