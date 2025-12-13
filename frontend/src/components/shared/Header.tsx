"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/primitives"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/stores/auth-store"

interface HeaderProps {
	variant?: "landing" | "dashboard"
}

export function Header({ variant = "landing" }: HeaderProps) {
	const [isScrolled, setIsScrolled] = useState(false)
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
	const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
	const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
	const { isAuthenticated, user, logout } = useAuthStore()
	const router = useRouter()
	const userMenuRef = useRef<HTMLDivElement>(null)
	const notificationsRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 10)
		}
		window.addEventListener("scroll", handleScroll)
		return () => window.removeEventListener("scroll", handleScroll)
	}, [])

	// Close menus when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
				setIsUserMenuOpen(false)
			}
			if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
				setIsNotificationsOpen(false)
			}
		}
		document.addEventListener("mousedown", handleClickOutside)
		return () => document.removeEventListener("mousedown", handleClickOutside)
	}, [])

	// Close mobile menu when route changes
	useEffect(() => {
		setIsMobileMenuOpen(false)
	}, [router])

	const notifications = [
		{ id: 1, title: "Deployment successful", message: "Your project was deployed", time: "2m ago", unread: true },
		{ id: 2, title: "New team member", message: "Alex joined your workspace", time: "1h ago", unread: true },
		{ id: 3, title: "Weekly report", message: "Your weekly activity summary", time: "1d ago", unread: false },
	]

	const unreadCount = notifications.filter((n) => n.unread).length

	if (variant === "dashboard" && isAuthenticated) {
		return (
			<header className="bg-surface-secondary/80 backdrop-blur-xl border-b border-border-primary sticky top-0 z-50">
				<div className="container-app py-3 flex items-center justify-between">
					{/* Logo */}
					<Link className="flex items-center gap-3 group" href="/projects">
						<div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-primary to-accent-cyan flex items-center justify-center transition-transform group-hover:scale-105">
							<svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
								<path d="M12 2L14.5 8L21 9L16 14L17.5 21L12 17.5L6.5 21L8 14L3 9L9.5 8L12 2Z" />
							</svg>
						</div>
						<span className="text-lg font-bold text-text-bright">Cline IDE</span>
					</Link>

					{/* Center: Search */}
					<div className="hidden md:flex flex-1 max-w-md mx-8">
						<div className="relative w-full">
							<svg
								className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24">
								<path
									d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
								/>
							</svg>
							<input
								className="w-full h-9 pl-10 pr-4 rounded-lg bg-surface-tertiary border border-border-primary text-sm text-text-primary placeholder:text-text-muted focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary transition-all"
								placeholder="Search projects..."
								type="text"
							/>
							<kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center px-1.5 h-5 text-[10px] font-medium text-text-muted bg-surface-elevated rounded border border-border-primary">
								⌘K
							</kbd>
						</div>
					</div>

					{/* Right: Actions */}
					<div className="flex items-center gap-2">
						{/* Create New */}
						<Button
							className="hidden sm:flex gap-2"
							onClick={() => router.push("/projects?create=true")}
							size="md"
							variant="primary">
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
							</svg>
							New Project
						</Button>

						{/* Notifications */}
						<div className="relative" ref={notificationsRef}>
							<button
								className="relative p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-tertiary transition-colors"
								onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}>
								<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
									/>
								</svg>
								{unreadCount > 0 && (
									<span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-accent-rose text-white text-[10px] font-bold flex items-center justify-center">
										{unreadCount}
									</span>
								)}
							</button>

							{/* Notifications Dropdown */}
							{isNotificationsOpen && (
								<div className="absolute right-0 mt-2 w-80 rounded-xl bg-surface-secondary border border-border-primary shadow-xl animate-scale-in origin-top-right">
									<div className="p-4 border-b border-border-primary flex items-center justify-between">
										<h3 className="font-semibold text-text-bright">Notifications</h3>
										<button className="text-xs text-accent-primary hover:underline">Mark all read</button>
									</div>
									<div className="max-h-80 overflow-y-auto">
										{notifications.map((notification) => (
											<div
												className={cn(
													"p-4 border-b border-border-primary last:border-0 hover:bg-surface-tertiary transition-colors cursor-pointer",
													notification.unread && "bg-accent-primary/5",
												)}
												key={notification.id}>
												<div className="flex items-start gap-3">
													<div
														className={cn(
															"w-2 h-2 rounded-full mt-2 shrink-0",
															notification.unread ? "bg-accent-primary" : "bg-transparent",
														)}
													/>
													<div className="flex-1 min-w-0">
														<p className="text-sm font-medium text-text-bright truncate">
															{notification.title}
														</p>
														<p className="text-xs text-text-secondary mt-0.5">
															{notification.message}
														</p>
														<p className="text-xs text-text-muted mt-1">{notification.time}</p>
													</div>
												</div>
											</div>
										))}
									</div>
									<div className="p-3 border-t border-border-primary">
										<button className="w-full text-sm text-center text-accent-primary hover:underline">
											View all notifications
										</button>
									</div>
								</div>
							)}
						</div>

						{/* User Menu */}
						<div className="relative" ref={userMenuRef}>
							<button
								className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-surface-tertiary transition-colors"
								onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}>
								<div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-primary to-accent-cyan flex items-center justify-center">
									<span className="text-sm font-medium text-white">
										{(user?.username || user?.email || "U")[0].toUpperCase()}
									</span>
								</div>
								<svg
									className={cn("w-4 h-4 text-text-muted transition-transform", isUserMenuOpen && "rotate-180")}
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24">
									<path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
								</svg>
							</button>

							{/* User Dropdown */}
							{isUserMenuOpen && (
								<div className="absolute right-0 mt-2 w-56 rounded-xl bg-surface-secondary border border-border-primary shadow-xl animate-scale-in origin-top-right">
									<div className="p-4 border-b border-border-primary">
										<p className="text-sm font-medium text-text-bright truncate">
											{user?.username || "User"}
										</p>
										<p className="text-xs text-text-muted truncate">{user?.email || "user@example.com"}</p>
									</div>
									<div className="p-2">
										<button
											className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-surface-tertiary transition-colors"
											onClick={() => {
												setIsUserMenuOpen(false)
												router.push("/projects")
											}}>
											<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path
													d="M3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V9C21 7.89543 20.1046 7 19 7H13L11 5H5C3.89543 5 3 5.89543 3 7Z"
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
												/>
											</svg>
											My Projects
										</button>
										<button
											className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-surface-tertiary transition-colors"
											onClick={() => {
												setIsUserMenuOpen(false)
												router.push("/settings")
											}}>
											<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path
													d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
												/>
												<path
													d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
												/>
											</svg>
											Settings
										</button>
										<button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-surface-tertiary transition-colors">
											<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path
													d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
												/>
											</svg>
											Help & Support
										</button>
									</div>
									<div className="p-2 border-t border-border-primary">
										<button
											className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-accent-rose hover:bg-accent-rose/10 transition-colors"
											onClick={() => {
												setIsUserMenuOpen(false)
												logout()
											}}>
											<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path
													d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
												/>
											</svg>
											Sign Out
										</button>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</header>
		)
	}

	return (
		<header
			className={cn(
				"sticky top-0 z-50 border-b transition-all duration-300",
				isScrolled
					? "bg-surface-secondary/90 backdrop-blur-xl border-border-primary shadow-lg"
					: "bg-transparent border-transparent",
			)}>
			<nav className="container-app py-4">
				<div className="flex items-center justify-between">
					{/* Logo */}
					<Link className="flex items-center gap-3 group" href="/">
						<div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-primary to-accent-cyan flex items-center justify-center transition-transform group-hover:scale-105">
							<svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
								<path d="M12 2L14.5 8L21 9L16 14L17.5 21L12 17.5L6.5 21L8 14L3 9L9.5 8L12 2Z" />
							</svg>
						</div>
						<span className="text-lg font-bold text-text-bright">Cline IDE</span>
					</Link>

					{/* Desktop Navigation */}
					<div className="hidden md:flex items-center gap-8">
						<Link
							className="text-sm font-medium text-text-secondary hover:text-text-bright transition-colors"
							href="#features">
							Features
						</Link>
						<Link
							className="text-sm font-medium text-text-secondary hover:text-text-bright transition-colors"
							href="#pricing">
							Pricing
						</Link>
						<Link
							className="text-sm font-medium text-text-secondary hover:text-text-bright transition-colors"
							href="/docs">
							Docs
						</Link>
						<Link
							className="text-sm font-medium text-text-secondary hover:text-text-bright transition-colors"
							href="/blog">
							Blog
						</Link>
					</div>

					{/* Desktop CTA Buttons */}
					<div className="hidden md:flex items-center gap-3">
						{isAuthenticated ? (
							<>
								<Button onClick={() => router.push("/projects")} size="md" variant="ghost">
									Dashboard
								</Button>
								<Button onClick={logout} size="md" variant="secondary">
									Logout
								</Button>
							</>
						) : (
							<>
								<Link href="/login">
									<Button size="md" variant="ghost">
										Sign In
									</Button>
								</Link>
								<Link href="/login">
									<Button className="glow-on-hover" size="md" variant="primary">
										Get Started
									</Button>
								</Link>
							</>
						)}
					</div>

					{/* Mobile Menu Button */}
					<button
						aria-label="Toggle menu"
						className="md:hidden p-2 rounded-lg text-text-secondary hover:text-text-bright hover:bg-surface-tertiary transition-colors"
						onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
						type="button">
						{isMobileMenuOpen ? (
							<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
							</svg>
						) : (
							<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
							</svg>
						)}
					</button>
				</div>

				{/* Mobile Menu */}
				{isMobileMenuOpen && (
					<div className="md:hidden mt-4 pb-4 border-t border-border-primary pt-4 animate-fade-in-down">
						<div className="flex flex-col gap-1">
							<Link
								className="px-3 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:text-text-bright hover:bg-surface-tertiary transition-colors"
								href="#features"
								onClick={() => setIsMobileMenuOpen(false)}>
								Features
							</Link>
							<Link
								className="px-3 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:text-text-bright hover:bg-surface-tertiary transition-colors"
								href="#pricing"
								onClick={() => setIsMobileMenuOpen(false)}>
								Pricing
							</Link>
							<Link
								className="px-3 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:text-text-bright hover:bg-surface-tertiary transition-colors"
								href="/docs"
								onClick={() => setIsMobileMenuOpen(false)}>
								Docs
							</Link>
							<Link
								className="px-3 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:text-text-bright hover:bg-surface-tertiary transition-colors"
								href="/blog"
								onClick={() => setIsMobileMenuOpen(false)}>
								Blog
							</Link>
						</div>
						<div className="flex flex-col gap-3 pt-4 mt-4 border-t border-border-primary">
							{isAuthenticated ? (
								<>
									<Button
										className="w-full"
										onClick={() => router.push("/projects")}
										size="lg"
										variant="primary">
										Dashboard
									</Button>
									<Button className="w-full" onClick={logout} size="lg" variant="secondary">
										Logout
									</Button>
								</>
							) : (
								<>
									<Link className="w-full" href="/login">
										<Button className="w-full" size="lg" variant="primary">
											Get Started
										</Button>
									</Link>
									<Link className="w-full" href="/login">
										<Button className="w-full" size="lg" variant="ghost">
											Sign In
										</Button>
									</Link>
								</>
							)}
						</div>
					</div>
				)}
			</nav>
		</header>
	)
}
