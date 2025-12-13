/**
 * Section Component
 * Reusable wrapper for landing page sections with consistent spacing and layout
 */

import { forwardRef, type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface SectionProps extends HTMLAttributes<HTMLElement> {
	variant?: "default" | "secondary" | "gradient"
}

export const Section = forwardRef<HTMLElement, SectionProps>(({ className, variant = "default", children, ...props }, ref) => {
	const variantClasses = {
		default: "bg-surface-primary",
		secondary: "bg-surface-secondary/30",
		gradient: "bg-gradient-to-b from-surface-primary via-accent-primary/5 to-surface-primary",
	}

	return (
		<section className={cn("relative overflow-hidden", variantClasses[variant], className)} ref={ref} {...props}>
			{children}
		</section>
	)
})
Section.displayName = "Section"
