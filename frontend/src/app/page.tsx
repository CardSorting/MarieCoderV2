/**
 * Home Page
 * Modern landing page with optimized structure and performance
 */

"use client"

import { useRouter } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import {
	FeaturesSection,
	FinalCTASection,
	HeroSection,
	HowItWorksSection,
	PricingSection,
	StatsSection,
	TestimonialsSection,
} from "@/components/landing"
import { Footer, Header, LoadingScreen } from "@/components/shared"
import { ErrorBoundary } from "@/components/shared/ErrorBoundary"
import { useSmoothScroll } from "@/hooks"
import { useAuthStore } from "@/stores/auth-store"

function HomePageContent() {
	const router = useRouter()
	const { isAuthenticated } = useAuthStore()
	const [mounted, setMounted] = useState(false)

	useSmoothScroll()

	useEffect(() => {
		setMounted(true)
		if (isAuthenticated) {
			router.replace("/projects")
		}
	}, [isAuthenticated, router])

	if (!mounted) {
		return <LoadingScreen />
	}

	if (isAuthenticated) {
		return null
	}

	return (
		<div className="min-h-screen bg-surface-primary flex flex-col overflow-x-hidden">
			<Header variant="landing" />
			<HeroSection />
			<StatsSection />
			<FeaturesSection />
			<HowItWorksSection />
			<TestimonialsSection />
			<PricingSection />
			<FinalCTASection />
			<Footer />
		</div>
	)
}

export default function HomePage() {
	return (
		<ErrorBoundary>
			<Suspense fallback={<LoadingScreen />}>
				<HomePageContent />
			</Suspense>
		</ErrorBoundary>
	)
}
