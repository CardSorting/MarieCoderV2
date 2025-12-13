/**
 * Utility Functions
 * Centralized helpers used throughout the application
 */

/**
 * Debounce function - delays execution until after a wait period
 */
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
	func: T,
	wait: number,
): (...args: Parameters<T>) => void {
	let timeout: ReturnType<typeof setTimeout> | null = null

	return function executedFunction(...args: Parameters<T>) {
		const later = () => {
			timeout = null
			func(...args)
		}

		if (timeout) {
			clearTimeout(timeout)
		}
		timeout = setTimeout(later, wait)
	}
}

/**
 * Classname utility - joins class names and filters out falsy values
 * Similar to clsx/classnames but lightweight
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
	return classes.filter(Boolean).join(" ")
}

/**
 * Throttle function - limits execution to once per wait period
 */
export function throttle<T extends (...args: Parameters<T>) => ReturnType<T>>(
	func: T,
	wait: number,
): (...args: Parameters<T>) => void {
	let lastCall = 0

	return function executedFunction(...args: Parameters<T>) {
		const now = Date.now()
		if (now - lastCall >= wait) {
			lastCall = now
			func(...args)
		}
	}
}

/**
 * Sleep utility - returns a promise that resolves after ms
 */
export function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes: number, decimals = 2): string {
	if (bytes === 0) return "0 Bytes"

	const k = 1024
	const dm = decimals < 0 ? 0 : decimals
	const sizes = ["Bytes", "KB", "MB", "GB", "TB"]

	const i = Math.floor(Math.log(bytes) / Math.log(k))

	return parseFloat((bytes / k ** i).toFixed(dm)) + " " + sizes[i]
}

/**
 * Format relative time (e.g., "2 minutes ago")
 */
export function formatRelativeTime(date: Date | number): string {
	const now = Date.now()
	const timestamp = typeof date === "number" ? date : date.getTime()
	const seconds = Math.floor((now - timestamp) / 1000)

	const intervals = [
		{ label: "year", seconds: 31536000 },
		{ label: "month", seconds: 2592000 },
		{ label: "week", seconds: 604800 },
		{ label: "day", seconds: 86400 },
		{ label: "hour", seconds: 3600 },
		{ label: "minute", seconds: 60 },
	]

	for (const interval of intervals) {
		const count = Math.floor(seconds / interval.seconds)
		if (count >= 1) {
			return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`
		}
	}

	return "just now"
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
	return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`
}
