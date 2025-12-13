/**
 * Centralized Icon System
 * All SVG icons used throughout the application
 * Prevents duplication and ensures consistency
 */
import { type SVGProps } from "react"

type IconProps = SVGProps<SVGSVGElement> & {
	size?: number
}

const defaultProps = {
	fill: "none",
	stroke: "currentColor",
	strokeWidth: 1.5,
	viewBox: "0 0 24 24",
}

// Activity Bar Icons
export function ExplorerIcon({ size = 22, ...props }: IconProps) {
	return (
		<svg height={size} width={size} {...defaultProps} {...props}>
			<path d="M3 7V17C3 18.1 3.9 19 5 19H19C20.1 19 21 18.1 21 17V9C21 7.9 20.1 7 19 7H13L11 5H5C3.9 5 3 5.9 3 7Z" />
		</svg>
	)
}

export function SearchIcon({ size = 22, ...props }: IconProps) {
	return (
		<svg height={size} width={size} {...defaultProps} {...props}>
			<circle cx="11" cy="11" r="6" />
			<path d="M21 21L16 16" />
		</svg>
	)
}

export function GitBranchIcon({ size = 22, ...props }: IconProps) {
	return (
		<svg height={size} width={size} {...defaultProps} {...props}>
			<circle cx="6" cy="6" r="2" />
			<circle cx="18" cy="18" r="2" />
			<circle cx="6" cy="18" r="2" />
			<path d="M6 8V16" />
			<path d="M6 8C6 8 6 12 12 12C18 12 18 16 18 16" />
		</svg>
	)
}

export function DebugIcon({ size = 22, ...props }: IconProps) {
	return (
		<svg height={size} width={size} {...defaultProps} {...props}>
			<path d="M12 2L2 7L12 12L22 7L12 2Z" />
			<path d="M2 17L12 22L22 17" />
			<path d="M2 12L12 17L22 12" />
		</svg>
	)
}

export function ExtensionsIcon({ size = 22, ...props }: IconProps) {
	return (
		<svg height={size} width={size} {...defaultProps} {...props}>
			<rect height="8" rx="1" width="8" x="3" y="3" />
			<rect height="8" rx="1" width="8" x="13" y="3" />
			<rect height="8" rx="1" width="8" x="3" y="13" />
			<path d="M13 13h8v8h-8z" strokeDasharray="3 2" />
		</svg>
	)
}

export function SparkleIcon({ size = 22, ...props }: IconProps) {
	return (
		<svg fill="currentColor" height={size} viewBox="0 0 24 24" width={size} {...props}>
			<path d="M12 2L14.5 8L21 9L16 14L17.5 21L12 17.5L6.5 21L8 14L3 9L9.5 8L12 2Z" />
		</svg>
	)
}

export function UserIcon({ size = 22, ...props }: IconProps) {
	return (
		<svg height={size} width={size} {...defaultProps} {...props}>
			<circle cx="12" cy="8" r="4" />
			<path d="M4 20C4 17 7 14 12 14C17 14 20 17 20 20" />
		</svg>
	)
}

export function SettingsIcon({ size = 22, ...props }: IconProps) {
	return (
		<svg height={size} width={size} {...defaultProps} {...props}>
			<circle cx="12" cy="12" r="3" />
			<path d="M12 1V4M12 20V23M4.22 4.22L6.34 6.34M17.66 17.66L19.78 19.78M1 12H4M20 12H23M4.22 19.78L6.34 17.66M17.66 6.34L19.78 4.22" />
		</svg>
	)
}

// Common UI Icons
export function CloseIcon({ size = 16, ...props }: IconProps) {
	return (
		<svg height={size} width={size} {...defaultProps} strokeWidth={2} {...props}>
			<path d="M18 6L6 18M6 6L18 18" />
		</svg>
	)
}

export function ChevronRightIcon({ size = 16, ...props }: IconProps) {
	return (
		<svg height={size} width={size} {...defaultProps} strokeWidth={2} {...props}>
			<path d="M9 6L15 12L9 18" />
		</svg>
	)
}

