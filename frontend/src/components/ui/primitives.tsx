/**
 * UI Primitives
 * Reusable, accessible base components with modern SaaS styling
 */
"use client"

import { type ButtonHTMLAttributes, forwardRef, type HTMLAttributes, type InputHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

// ============================================================================
// Button Variants
// ============================================================================

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "icon"
type ButtonSize = "sm" | "md" | "lg" | "icon"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant
	size?: ButtonSize
	isLoading?: boolean
}

const buttonVariants: Record<ButtonVariant, string> = {
	primary: "bg-gradient-to-r from-accent-primary to-accent-secondary text-white hover:opacity-90 active:opacity-80 shadow-md hover:shadow-lg",
	secondary: "bg-surface-tertiary text-text-primary border border-border-primary hover:bg-surface-elevated hover:border-border-secondary",
	ghost: "text-text-secondary hover:text-text-bright hover:bg-surface-tertiary",
	danger: "bg-accent-rose text-white hover:bg-red-600 shadow-md",
	icon: "text-text-secondary hover:text-text-bright hover:bg-surface-tertiary",
}

const buttonSizes: Record<ButtonSize, string> = {
	sm: "h-8 px-3 text-xs gap-1.5 rounded-lg",
	md: "h-9 px-4 text-sm gap-2 rounded-lg",
	lg: "h-11 px-5 text-sm gap-2 rounded-xl",
	icon: "h-9 w-9 p-0 justify-center rounded-lg",
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant = "secondary", size = "md", isLoading, disabled, children, ...props }, ref) => {
		return (
			<button
				className={cn(
					"inline-flex items-center justify-center font-medium transition-all duration-150",
					"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-primary",
					"disabled:opacity-50 disabled:pointer-events-none",
					buttonVariants[variant],
					buttonSizes[size],
					className,
				)}
				disabled={disabled || isLoading}
				ref={ref}
				{...props}>
				{isLoading ? (
					<>
						<span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
						<span className="ml-2">Loading...</span>
					</>
				) : (
					children
				)}
			</button>
		)
	},
)
Button.displayName = "Button"

// ============================================================================
// Icon Button (for toolbar actions)
// ============================================================================

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	tooltip?: string
	size?: "sm" | "md" | "lg"
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
	({ className, tooltip, size = "md", children, ...props }, ref) => {
		const sizeClass = {
			sm: "w-7 h-7",
			md: "w-9 h-9",
			lg: "w-11 h-11",
		}[size]

		return (
			<button
				className={cn(
					"inline-flex items-center justify-center rounded-lg",
					"text-text-secondary hover:text-text-bright hover:bg-surface-tertiary",
					"transition-all duration-100",
					"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary",
					"disabled:opacity-40 disabled:pointer-events-none",
					sizeClass,
					className,
				)}
				ref={ref}
				title={tooltip}
				{...props}>
				{children}
			</button>
		)
	},
)
IconButton.displayName = "IconButton"

// ============================================================================
// Input
// ============================================================================

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
	error?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, error, ...props }, ref) => {
	return (
		<input
			className={cn(
				"w-full h-10 px-4 text-sm text-text-primary bg-surface-tertiary",
				"border rounded-xl outline-none transition-all duration-150",
				"placeholder:text-text-muted",
				error
					? "border-accent-rose focus:border-accent-rose focus:ring-2 focus:ring-accent-rose/20"
					: "border-border-primary focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20",
				className,
			)}
			ref={ref}
			{...props}
		/>
	)
})
Input.displayName = "Input"

// ============================================================================
// TextArea
// ============================================================================

export const TextArea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
	({ className, ...props }, ref) => {
		return (
			<textarea
				className={cn(
					"w-full px-4 py-3 text-sm text-text-primary bg-surface-tertiary",
					"border border-border-primary rounded-xl outline-none",
					"transition-all duration-150 resize-none",
					"placeholder:text-text-muted",
					"focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20",
					className,
				)}
				ref={ref}
				{...props}
			/>
		)
	},
)
TextArea.displayName = "TextArea"

// ============================================================================
// Badge
// ============================================================================

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
	variant?: "default" | "success" | "warning" | "error" | "info"
}

const badgeVariants = {
	default: "bg-accent-primary/20 text-accent-bright",
	success: "bg-accent-emerald/20 text-accent-emerald",
	warning: "bg-accent-amber/20 text-accent-amber",
	error: "bg-accent-rose/20 text-accent-rose",
	info: "bg-status-info/20 text-status-info",
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(({ className, variant = "default", children, ...props }, ref) => {
	return (
		<span
			className={cn(
				"inline-flex items-center justify-center px-2 py-0.5",
				"text-xs font-medium rounded-full",
				badgeVariants[variant],
				className,
			)}
			ref={ref}
			{...props}>
			{children}
		</span>
	)
})
Badge.displayName = "Badge"

// ============================================================================
// Kbd (Keyboard Key)
// ============================================================================

export function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
	return (
		<kbd
			className={cn(
				"inline-flex items-center justify-center min-w-[20px] h-5 px-1.5",
				"text-[10px] font-medium text-text-muted",
				"bg-surface-elevated border border-border-primary rounded",
				className,
			)}>
			{children}
		</kbd>
	)
}

// ============================================================================
// Tooltip (simple CSS-only)
// ============================================================================

interface TooltipProps extends HTMLAttributes<HTMLDivElement> {
	content: string
	position?: "top" | "bottom" | "left" | "right"
}

