/**
 * Testimonials Section Component
 * Displays customer testimonials
 */

"use client"

import { memo } from "react"
import { TESTIMONIALS } from "@/constants/landing"
import { Section } from "./Section"

export const TestimonialsSection = memo(function TestimonialsSection() {
	return (
		<Section className="py-24 relative overflow-hidden">
			<div className="absolute inset-0 bg-mesh opacity-50" />
			<div className="relative container-app">
				<div className="text-center mb-16">
					<span className="inline-block px-3 py-1 rounded-full bg-accent-emerald/10 border border-accent-emerald/20 text-accent-emerald text-xs font-medium mb-4">
						Testimonials
					</span>
					<h2 className="text-3xl md:text-4xl font-bold text-text-bright mb-4">Loved by developers worldwide</h2>
					<p className="text-lg text-text-secondary max-w-2xl mx-auto">
						See what our community is saying about their experience
					</p>
				</div>

				<div className="grid md:grid-cols-3 gap-6">
					{TESTIMONIALS.map((testimonial, i) => (
						<div className="p-6 rounded-2xl bg-surface-secondary border border-border-primary" key={i}>
							<div aria-label={`${5} out of 5 stars`} className="flex gap-1 mb-4" role="img">
								{[...Array(5)].map((_, j) => (
									<svg
										aria-hidden="true"
										className="w-4 h-4 text-accent-amber"
										fill="currentColor"
										key={j}
										viewBox="0 0 20 20">
										<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
									</svg>
								))}
							</div>
							<blockquote className="text-text-primary mb-6 text-sm leading-relaxed">
								&quot;{testimonial.quote}&quot;
							</blockquote>
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-primary to-accent-cyan flex items-center justify-center text-white font-medium text-sm">
									{testimonial.author[0]}
								</div>
								<div>
									<div className="text-text-bright font-medium text-sm">{testimonial.author}</div>
									<div className="text-text-muted text-xs">{testimonial.role}</div>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</Section>
	)
})
