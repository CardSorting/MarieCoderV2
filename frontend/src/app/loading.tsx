export default function Loading() {
	return (
		<div className="h-screen flex items-center justify-center bg-bg-primary">
			<div className="flex flex-col items-center gap-4">
				<svg className="w-16 h-16 text-accent-bright animate-pulse" fill="currentColor" viewBox="0 0 24 24">
					<path d="M12 2L14.5 8L21 9L16 14L17.5 21L12 17.5L6.5 21L8 14L3 9L9.5 8L12 2Z" />
				</svg>
				<div className="w-6 h-6 border-2 border-border-primary border-t-accent-bright rounded-full animate-spin" />
			</div>
		</div>
	)
}
