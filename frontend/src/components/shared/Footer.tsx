"use client"

import Link from "next/link"

export function Footer() {
	const currentYear = new Date().getFullYear()

	return (
		<footer className="border-t border-border-primary bg-surface-secondary/30">
			<div className="container-app py-16">
				{/* Main Footer Content */}
				<div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
					{/* Brand Column */}
					<div className="col-span-2">
						<Link className="inline-flex items-center gap-3 mb-5 group" href="/">
							<div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-primary to-accent-cyan flex items-center justify-center transition-transform group-hover:scale-105">
								<svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
									<path d="M12 2L14.5 8L21 9L16 14L17.5 21L12 17.5L6.5 21L8 14L3 9L9.5 8L12 2Z" />
								</svg>
							</div>
							<span className="text-lg font-bold text-text-bright">Cline IDE</span>
						</Link>
						<p className="text-sm text-text-secondary mb-6 max-w-xs leading-relaxed">
							The AI-powered cloud development environment. Build faster, code smarter, ship sooner.
						</p>
						{/* Social Links */}
						<div className="flex items-center gap-2">
							<a
								aria-label="GitHub"
								className="p-2.5 rounded-lg text-text-secondary hover:text-text-bright hover:bg-surface-tertiary transition-colors"
								href="https://github.com"
								rel="noopener noreferrer"
								target="_blank">
								<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
									<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
								</svg>
							</a>
							<a
								aria-label="Twitter / X"
								className="p-2.5 rounded-lg text-text-secondary hover:text-text-bright hover:bg-surface-tertiary transition-colors"
								href="https://twitter.com"
								rel="noopener noreferrer"
								target="_blank">
								<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
									<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
								</svg>
							</a>
							<a
								aria-label="Discord"
								className="p-2.5 rounded-lg text-text-secondary hover:text-text-bright hover:bg-surface-tertiary transition-colors"
								href="https://discord.com"
								rel="noopener noreferrer"
								target="_blank">
								<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
									<path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
								</svg>
							</a>
							<a
								aria-label="LinkedIn"
								className="p-2.5 rounded-lg text-text-secondary hover:text-text-bright hover:bg-surface-tertiary transition-colors"
								href="https://linkedin.com"
								rel="noopener noreferrer"
								target="_blank">
								<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
									<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
								</svg>
							</a>
						</div>
					</div>

					{/* Product Column */}
					<div>
						<h3 className="text-sm font-semibold text-text-bright mb-4">Product</h3>
						<ul className="space-y-3">
							<li>
								<Link className="text-sm text-text-secondary hover:text-text-bright transition-colors" href="#features">
									Features
								</Link>
							</li>
							<li>
								<Link className="text-sm text-text-secondary hover:text-text-bright transition-colors" href="#pricing">
									Pricing
								</Link>
							</li>
							<li>
								<Link className="text-sm text-text-secondary hover:text-text-bright transition-colors" href="/changelog">
									Changelog
								</Link>
							</li>
							<li>
								<Link className="text-sm text-text-secondary hover:text-text-bright transition-colors" href="/roadmap">
									Roadmap
								</Link>
							</li>
						</ul>
					</div>

					{/* Developers Column */}
					<div>
						<h3 className="text-sm font-semibold text-text-bright mb-4">Developers</h3>
						<ul className="space-y-3">
							<li>
								<Link className="text-sm text-text-secondary hover:text-text-bright transition-colors" href="/docs">
									Documentation
								</Link>
							</li>
							<li>
								<Link className="text-sm text-text-secondary hover:text-text-bright transition-colors" href="/api">
									API Reference
								</Link>
							</li>
							<li>
								<Link className="text-sm text-text-secondary hover:text-text-bright transition-colors" href="/guides">
									Guides
								</Link>
							</li>
							<li>
								<Link className="text-sm text-text-secondary hover:text-text-bright transition-colors" href="/templates">
									Templates
								</Link>
							</li>
						</ul>
					</div>

					{/* Company Column */}
					<div>
						<h3 className="text-sm font-semibold text-text-bright mb-4">Company</h3>
						<ul className="space-y-3">
							<li>
								<Link className="text-sm text-text-secondary hover:text-text-bright transition-colors" href="/about">
									About
								</Link>
							</li>
							<li>
								<Link className="text-sm text-text-secondary hover:text-text-bright transition-colors" href="/blog">
									Blog
								</Link>
							</li>
							<li>
								<Link className="text-sm text-text-secondary hover:text-text-bright transition-colors" href="/careers">
									Careers
									<span className="ml-2 px-1.5 py-0.5 text-[10px] font-medium bg-accent-emerald/20 text-accent-emerald rounded">Hiring</span>
								</Link>
							</li>
							<li>
								<Link className="text-sm text-text-secondary hover:text-text-bright transition-colors" href="/contact">
									Contact
								</Link>
							</li>
						</ul>
					</div>

					{/* Legal Column */}
					<div>
						<h3 className="text-sm font-semibold text-text-bright mb-4">Legal</h3>
						<ul className="space-y-3">
							<li>
								<Link className="text-sm text-text-secondary hover:text-text-bright transition-colors" href="/privacy">
									Privacy
								</Link>
							</li>
							<li>
								<Link className="text-sm text-text-secondary hover:text-text-bright transition-colors" href="/terms">
									Terms
								</Link>
							</li>
							<li>
								<Link className="text-sm text-text-secondary hover:text-text-bright transition-colors" href="/security">
									Security
								</Link>
							</li>
							<li>
								<Link className="text-sm text-text-secondary hover:text-text-bright transition-colors" href="/cookies">
									Cookies
								</Link>
							</li>
						</ul>
					</div>
				</div>

				{/* Bottom Bar */}
				<div className="pt-8 border-t border-border-primary flex flex-col md:flex-row items-center justify-between gap-4">
					<div className="flex items-center gap-4">
						<p className="text-sm text-text-muted">© {currentYear} Cline IDE. All rights reserved.</p>
					</div>
					<div className="flex items-center gap-6">
						<Link 
							className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-bright transition-colors" 
							href="/status">
							<span className="relative flex h-2 w-2">
								<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-emerald opacity-75" />
								<span className="relative inline-flex rounded-full h-2 w-2 bg-accent-emerald" />
							</span>
							All systems operational
						</Link>
					</div>
				</div>
			</div>
		</footer>
	)
}
