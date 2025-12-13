/**
 * Terminal Component
 * XTerm-based terminal with VS Code styling
 */
"use client"

import { useEffect, useRef, useState } from "react"
import { LoadingSpinner } from "@/components/ui/icons"
import { TERMINAL_THEME } from "@/lib/constants"
import { wsClient } from "@/lib/websocket-client"
import "xterm/css/xterm.css"

interface TerminalProps {
	projectId: string
	isActive?: boolean
}

export default function Terminal({ projectId, isActive = true }: TerminalProps) {
	const terminalRef = useRef<HTMLDivElement>(null)
	const terminalInstanceRef = useRef<unknown>(null)
	const fitAddonRef = useRef<unknown>(null)
	const [sessionId, setSessionId] = useState<string | null>(null)
	const [connected, setConnected] = useState(false)
	const [isInitializing, setIsInitializing] = useState(true)

	useEffect(() => {
		if (!terminalRef.current) return

		const cleanupFunctions: (() => void)[] = []

		const initTerminal = async () => {
			try {
				const { Terminal: XTerm } = await import("xterm")
				const { FitAddon } = await import("xterm-addon-fit")

				// Initialize terminal with GitHub Dark Dimmed theme
				const term = new XTerm({
					theme: TERMINAL_THEME,
					fontSize: 13,
					fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', Monaco, Consolas, monospace",
					fontWeight: "400",
					fontWeightBold: "600",
					letterSpacing: 0,
					lineHeight: 1.3,
					cursorBlink: true,
					cursorStyle: "bar",
					cursorWidth: 2,
					allowTransparency: false,
					scrollback: 10000,
					tabStopWidth: 4,
					drawBoldTextInBrightColors: true,
				})

				const fitAddon = new FitAddon()
				term.loadAddon(fitAddon)

				if (terminalRef.current) {
					term.open(terminalRef.current)
				}

				// Fit terminal after a short delay
				requestAnimationFrame(() => {
					fitAddon.fit()
					setIsInitializing(false)
				})

				terminalInstanceRef.current = term
				fitAddonRef.current = fitAddon

				// Connect to WebSocket
				try {
					await wsClient.connect(projectId)
					setConnected(true)
					wsClient.send({ type: "terminal-create" })
				} catch (error) {
					console.error("Failed to connect WebSocket", error)
					term.writeln("\x1b[38;2;248;81;73m✗ Failed to connect to terminal server\x1b[0m")
					term.writeln("")
					term.writeln("Please check your connection and try again.")
				}

				// Handle terminal input
				term.onData((data: string) => {
					if (sessionId && connected) {
						wsClient.send({ type: "terminal-input", sessionId, data })
					}
				})

				// Handle terminal output
				const unsubscribeOutput = wsClient.on("terminal-output", (message: unknown) => {
					const msg = message as { sessionId?: string; data?: string }
					if (msg.sessionId === sessionId && msg.data) {
						term.write(msg.data)
					}
				})
				cleanupFunctions.push(unsubscribeOutput)

				// Handle terminal creation
				const unsubscribeCreate = wsClient.on("terminal-created", (message: unknown) => {
					const msg = message as { sessionId?: string }
					if (msg.sessionId) {
						setSessionId(msg.sessionId)
						term.writeln("\x1b[38;2;63;185;80m✓ Terminal session connected\x1b[0m")
						term.writeln("")
					}
				})
				cleanupFunctions.push(unsubscribeCreate)

				// Handle resize
				const handleResize = () => {
					if (fitAddonRef.current) {
						const addon = fitAddonRef.current as { fit: () => void }
						requestAnimationFrame(() => addon.fit())
					}
				}

				const resizeObserver = new ResizeObserver(handleResize)
				if (terminalRef.current?.parentElement) {
					resizeObserver.observe(terminalRef.current.parentElement)
				}

				window.addEventListener("resize", handleResize)

				cleanupFunctions.push(() => {
					resizeObserver.disconnect()
					window.removeEventListener("resize", handleResize)
					term.dispose()
					if (sessionId) {
						wsClient.send({ type: "terminal-close", sessionId })
					}
				})
			} catch (error) {
				console.error("Failed to initialize terminal", error)
				setIsInitializing(false)
			}
		}

		initTerminal()

		return () => {
			cleanupFunctions.forEach((cleanup) => cleanup())
		}
	}, [projectId])

	// Fit terminal when becoming active
	useEffect(() => {
		if (isActive && fitAddonRef.current) {
			const addon = fitAddonRef.current as { fit: () => void }
			requestAnimationFrame(() => addon.fit())
		}
	}, [isActive])

	// Re-fit terminal when session is established
	useEffect(() => {
		if (terminalInstanceRef.current && fitAddonRef.current && sessionId) {
			const addon = fitAddonRef.current as { fit: () => void }
			setTimeout(() => addon.fit(), 100)
		}
	}, [sessionId])

	return (
		<div className="h-full w-full bg-primary relative overflow-hidden">
			{isInitializing && (
				<div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-primary text-secondary text-sm z-10">
					<LoadingSpinner className="text-accent-bright" size={24} />
					<span>Initializing terminal...</span>
				</div>
			)}
			<div
				className={`h-full w-full p-2 transition-opacity duration-150 ${isInitializing ? "opacity-0" : "opacity-100"}`}
				ref={terminalRef}
			/>
		</div>
	)
}
