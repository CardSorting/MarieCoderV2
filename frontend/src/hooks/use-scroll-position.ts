/**
 * useScrollPosition Hook
 * Tracks scroll position and provides scroll-based state
 */

import { useEffect, useState } from "react"

export function useScrollPosition(threshold = 10) {
	const [isScrolled, setIsScrolled] = useState(false)

	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > threshold)
		}

		// Check initial position
		handleScroll()

		window.addEventListener("scroll", handleScroll, { passive: true })
		return () => window.removeEventListener("scroll", handleScroll)
	}, [threshold])

	return isScrolled
}

