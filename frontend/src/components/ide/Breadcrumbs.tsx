/**
 * Breadcrumbs Component
 * VS Code-style file path navigation
 */
"use client"

import { ChevronRightIcon } from "@/components/ui/icons"
import { cn } from "@/lib/utils"

interface BreadcrumbsProps {
	path: string | null
}

export default function Breadcrumbs({ path }: BreadcrumbsProps) {
	if (!path) return null

	const parts = path.split("/").filter(Boolean)

	return (
		<nav
			aria-label="File path"
			className="flex items-center h-breadcrumb px-3 bg-primary border-b border-border-primary overflow-x-auto scrollbar-none shrink-0">
			{parts.map((part, index) => {
				const isLast = index === parts.length - 1

				return (
					<span className="flex items-center shrink-0" key={index}>
						<span
							className={cn(
								"text-xs px-1 py-0.5 rounded cursor-pointer transition-all duration-75",
								isLast ? "text-secondary" : "text-muted hover:bg-surface-tertiary hover:text-primary",
							)}>
							{part}
						</span>
						{!isLast && <ChevronRightIcon className="mx-0.5 text-muted shrink-0" size={12} />}
					</span>
				)
			})}
		</nav>
	)
}
