"use client"

import { useEffect, useState } from "react"
import { create } from "zustand"
import { cn } from "@/lib/utils"

export type ToastType = "success" | "error" | "info" | "warning"

interface Toast {
	id: string
	message: string
	type: ToastType
	duration?: number
}

interface ToastStore {
	toasts: Toast[]
	addToast: (toast: Omit<Toast, "id">) => void
	removeToast: (id: string) => void
}

export const useToastStore = create<ToastStore>((set) => ({
	toasts: [],
	addToast: (toast) => {
		const id = Math.random().toString(36).substring(7)
		set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }))
		return id
	},
	removeToast: (id) => {
		set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
	},
}))

export function toast(message: string, type: ToastType = "info", duration = 5000) {
	return useToastStore.getState().addToast({ message, type, duration })
}

function ToastItem({ toast: t }: { toast: Toast }) {
	const removeToast = useToastStore((state) => state.removeToast)
	const [isExiting, setIsExiting] = useState(false)

	useEffect(() => {
		if (t.duration && t.duration > 0) {
			const timer = setTimeout(() => {
				setIsExiting(true)
				setTimeout(() => removeToast(t.id), 300)
			}, t.duration)
			return () => clearTimeout(timer)
		}
	}, [t.duration, t.id, removeToast])

	const handleClose = () => {
		setIsExiting(true)
		setTimeout(() => removeToast(t.id), 300)
	}

	const icons = {
		success: (
			<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
			</svg>
		),
		error: (
			<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
			</svg>
		),
		warning: (
			<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
			</svg>
		),
		info: (
			<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
			</svg>
		),
	}

	const styles = {
		success: "bg-status-success/20 border-status-success/50 text-status-success",
		error: "bg-status-error/20 border-status-error/50 text-status-error",
		warning: "bg-status-warning/20 border-status-warning/50 text-status-warning",
		info: "bg-status-info/20 border-status-info/50 text-status-info",
	}

	return (
		<div
			className={cn(
				"flex items-start gap-3 p-4 rounded-lg border backdrop-blur-sm shadow-lg min-w-[300px] max-w-md animate-fade-in-up",
				styles[t.type],
				isExiting && "animate-fade-out"
			)}>
			<div className="flex-shrink-0 mt-0.5">{icons[t.type]}</div>
			<div className="flex-1 text-sm font-medium">{t.message}</div>
			<button
				className="flex-shrink-0 p-1 rounded hover:bg-black/10 transition-colors"
				onClick={handleClose}
				type="button">
				<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
				</svg>
			</button>
		</div>
	)
}

export function Toaster() {
	const toasts = useToastStore((state) => state.toasts)

	if (toasts.length === 0) return null

	return (
		<div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
			{toasts.map((toast) => (
				<div className="pointer-events-auto" key={toast.id}>
					<ToastItem toast={toast} />
				</div>
			))}
		</div>
	)
}