export function Tooltip({ content, position = "right", children, className }: TooltipProps) {
	const positionClasses = {
		top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
		bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
		left: "right-full top-1/2 -translate-y-1/2 mr-2",
		right: "left-full top-1/2 -translate-y-1/2 ml-2",
	}

	return (
		<div className={cn("relative group", className)}>
			{children}
			<div
				className={cn(
					"absolute z-50 px-3 py-1.5",
					"text-xs font-medium text-text-bright whitespace-nowrap",
					"bg-surface-elevated border border-border-secondary rounded-lg shadow-xl",
					"opacity-0 invisible group-hover:opacity-100 group-hover:visible",
					"transition-all duration-150 pointer-events-none",
					positionClasses[position],
				)}>
				{content}
			</div>
		</div>
	)
}

// ============================================================================
// Separator
// ============================================================================

interface SeparatorProps extends HTMLAttributes<HTMLDivElement> {
	orientation?: "horizontal" | "vertical"
}

export function Separator({ orientation = "horizontal", className }: SeparatorProps) {
	return (
		<div
			className={cn("bg-border-primary shrink-0", orientation === "horizontal" ? "h-px w-full" : "w-px h-full", className)}
		/>
	)
}

// ============================================================================
// Skeleton Loader
// ============================================================================

export function Skeleton({ className }: { className?: string }) {
	return (
		<div
			className={cn(
				"bg-gradient-to-r from-surface-tertiary via-surface-elevated to-surface-tertiary",
				"bg-[length:200%_100%] animate-shimmer rounded-lg",
				className,
			)}
		/>
	)
}

// ============================================================================
// Empty State
// ============================================================================

interface EmptyStateProps {
	icon?: React.ReactNode
	title: string
	description?: string
	action?: React.ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
	return (
		<div className="flex flex-col items-center justify-center text-center p-12 animate-fade-in">
			{icon && <div className="mb-6">{icon}</div>}
			<h3 className="text-xl font-semibold text-text-bright mb-2">{title}</h3>
			{description && <p className="text-sm text-text-secondary mb-6 max-w-sm">{description}</p>}
			{action}
		</div>
	)
}

// ============================================================================
// Resize Handle
// ============================================================================

interface ResizeHandleProps {
	orientation: "horizontal" | "vertical"
	onMouseDown: (e: React.MouseEvent) => void
}

export function ResizeHandle({ orientation, onMouseDown }: ResizeHandleProps) {
	return (
		<div
			className={cn(
				"shrink-0 bg-transparent hover:bg-accent-primary/40 transition-colors duration-100",
				orientation === "horizontal" ? "w-1 cursor-col-resize" : "h-1 w-full cursor-row-resize",
			)}
			onMouseDown={onMouseDown}
		/>
	)
}

// ============================================================================
// Card
// ============================================================================

interface CardProps extends HTMLAttributes<HTMLDivElement> {
	variant?: "default" | "interactive"
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
	({ className, variant = "default", children, ...props }, ref) => {
		return (
			<div
				className={cn(
					"bg-surface-secondary border border-border-primary rounded-xl",
					variant === "interactive" && "hover:border-accent-primary/50 transition-all cursor-pointer card-hover",
					className,
				)}
				ref={ref}
				{...props}>
				{children}
			</div>
		)
	},
)
Card.displayName = "Card"

// ============================================================================
// Avatar
// ============================================================================

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
	src?: string
	fallback: string
	size?: "sm" | "md" | "lg"
}

export function Avatar({ src, fallback, size = "md", className }: AvatarProps) {
	const sizeClasses = {
		sm: "w-8 h-8 text-xs",
		md: "w-10 h-10 text-sm",
		lg: "w-12 h-12 text-base",
	}

	return (
		<div
			className={cn(
				"rounded-full bg-gradient-to-br from-accent-primary to-accent-cyan flex items-center justify-center text-white font-medium overflow-hidden",
				sizeClasses[size],
				className,
			)}>
			{src ? (
				<img alt={fallback} className="w-full h-full object-cover" src={src} />
			) : (
				fallback[0].toUpperCase()
			)}
		</div>
	)
}

// ============================================================================
// Switch / Toggle
// ============================================================================

interface SwitchProps {
	checked: boolean
	onChange: (checked: boolean) => void
	disabled?: boolean
	className?: string
}

export function Switch({ checked, onChange, disabled, className }: SwitchProps) {
	return (
		<button
			className={cn(
				"relative w-11 h-6 rounded-full transition-colors duration-200",
				checked ? "bg-accent-primary" : "bg-surface-elevated",
				disabled && "opacity-50 cursor-not-allowed",
				className,
			)}
			disabled={disabled}
			onClick={() => !disabled && onChange(!checked)}
			type="button">
			<span
				className={cn(
					"absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200",
					checked && "translate-x-5",
				)}
			/>
		</button>
	)
}

// ============================================================================
// Progress Bar
// ============================================================================

interface ProgressProps {
	value: number
	max?: number
	className?: string
	showLabel?: boolean
}

export function Progress({ value, max = 100, className, showLabel }: ProgressProps) {
	const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

	return (
		<div className={cn("w-full", className)}>
			<div className="h-2 bg-surface-tertiary rounded-full overflow-hidden">
				<div
					className="h-full bg-gradient-to-r from-accent-primary to-accent-cyan rounded-full transition-all duration-300"
					style={{ width: `${percentage}%` }}
				/>
			</div>
			{showLabel && (
				<div className="mt-1 text-xs text-text-muted text-right">{Math.round(percentage)}%</div>
			)}
		</div>
	)
}
