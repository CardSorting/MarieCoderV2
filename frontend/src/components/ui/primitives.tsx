/**
 * UI Primitives
 * Reusable, accessible base components following VS Code design patterns
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
	primary: "bg-accent-primary text-white hover:bg-accent-secondary active:bg-accent-bright",
	secondary: "bg-surface-secondary text-primary border border-border-primary hover:bg-surface-tertiary",
	ghost: "text-secondary hover:text-primary hover:bg-surface-secondary",
	danger: "bg-status-error text-white hover:bg-red-600",
	icon: "text-secondary hover:text-primary hover:bg-surface-secondary",
}

const buttonSizes: Record<ButtonSize, string> = {
	sm: "h-7 px-2.5 text-xs gap-1.5",
	md: "h-8 px-3 text-sm gap-2",
	lg: "h-10 px-4 text-sm gap-2",
	icon: "h-7 w-7 p-0 justify-center",
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant = "secondary", size = "md", isLoading, disabled, children, ...props }, ref) => {
		return (
			<button
				className={cn(
					"inline-flex items-center justify-center font-medium rounded-md transition-all duration-150",
					"focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-bright",
					"disabled:opacity-50 disabled:pointer-events-none",
					buttonVariants[variant],
					buttonSizes[size],
					className,
				)}
				disabled={disabled || isLoading}
				ref={ref}
				{...props}>
				{isLoading ? (
					<span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
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
	size?: "sm" | "md"
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
	({ className, tooltip, size = "md", children, ...props }, ref) => {
		const sizeClass = size === "sm" ? "w-6 h-6" : "w-7 h-7"

		return (
			<button
				className={cn(
					"inline-flex items-center justify-center rounded-md",
					"text-secondary hover:text-primary hover:bg-surface-secondary",
					"transition-colors duration-100",
					"focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-bright",
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
				"w-full h-8 px-3 text-sm text-primary bg-surface-tertiary",
				"border rounded-md outline-none transition-all duration-150",
				"placeholder:text-muted",
				error
					? "border-status-error focus:border-status-error focus:ring-1 focus:ring-status-error"
					: "border-border-primary focus:border-accent-bright focus:ring-1 focus:ring-accent-bright",
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
					"w-full px-3 py-2 text-sm text-primary bg-surface-tertiary",
					"border border-border-primary rounded-md outline-none",
					"transition-all duration-150 resize-none",
					"placeholder:text-muted",
					"focus:border-accent-bright focus:ring-1 focus:ring-accent-bright",
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
	variant?: "default" | "success" | "warning" | "error"
}

const badgeVariants = {
	default: "bg-accent-primary text-white",
	success: "bg-status-success text-white",
	warning: "bg-status-warning text-surface-primary",
	error: "bg-status-error text-white",
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(({ className, variant = "default", children, ...props }, ref) => {
	return (
		<span
			className={cn(
				"inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5",
				"text-[10px] font-semibold rounded-full",
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
				"text-[10px] font-sans text-secondary",
				"bg-surface-tertiary border border-border-primary rounded",
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
					"absolute z-50 px-2.5 py-1.5",
					"text-xs font-medium text-white whitespace-nowrap",
					"bg-surface-tertiary border border-border-secondary rounded-md shadow-lg",
					"opacity-0 invisible group-hover:opacity-100 group-hover:visible",
					"transition-opacity duration-150 pointer-events-none",
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
				"bg-gradient-to-r from-surface-tertiary via-surface-secondary to-surface-tertiary",
				"bg-[length:200%_100%] animate-shimmer rounded",
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
		<div className="flex flex-col items-center justify-center text-center p-8 animate-fade-in">
			{icon && <div className="mb-4 text-muted opacity-50">{icon}</div>}
			<h3 className="text-lg font-medium text-secondary mb-1">{title}</h3>
			{description && <p className="text-sm text-muted mb-4">{description}</p>}
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
				"shrink-0 bg-transparent hover:bg-accent-bright/30 transition-colors duration-100",
				orientation === "horizontal" ? "w-1 cursor-col-resize hover:w-0.5" : "h-1 w-full cursor-row-resize hover:h-0.5",
			)}
			onMouseDown={onMouseDown}
		/>
	)
}
