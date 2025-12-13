/**
 * Root Layout
 * Application-wide providers and metadata configuration
 */
import type { Metadata, Viewport } from "next"
import { Providers } from "./providers"
import "@/styles/globals.css"

export const metadata: Metadata = {
	title: {
		default: "Cline IDE - AI-Powered Cloud Development Environment",
		template: "%s | Cline IDE",
	},
	description:
		"Build software 10x faster with AI. The modern cloud IDE that brings AI-powered coding assistance directly into your workflow. Create, iterate, and ship production-ready apps in minutes.",
	keywords: [
		"cloud IDE",
		"AI coding",
		"development environment",
		"code editor",
		"AI assistant",
		"cloud development",
		"VS Code alternative",
		"online IDE",
	],
	authors: [{ name: "Cline IDE" }],
	creator: "Cline IDE",
	publisher: "Cline IDE",
	icons: {
		icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2358a6ff'%3E%3Cpath d='M12 2L14.5 8L21 9L16 14L17.5 21L12 17.5L6.5 21L8 14L3 9L9.5 8L12 2Z'/%3E%3C/svg%3E",
		apple: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2358a6ff'%3E%3Cpath d='M12 2L14.5 8L21 9L16 14L17.5 21L12 17.5L6.5 21L8 14L3 9L9.5 8L12 2Z'/%3E%3C/svg%3E",
	},
	openGraph: {
		type: "website",
		locale: "en_US",
		title: "Cline IDE - AI-Powered Cloud Development Environment",
		description:
			"Build software 10x faster with AI. The modern cloud IDE that brings AI-powered coding assistance directly into your workflow.",
		siteName: "Cline IDE",
	},
	twitter: {
		card: "summary_large_image",
		title: "Cline IDE - AI-Powered Cloud Development Environment",
		description:
			"Build software 10x faster with AI. The modern cloud IDE that brings AI-powered coding assistance directly into your workflow.",
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
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
