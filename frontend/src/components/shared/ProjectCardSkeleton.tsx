"use client"

import { Skeleton } from "@/components/ui/primitives"

export function ProjectCardSkeleton() {
	return (
		<div className="bg-bg-secondary border border-border-primary rounded-lg p-6">
			<div className="flex items-start justify-between mb-3">
				<Skeleton className="w-10 h-10 rounded-lg" />
				<Skeleton className="w-6 h-6 rounded" />
			</div>
			<Skeleton className="h-6 w-3/4 mb-2" />
			<Skeleton className="h-4 w-full mb-1" />
			<Skeleton className="h-4 w-2/3 mb-4" />
			<div className="flex items-center justify-between pt-4 border-t border-border-primary">
				<Skeleton className="h-3 w-24" />
				<Skeleton className="h-3 w-16" />
			</div>
		</div>
	)
}

