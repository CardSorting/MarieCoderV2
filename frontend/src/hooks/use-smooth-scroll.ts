/**
 * useSmoothScroll Hook
 * Handles smooth scrolling for anchor links
 */

import { useEffect } from "react"

export function useSmoothScroll() {
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
}

