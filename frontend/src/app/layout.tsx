/**
 * Root Layout
 * Application-wide providers and metadata configuration
 */
import type { Metadata, Viewport } from "next"
import { Providers } from "./providers"
import "@/styles/globals.css"

export const metadata: Metadata = {
	title: "Cline IDE",
	description: "AI-powered cloud development environment",
	icons: {
		icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2358a6ff'%3E%3Cpath d='M12 2L14.5 8L21 9L16 14L17.5 21L12 17.5L6.5 21L8 14L3 9L9.5 8L12 2Z'/%3E%3C/svg%3E",
	},
	openGraph: {
		title: "Cline IDE",
		description: "AI-powered cloud development environment",
		type: "website",
	},
}

export const viewport: Viewport = {
	themeColor: "#0d1117",
	width: "device-width",
	initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				{/* Preload fonts for better performance */}
				<link href="https://fonts.googleapis.com" rel="preconnect" />
				<link crossOrigin="anonymous" href="https://fonts.gstatic.com" rel="preconnect" />
				<link
					href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Geist:wght@400;500;600;700&display=swap"
					rel="stylesheet"
				/>
			</head>
			<body className="antialiased" suppressHydrationWarning>
				<Providers>{children}</Providers>
			</body>
		</html>
	)
}
