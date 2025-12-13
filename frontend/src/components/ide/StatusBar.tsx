/**
 * Status Bar Component
 * VS Code-style status bar with contextual information
 */
"use client"

import { BellIcon, CheckIcon, ErrorIcon, GitBranchIcon, RefreshIcon, SparkleIcon, WarningIcon } from "@/components/ui/icons"
import { cn } from "@/lib/utils"

interface StatusBarProps {
	currentFile?: string | null
	lineNumber?: number
	columnNumber?: number
	language?: string
	encoding?: string
	gitBranch?: string
	hasErrors?: boolean
	hasWarnings?: boolean
	errorCount?: number
	warningCount?: number
}

export default function StatusBar({
	currentFile,
	lineNumber = 1,
	columnNumber = 1,
	language = "Plain Text",
	encoding = "UTF-8",
	gitBranch = "main",
	hasErrors = false,
	hasWarnings = false,
	errorCount = 0,
	warningCount = 0,
}: StatusBarProps) {
	return (
		<footer className="flex items-center justify-between h-status-bar bg-accent-primary text-bright text-xs px-2 shrink-0 select-none">
			{/* Left Section */}
			<div className="flex items-center gap-0.5">
				{/* Git Branch */}
				<StatusButton>
					<GitBranchIcon size={14} />
					<span>{gitBranch}</span>
				</StatusButton>

				{/* Sync Status */}
				<StatusButton aria-label="Synchronize Changes">
					<RefreshIcon size={13} />
				</StatusButton>

				{/* Problems */}
				<StatusButton
					aria-label="Problems"
					className={cn(hasErrors && "text-status-error", hasWarnings && !hasErrors && "text-status-warning")}>
					{hasErrors ? (
						<>
							<ErrorIcon size={14} />
							<span>{errorCount}</span>
						</>
					) : hasWarnings ? (
						<>
							<WarningIcon size={14} />
							<span>{warningCount}</span>
						</>
					) : (
						<>
							<CheckIcon size={14} />
							<span>No Problems</span>
						</>
					)}
				</StatusButton>
			</div>

			{/* Right Section */}
			<div className="flex items-center gap-0.5">
				{/* Cursor Position */}
				{currentFile && (
					<StatusButton>
						<span>
							Ln {lineNumber}, Col {columnNumber}
						</span>
					</StatusButton>
				)}

				{/* Indentation */}
				<StatusButton>
					<span>Spaces: 2</span>
				</StatusButton>

				{/* Encoding */}
				<StatusButton>
					<span>{encoding}</span>
				</StatusButton>

				{/* Line Endings */}
				<StatusButton>
					<span>LF</span>
				</StatusButton>

				{/* Language */}
				{currentFile && (
					<StatusButton>
						<span>{language}</span>
					</StatusButton>
				)}

				{/* Notifications */}
				<StatusButton aria-label="Notifications">
					<BellIcon size={13} />
				</StatusButton>

				{/* Cline Status */}
				<StatusButton className="bg-white/10 font-medium">
					<SparkleIcon size={13} />
					<span>Cline</span>
				</StatusButton>
			</div>
		</footer>
	)
}

// Status Bar Button Component
interface StatusButtonProps {
	children: React.ReactNode
	className?: string
	"aria-label"?: string
}

function StatusButton({ children, className, "aria-label": ariaLabel }: StatusButtonProps) {
	return (
		<button
			aria-label={ariaLabel}
			className={cn(
				"flex items-center gap-1 h-full px-2",
				"bg-transparent border-none text-inherit text-xs",
				"cursor-pointer whitespace-nowrap",
				"transition-colors duration-75",
				"hover:bg-white/15",
				className,
			)}>
			{children}
		</button>
	)
}
