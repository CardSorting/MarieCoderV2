/**
 * Features Section Component
 * Displays key features in a grid layout
 */

"use client"

import { memo } from "react"
import { FEATURES } from "@/constants/landing"
import { cn } from "@/lib/utils"
import { Section } from "./Section"

export const FeaturesSection = memo(function FeaturesSection() {
	return (
		<Section className="py-24 relative overflow-hidden" id="features">
			<div className="absolute inset-0 bg-mesh" />
			<div className="relative container-app">
				<div className="text-center mb-16">
					<span className="inline-block px-3 py-1 rounded-full bg-accent-muted border border-accent-primary/20 text-accent-bright text-xs font-medium mb-4">
						Features
					</span>
					<h2 className="text-3xl md:text-4xl font-bold text-text-bright mb-4">Everything you need to ship fast</h2>
					<p className="text-lg text-text-secondary max-w-2xl mx-auto">
						Powerful features designed for the modern developer workflow
					</p>
				</div>

				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
					{FEATURES.map((feature, i) => (
						<div
							className="group relative p-6 rounded-2xl bg-surface-secondary border border-border-primary hover:border-accent-primary/50 transition-all duration-300 card-hover"
							key={i}>
							<div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
							<div className="relative">
								<div
									className={cn(
										"w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110",
										feature.color,
									)}>
									{feature.icon}
								</div>
								<h3 className="text-lg font-semibold text-text-bright mb-2">{feature.title}</h3>
								<p className="text-text-secondary text-sm leading-relaxed">{feature.description}</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</Section>
	)
})
