/**
 * Landing Page Types
 * Type definitions for landing page components and data
 */

export interface Stat {
	value: string
	label: string
}

export interface Feature {
	title: string
	description: string
	color: string
	icon: React.ReactNode
}

export interface Step {
	title: string
	description: string
}

export interface Testimonial {
	quote: string
	author: string
	role: string
}

export interface PricingPlan {
	name: string
	price: string
	description?: string
	features: string[]
	cta: string
	featured: boolean
}

export interface SectionProps {
	className?: string
	children?: React.ReactNode
}

