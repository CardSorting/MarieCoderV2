/**
 * Final CTA Section Component
 * Final call-to-action section
 */

"use client"

import Link from "next/link"
import { memo } from "react"
import { Button } from "@/components/ui/primitives"
import { Section } from "./Section"

export const FinalCTASection = memo(function FinalCTASection() {
	return (
		<Section className="py-32 relative overflow-hidden" variant="gradient">
			<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-primary/20 rounded-full blur-[150px]" />

			<div className="relative container-app text-center">
				<h2 className="text-4xl md:text-5xl font-bold text-text-bright mb-6">Ready to build the future?</h2>
				<p className="text-lg text-text-secondary mb-10 max-w-xl mx-auto">
					Join thousands of developers building the next generation of applications with AI
				</p>
				<Link aria-label="Get started for free" href="/login">
					<Button className="px-10 h-14 text-base glow-on-hover" size="lg" variant="primary">
						Get Started for Free
						<svg aria-hidden="true" className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path d="M13 7l5 5m0 0l-5 5m5-5H6" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
						</svg>
					</Button>
				</Link>
				<p className="text-text-muted text-sm mt-4">No credit card required • Free forever tier</p>
			</div>
		</Section>
	)
})
