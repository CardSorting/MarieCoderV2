/**
 * Stats Section Component
 * Displays key metrics and statistics
 */

"use client"

import { memo } from "react"
import { STATS } from "@/constants/landing"
import { Section } from "./Section"

export const StatsSection = memo(function StatsSection() {
	return (
		<Section className="py-16 border-y border-border-primary" variant="secondary">
			<div className="container-app">
				<div className="grid grid-cols-2 md:grid-cols-4 gap-8">
					{STATS.map((stat, i) => (
						<div className="text-center" key={i}>
							<div className="text-3xl md:text-4xl font-bold gradient-text mb-2">{stat.value}</div>
							<div className="text-sm text-text-secondary">{stat.label}</div>
						</div>
					))}
				</div>
			</div>
		</Section>
	)
})
