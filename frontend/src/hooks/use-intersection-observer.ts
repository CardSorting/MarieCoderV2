/**
 * useIntersectionObserver Hook
 * Observes element visibility for animation triggers
 */

import { useEffect, useRef, useState } from "react"

interface UseIntersectionObserverOptions {
	threshold?: number
	rootMargin?: string
	triggerOnce?: boolean
}

export function useIntersectionObserver({
	threshold = 0.1,
	rootMargin = "0px",
	triggerOnce = true,
}: UseIntersectionObserverOptions = {}) {
	const [isVisible, setIsVisible] = useState(false)
	const elementRef = useRef<HTMLElement>(null)

	useEffect(() => {
		const element = elementRef.current
		if (!element) return

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setIsVisible(true)
					if (triggerOnce) {
						observer.unobserve(element)
					}
				} else if (!triggerOnce) {
					setIsVisible(false)
				}
			},
			{ threshold, rootMargin },
		)

		observer.observe(element)
		return () => observer.disconnect()
	}, [threshold, rootMargin, triggerOnce])

	return { elementRef, isVisible }
}

