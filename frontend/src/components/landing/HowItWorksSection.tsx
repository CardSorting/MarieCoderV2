/**
 * How It Works Section Component
 * Displays the process steps
 */

"use client"

import { memo } from "react"
import { STEPS } from "@/constants/landing"
import { Section } from "./Section"

export const HowItWorksSection = memo(function HowItWorksSection() {
	return (
		<Section className="py-24 border-y border-border-primary" variant="secondary">
			<div className="container-app">
				<div className="text-center mb-16">
					<span className="inline-block px-3 py-1 rounded-full bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan text-xs font-medium mb-4">
						How it works
					</span>
					<h2 className="text-3xl md:text-4xl font-bold text-text-bright mb-4">From idea to production in minutes</h2>
					<p className="text-lg text-text-secondary max-w-2xl mx-auto">
						Our AI understands your intent and builds alongside you
					</p>
				</div>

				<div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
					{STEPS.map((step, i) => (
						<div className="relative" key={i}>
							{i < STEPS.length - 1 && (
								<div className="hidden md:block absolute top-12 left-[60%] w-full h-px bg-gradient-to-r from-border-primary to-transparent" />
							)}
							<div className="text-center">
								<div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-primary to-accent-cyan flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg">
									{i + 1}
								</div>
								<h3 className="text-lg font-semibold text-text-bright mb-2">{step.title}</h3>
								<p className="text-text-secondary text-sm">{step.description}</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</Section>
	)
})
