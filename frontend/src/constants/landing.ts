/**
 * Landing Page Constants
 * Data and configuration for landing page sections
 */

import { FeatureIcons } from "@/components/landing/FeatureIcons"
import type { Feature, PricingPlan, Stat, Step, Testimonial } from "@/types/landing"

export const STATS: Stat[] = [
	{ value: "50K+", label: "Active Developers" },
	{ value: "1M+", label: "Projects Created" },
	{ value: "99.9%", label: "Uptime SLA" },
	{ value: "< 50ms", label: "Response Time" },
]

export const FEATURES: Feature[] = [
	{
		title: "AI Code Generation",
		description: "Describe what you want to build and watch as AI generates production-ready code in seconds.",
		color: "bg-accent-primary/20",
		icon: FeatureIcons.aiCodeGeneration,
	},
	{
		title: "Cloud-Native IDE",
		description: "Full VS Code experience in your browser. No setup, no configuration, just open and code.",
		color: "bg-accent-cyan/20",
		icon: FeatureIcons.cloudIDE,
	},
	{
		title: "Real-Time Collaboration",
		description: "Code together with your team in real-time. Share projects, pair program, and review code.",
		color: "bg-accent-emerald/20",
		icon: FeatureIcons.collaboration,
	},
	{
		title: "Instant Deployment",
		description: "Deploy to production with one click. Automatic HTTPS, global CDN, and zero configuration.",
		color: "bg-accent-amber/20",
		icon: FeatureIcons.deployment,
	},
	{
		title: "Git Integration",
		description: "Built-in Git support. Push, pull, branch, and merge without leaving your workspace.",
		color: "bg-accent-rose/20",
		icon: FeatureIcons.git,
	},
	{
		title: "Enterprise Security",
		description: "SOC 2 compliant. End-to-end encryption, SSO, and advanced access controls.",
		color: "bg-status-info/20",
		icon: FeatureIcons.security,
	},
]

export const STEPS: Step[] = [
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

export const TESTIMONIALS: Testimonial[] = [
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

export const PRICING_PLANS: PricingPlan[] = [
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

export const SOCIAL_PROOF_COMPANIES = ["Vercel", "Stripe", "Linear", "Notion", "Figma"] as const
