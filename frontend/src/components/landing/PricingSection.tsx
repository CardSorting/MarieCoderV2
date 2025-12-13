/**
 * Pricing Section Component
 * Displays pricing plans
 */

"use client"

import Link from "next/link"
import { memo } from "react"
import { Button } from "@/components/ui/primitives"
import { PRICING_PLANS } from "@/constants/landing"
import { cn } from "@/lib/utils"
import { Section } from "./Section"

export const PricingSection = memo(function PricingSection() {
	return (
		<Section className="py-24 border-t border-border-primary" id="pricing" variant="secondary">
			<div className="container-app">
				<div className="text-center mb-16">
					<span className="inline-block px-3 py-1 rounded-full bg-accent-rose/10 border border-accent-rose/20 text-accent-rose text-xs font-medium mb-4">
						Pricing
					</span>
					<h2 className="text-3xl md:text-4xl font-bold text-text-bright mb-4">Simple, transparent pricing</h2>
					<p className="text-lg text-text-secondary max-w-2xl mx-auto">
						Start free, scale as you grow. No hidden fees, no surprises.
					</p>
				</div>

				<div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
					{PRICING_PLANS.map((plan, i) => (
						<div
							className={cn(
								"relative p-8 rounded-2xl transition-all duration-300",
								plan.featured
									? "bg-surface-secondary border-2 border-accent-primary shadow-lg scale-105 z-10"
									: "bg-surface-secondary border border-border-primary hover:border-accent-primary/50",
							)}
							key={i}>
							{plan.featured && (
								<div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-accent-primary to-accent-cyan text-white text-xs font-medium">
									Most Popular
								</div>
							)}
							<div className="mb-6">
								<h3 className="text-xl font-bold text-text-bright mb-2">{plan.name}</h3>
								<div className="flex items-baseline gap-1">
									<span className="text-4xl font-bold text-text-bright">${plan.price}</span>
									<span className="text-text-secondary">/month</span>
								</div>
								{plan.description && <p className="text-sm text-text-muted mt-2">{plan.description}</p>}
							</div>
							<ul className="space-y-3 mb-8" role="list">
								{plan.features.map((feature, j) => (
									<li className="flex items-start gap-3" key={j}>
										<svg
											aria-hidden="true"
											className="w-5 h-5 text-accent-emerald mt-0.5 shrink-0"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24">
											<path
												d="M5 13l4 4L19 7"
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
											/>
										</svg>
										<span className="text-sm text-text-secondary">{feature}</span>
									</li>
								))}
							</ul>
							<Link aria-label={`Get started with ${plan.name} plan`} className="block" href="/login">
								<Button
									className={cn("w-full h-11", plan.featured && "glow-on-hover")}
									size="lg"
									variant={plan.featured ? "primary" : "secondary"}>
									{plan.cta}
								</Button>
							</Link>
						</div>
					))}
				</div>
			</div>
		</Section>
	)
})
