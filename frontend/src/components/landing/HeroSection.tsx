/**
 * Hero Section Component
 * Main hero section with headline, CTA, and social proof
 */

"use client"

import Link from "next/link"
import { memo } from "react"
import { Button } from "@/components/ui/primitives"
import { SOCIAL_PROOF_COMPANIES } from "@/constants/landing"
import { Section } from "./Section"

export const HeroSection = memo(function HeroSection() {
	return (
		<Section className="min-h-[90vh] flex items-center">
			{/* Background Effects */}
			<div className="absolute inset-0 bg-hero-glow" />
			<div className="absolute inset-0 bg-grid opacity-50" />
			<div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-primary/20 rounded-full blur-[128px] animate-float" />
			<div
				className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-cyan/20 rounded-full blur-[128px] animate-float"
				style={{ animationDelay: "-3s" }}
			/>

			<div className="relative container-app py-20 md:py-32 w-full">
				<div className="max-w-5xl mx-auto text-center">
					{/* Badge */}
					<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-muted border border-accent-primary/30 text-accent-bright text-sm font-medium mb-8 animate-fade-in-up animate-fill-both">
						<span className="relative flex h-2 w-2">
							<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-primary opacity-75" />
							<span className="relative inline-flex rounded-full h-2 w-2 bg-accent-secondary" />
						</span>
						Now with Claude 4 & GPT-4o Support
					</div>

					{/* Headline */}
					<h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-text-bright leading-[1.1] mb-6 animate-fade-in-up animate-fill-both stagger-1">
						Build software
						<br />
						<span className="gradient-text">10x faster</span> with AI
					</h1>

					{/* Subheadline */}
					<p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed mb-10 animate-fade-in-up animate-fill-both stagger-2">
						The modern cloud IDE that brings AI-powered coding assistance directly into your workflow. Create,
						iterate, and ship production-ready apps in minutes.
					</p>

					{/* CTA Buttons */}
					<div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in-up animate-fill-both stagger-3">
						<Link aria-label="Start building for free" href="/login">
							<Button className="w-full sm:w-auto px-8 h-12 text-base glow-on-hover" size="lg" variant="primary">
								Start Building Free
								<svg
									aria-hidden="true"
									className="w-5 h-5 ml-2"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24">
									<path
										d="M13 7l5 5m0 0l-5 5m5-5H6"
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
									/>
								</svg>
							</Button>
						</Link>
						<Button className="w-full sm:w-auto px-8 h-12 text-base group" size="lg" variant="secondary">
							<svg
								aria-hidden="true"
								className="w-5 h-5 mr-2 text-accent-primary"
								fill="currentColor"
								viewBox="0 0 24 24">
								<path d="M8 5v14l11-7z" />
							</svg>
							Watch Demo
							<span className="ml-2 text-text-muted text-sm">(2 min)</span>
						</Button>
					</div>

					{/* Social Proof */}
					<div className="animate-fade-in-up animate-fill-both stagger-4">
						<p className="text-text-muted text-sm mb-4">Trusted by developers at</p>
						<div className="flex flex-wrap items-center justify-center gap-8 opacity-60" role="list">
							{SOCIAL_PROOF_COMPANIES.map((company) => (
								<div
									className="text-text-secondary font-semibold text-lg tracking-tight"
									key={company}
									role="listitem">
									{company}
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</Section>
	)
})