export function ChevronDownIcon({ size = 16, ...props }: IconProps) {
	return (
		<svg height={size} width={size} {...defaultProps} strokeWidth={2} {...props}>
			<path d="M6 9L12 15L18 9" />
		</svg>
	)
}

export function PlusIcon({ size = 16, ...props }: IconProps) {
	return (
		<svg height={size} width={size} {...defaultProps} {...props}>
			<path d="M12 5V19M5 12H19" />
		</svg>
	)
}

export function RefreshIcon({ size = 16, ...props }: IconProps) {
	return (
		<svg height={size} width={size} {...defaultProps} {...props}>
			<path d="M23 4V10H17" />
			<path d="M1 20V14H7" />
			<path d="M3.51 9A9 9 0 0114.85 3.15L23 10M20.49 15A9 9 0 019.15 20.85L1 14" />
		</svg>
	)
}

export function CollapseIcon({ size = 16, ...props }: IconProps) {
	return (
		<svg height={size} width={size} {...defaultProps} {...props}>
			<path d="M7 10L12 5L17 10" />
			<path d="M7 14L12 19L17 14" />
		</svg>
	)
}

export function SplitIcon({ size = 16, ...props }: IconProps) {
	return (
		<svg height={size} width={size} {...defaultProps} {...props}>
			<rect height="18" rx="2" width="18" x="3" y="3" />
			<path d="M12 3V21" />
		</svg>
	)
}

export function MaximizeIcon({ size = 16, ...props }: IconProps) {
	return (
		<svg height={size} width={size} {...defaultProps} {...props}>
			<path d="M8 3H5C4 3 3 4 3 5V8M16 3H19C20 3 21 4 21 5V8M8 21H5C4 21 3 20 3 19V16M16 21H19C20 21 21 20 21 19V16" />
			<rect height="10" rx="1" width="10" x="7" y="7" />
		</svg>
	)
}

export function RestoreIcon({ size = 16, ...props }: IconProps) {
	return (
		<svg height={size} width={size} {...defaultProps} {...props}>
			<path d="M8 3H5C4 3 3 4 3 5V8" />
			<path d="M16 3H19C20 3 21 4 21 5V8" />
			<path d="M8 21H5C4 21 3 20 3 19V16" />
			<path d="M16 21H19C20 21 21 20 21 19V16" />
		</svg>
	)
}

export function MenuIcon({ size = 16, ...props }: IconProps) {
	return (
		<svg height={size} width={size} {...defaultProps} strokeWidth={2} {...props}>
			<path d="M3 12H21M3 6H21M3 18H21" />
		</svg>
	)
}

export function MoreIcon({ size = 16, ...props }: IconProps) {
	return (
		<svg fill="currentColor" height={size} viewBox="0 0 24 24" width={size} {...props}>
			<circle cx="12" cy="5" r="1.5" />
			<circle cx="12" cy="12" r="1.5" />
			<circle cx="12" cy="19" r="1.5" />
		</svg>
	)
}

export function FileIcon({ size = 16, ...props }: IconProps) {
	return (
		<svg height={size} width={size} {...defaultProps} {...props}>
			<path d="M14 2H6C5.47 2 4.96 2.21 4.59 2.59C4.21 2.96 4 3.47 4 4V20C4 20.53 4.21 21.04 4.59 21.41C4.96 21.79 5.47 22 6 22H18C18.53 22 19.04 21.79 19.41 21.41C19.79 21.04 20 20.53 20 20V8L14 2Z" />
			<path d="M14 2V8H20" />
		</svg>
	)
}

export function FolderIcon({ size = 16, ...props }: IconProps) {
	return (
		<svg fill="currentColor" height={size} viewBox="0 0 24 24" width={size} {...props}>
			<path d="M10 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V8C22 6.9 21.1 6 20 6H12L10 4Z" />
		</svg>
	)
}

export function TerminalIcon({ size = 16, ...props }: IconProps) {
	return (
		<svg height={size} width={size} {...defaultProps} {...props}>
			<rect height="16" rx="2" width="20" x="2" y="4" />
			<path d="M6 9L10 12L6 15" />
			<path d="M12 15H18" />
		</svg>
	)
}

