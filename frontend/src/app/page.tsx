"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Footer, Header } from "@/components/shared"
import { Button } from "@/components/ui/primitives"
import { useAuthStore } from "@/stores/auth-store"

export default function HomePage() {
	const router = useRouter()
	const { isAuthenticated } = useAuthStore()
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setMounted(true)
		if (isAuthenticated) {
			router.replace("/projects")
		}
	}, [isAuthenticated, router])

	// Smooth scroll for anchor links
	useEffect(() => {
		const handleAnchorClick = (e: MouseEvent) => {
			const target = e.target as HTMLElement
			const link = target.closest("a[href^='#']")
			if (link) {
				const href = link.getAttribute("href")
				if (href && href.startsWith("#")) {
					e.preventDefault()
					const id = href.slice(1)
					const element = document.getElementById(id)
					if (element) {
						element.scrollIntoView({ behavior: "smooth", block: "start" })
					}
				}
			}
		}
		document.addEventListener("click", handleAnchorClick)
		return () => document.removeEventListener("click", handleAnchorClick)
	}, [])

	if (!mounted) {
		return (
			<div className="h-screen flex items-center justify-center bg-surface-primary">
				<div className="flex flex-col items-center gap-4">
					<div className="relative">
						<div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-primary to-accent-cyan flex items-center justify-center animate-pulse">
							<svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
								<path d="M12 2L14.5 8L21 9L16 14L17.5 21L12 17.5L6.5 21L8 14L3 9L9.5 8L12 2Z" />
							</svg>
						</div>
					</div>
					<div className="w-6 h-6 border-2 border-border-primary border-t-accent-primary rounded-full animate-spin" />
				</div>
			</div>
		)
	}

	if (isAuthenticated) {
		return null
	}

	return (
		<div className="min-h-screen bg-surface-primary flex flex-col overflow-x-hidden">
			<Header variant="landing" />

			{/* Hero Section */}
			<section className="relative min-h-[90vh] flex items-center overflow-hidden">
				{/* Background Effects */}
				<div className="absolute inset-0 bg-hero-glow" />
				<div className="absolute inset-0 bg-grid opacity-50" />
				<div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-primary/20 rounded-full blur-[128px] animate-float" />
				<div
					className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-cyan/20 rounded-full blur-[128px] animate-float"
					style={{ animationDelay: "-3s" }}
				/>

				<div className="relative container-app py-20 md:py-32">
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
							<Link href="/login">
								<Button
									className="w-full sm:w-auto px-8 h-12 text-base glow-on-hover"
									size="lg"
									variant="primary">
									Start Building Free
									<svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
								<svg className="w-5 h-5 mr-2 text-accent-primary" fill="currentColor" viewBox="0 0 24 24">
									<path d="M8 5v14l11-7z" />
								</svg>
								Watch Demo
								<span className="ml-2 text-text-muted text-sm">(2 min)</span>
							</Button>
						</div>

						{/* Social Proof */}
						<div className="animate-fade-in-up animate-fill-both stagger-4">
							<p className="text-text-muted text-sm mb-4">Trusted by developers at</p>
							<div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
								{["Vercel", "Stripe", "Linear", "Notion", "Figma"].map((company) => (
									<div className="text-text-secondary font-semibold text-lg tracking-tight" key={company}>
										{company}
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Stats Section */}
			<section className="py-16 border-y border-border-primary bg-surface-secondary/30">
				<div className="container-app">
					<div className="grid grid-cols-2 md:grid-cols-4 gap-8">
						{stats.map((stat, i) => (
							<div className="text-center" key={i}>
								<div className="text-3xl md:text-4xl font-bold gradient-text mb-2">{stat.value}</div>
								<div className="text-sm text-text-secondary">{stat.label}</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="py-24 relative overflow-hidden" id="features">
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
						{features.map((feature, i) => (
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
			</section>

			{/* How It Works Section */}
			<section className="py-24 bg-surface-secondary/50 border-y border-border-primary">
				<div className="container-app">
					<div className="text-center mb-16">
						<span className="inline-block px-3 py-1 rounded-full bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan text-xs font-medium mb-4">
							How it works
						</span>
						<h2 className="text-3xl md:text-4xl font-bold text-text-bright mb-4">
							From idea to production in minutes
						</h2>
						<p className="text-lg text-text-secondary max-w-2xl mx-auto">
							Our AI understands your intent and builds alongside you
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
						{steps.map((step, i) => (
							<div className="relative" key={i}>
								{i < steps.length - 1 && (
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
			</section>

			{/* Testimonials Section */}
			<section className="py-24 relative overflow-hidden">
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
						{testimonials.map((testimonial, i) => (
							<div className="p-6 rounded-2xl bg-surface-secondary border border-border-primary" key={i}>
								<div className="flex gap-1 mb-4">
									{[...Array(5)].map((_, j) => (
										<svg
											className="w-4 h-4 text-accent-amber"
											fill="currentColor"
											key={j}
											viewBox="0 0 20 20">
											<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
										</svg>
									))}
								</div>
								<p className="text-text-primary mb-6 text-sm leading-relaxed">"{testimonial.quote}"</p>
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
			</section>

			{/* Pricing Section */}
			<section className="py-24 bg-surface-secondary/30 border-t border-border-primary" id="pricing">
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
						{pricingPlans.map((plan, i) => (
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
								<ul className="space-y-3 mb-8">
									{plan.features.map((feature, j) => (
										<li className="flex items-start gap-3" key={j}>
											<svg
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
								<Link className="block" href="/login">
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
			</section>

			{/* Final CTA Section */}
			<section className="py-32 relative overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-b from-surface-primary via-accent-primary/5 to-surface-primary" />
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-primary/20 rounded-full blur-[150px]" />

				<div className="relative container-app text-center">
					<h2 className="text-4xl md:text-5xl font-bold text-text-bright mb-6">Ready to build the future?</h2>
					<p className="text-lg text-text-secondary mb-10 max-w-xl mx-auto">
						Join thousands of developers building the next generation of applications with AI
					</p>
					<Link href="/login">
						<Button className="px-10 h-14 text-base glow-on-hover" size="lg" variant="primary">
							Get Started for Free
							<svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path d="M13 7l5 5m0 0l-5 5m5-5H6" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
							</svg>
						</Button>
					</Link>
					<p className="text-text-muted text-sm mt-4">No credit card required • Free forever tier</p>
				</div>
			</section>

			<Footer />
		</div>
	)
}

const stats = [
	{ value: "50K+", label: "Active Developers" },
	{ value: "1M+", label: "Projects Created" },
	{ value: "99.9%", label: "Uptime SLA" },
	{ value: "< 50ms", label: "Response Time" },
]

const features = [
	{
		title: "AI Code Generation",
		description: "Describe what you want to build and watch as AI generates production-ready code in seconds.",
		color: "bg-accent-primary/20",
		icon: (
			<svg className="w-6 h-6 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
				/>
			</svg>
		),
	},
	{
		title: "Cloud-Native IDE",
		description: "Full VS Code experience in your browser. No setup, no configuration, just open and code.",
		color: "bg-accent-cyan/20",
		icon: (
			<svg className="w-6 h-6 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
				/>
			</svg>
		),
	},
	{
		title: "Real-Time Collaboration",
		description: "Code together with your team in real-time. Share projects, pair program, and review code.",
		color: "bg-accent-emerald/20",
		icon: (
			<svg className="w-6 h-6 text-accent-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
				/>
			</svg>
		),
	},
	{
		title: "Instant Deployment",
		description: "Deploy to production with one click. Automatic HTTPS, global CDN, and zero configuration.",
		color: "bg-accent-amber/20",
		icon: (
			<svg className="w-6 h-6 text-accent-amber" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
			</svg>
		),
	},
	{
		title: "Git Integration",
		description: "Built-in Git support. Push, pull, branch, and merge without leaving your workspace.",
		color: "bg-accent-rose/20",
		icon: (
			<svg className="w-6 h-6 text-accent-rose" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
				/>
			</svg>
		),
	},
	{
		title: "Enterprise Security",
		description: "SOC 2 compliant. End-to-end encryption, SSO, and advanced access controls.",
		color: "bg-status-info/20",
		icon: (
			<svg className="w-6 h-6 text-status-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
				/>
			</svg>
		),
	},
]

const steps = [
	{
		title: "Describe your idea",
		description: "Tell the AI what you want to build using natural language. Be as specific or general as you'd like.",
	},
	{
		title: "AI generates code",
		description: "Watch as the AI creates files, writes code, and sets up your entire project structure in real-time.",
	},
	{
		title: "Iterate & deploy",
		description: "Refine your app with follow-up prompts, test it live, and deploy to production with one click.",
	},
]

const testimonials = [
	{
		quote: "Cline has completely transformed how I prototype new ideas. What used to take days now takes hours. The AI understands exactly what I need.",
		author: "Sarah Chen",
		role: "Senior Engineer at Stripe",
	},
	{
		quote: "The best cloud IDE I've ever used. The AI assistance is incredible and the collaboration features make remote work seamless.",
		author: "Marcus Johnson",
		role: "Tech Lead at Vercel",
	},
	{
		quote: "We've cut our development time in half since switching to Cline. The instant deployment and AI code generation are game changers.",
		author: "Emily Rodriguez",
		role: "CTO at Scale AI",
	},
]

const pricingPlans = [
	{
		name: "Starter",
		price: "0",
		description: "Perfect for personal projects",
		features: ["5 projects", "AI assistance (1000 requests/mo)", "Community support", "5GB storage", "Basic templates"],
		cta: "Get Started",
		featured: false,
	},
	{
		name: "Pro",
		price: "29",
		description: "For professional developers",
		features: [
			"Unlimited projects",
			"Unlimited AI assistance",
			"Priority support",
			"100GB storage",
			"Premium templates",
			"Custom domains",
			"Team collaboration",
		],
		cta: "Start Free Trial",
		featured: true,
	},
	{
		name: "Enterprise",
		price: "99",
		description: "For teams and organizations",
		features: [
			"Everything in Pro",
			"Dedicated support",
			"SSO & SAML",
			"Unlimited storage",
			"Advanced security",
			"SLA guarantee",
			"Custom integrations",
		],
		cta: "Contact Sales",
		featured: false,
	},
]

function cn(...classes: (string | boolean | undefined | null)[]): string {
	return classes.filter(Boolean).join(" ")
}