export function ErrorIcon({ size = 16, ...props }: IconProps) {
	return (
		<svg fill="currentColor" height={size} viewBox="0 0 24 24" width={size} {...props}>
			<circle cx="12" cy="12" r="10" />
			<path d="M15 9L9 15M9 9L15 15" stroke="var(--color-bg-primary)" strokeWidth="2" />
		</svg>
	)
}

export function WarningIcon({ size = 16, ...props }: IconProps) {
	return (
		<svg fill="currentColor" height={size} viewBox="0 0 24 24" width={size} {...props}>
			<path d="M12 2L22 20H2L12 2Z" />
			<path d="M12 8V12M12 16V16.5" stroke="var(--color-bg-primary)" strokeLinecap="round" strokeWidth="2" />
		</svg>
	)
}

export function CheckIcon({ size = 16, ...props }: IconProps) {
	return (
		<svg height={size} width={size} {...defaultProps} {...props}>
			<circle cx="12" cy="12" r="10" />
			<path d="M8 12L11 15L16 9" />
		</svg>
	)
}

export function SendIcon({ size = 16, ...props }: IconProps) {
	return (
		<svg height={size} width={size} {...defaultProps} {...props}>
			<path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" />
		</svg>
	)
}

export function AttachIcon({ size = 16, ...props }: IconProps) {
	return (
		<svg height={size} width={size} {...defaultProps} {...props}>
			<path d="M21.44 11.05L12.25 20.24C10.07 22.42 6.54 22.42 4.36 20.24C2.18 18.06 2.18 14.53 4.36 12.35L13.55 3.16C15.01 1.7 17.35 1.7 18.81 3.16C20.27 4.62 20.27 6.96 18.81 8.42L9.62 17.61C8.89 18.34 7.72 18.34 6.99 17.61C6.26 16.88 6.26 15.71 6.99 14.98L15.18 6.79" />
		</svg>
	)
}

export function BellIcon({ size = 16, ...props }: IconProps) {
	return (
		<svg height={size} width={size} {...defaultProps} {...props}>
			<path d="M18 8A6 6 0 006 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" />
			<path d="M13.73 21A2 2 0 0110.27 21" />
		</svg>
	)
}

export function DeleteIcon({ size = 16, ...props }: IconProps) {
	return (
		<svg height={size} width={size} {...defaultProps} {...props}>
			<path d="M3 6H21M19 6V20C19 21.1 18.1 22 17 22H7C5.9 22 5 21.1 5 20V6M8 6V4C8 2.9 8.9 2 10 2H14C15.1 2 16 2.9 16 4V6" />
		</svg>
	)
}

export function RenameIcon({ size = 16, ...props }: IconProps) {
	return (
		<svg height={size} width={size} {...defaultProps} {...props}>
			<path d="M11 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H16C17.1 20 18 19.1 18 18V11" />
			<path d="M17 3L21 7L12 16H8V12L17 3Z" />
		</svg>
	)
}

export function NewFileIcon({ size = 16, ...props }: IconProps) {
	return (
		<svg height={size} width={size} {...defaultProps} {...props}>
			<path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" />
			<path d="M14 2V8H20" />
			<path d="M12 11V17M9 14H15" />
		</svg>
	)
}

export function NewFolderIcon({ size = 16, ...props }: IconProps) {
	return (
		<svg height={size} width={size} {...defaultProps} {...props}>
			<path d="M22 19C22 20.1 21.1 21 20 21H4C2.9 21 2 20.1 2 19V5C2 3.9 2.9 3 4 3H10L12 5H20C21.1 5 22 5.9 22 7V19Z" />
			<path d="M12 10V16M9 13H15" />
		</svg>
	)
}

export function LoadingSpinner({ size = 24, className = "" }: { size?: number; className?: string }) {
	return (
		<svg className={`animate-spin ${className}`} fill="none" height={size} viewBox="0 0 24 24" width={size}>
			<circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2" />
			<path d="M12 2C6.48 2 2 6.48 2 12" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
		</svg>
	)
}
