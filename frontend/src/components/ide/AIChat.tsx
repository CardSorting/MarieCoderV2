/**
 * AI Chat Component
 * Chat interface for Cline AI assistant
 */
"use client"

import { useMutation } from "@tanstack/react-query"
import { memo, useCallback, useEffect, useRef, useState } from "react"
import { AttachIcon, CloseIcon, FileIcon, SendIcon, SparkleIcon, UserIcon } from "@/components/ui/icons"
import { Button, IconButton } from "@/components/ui/primitives"
import { apiClient } from "@/lib/api-client"
import { cn } from "@/lib/utils"
import { wsClient } from "@/lib/websocket-client"

// Types
interface Message {
	id: string
	role: "user" | "assistant" | "system"
	content: string
	timestamp: number
	status?: "sending" | "sent" | "error"
}

interface AIChatProps {
	projectId: string
}

export default function AIChat({ projectId }: AIChatProps) {
	const [messages, setMessages] = useState<Message[]>([])
	const [input, setInput] = useState("")
	const [selectedFiles, setSelectedFiles] = useState<string[]>([])
	const [isTyping, setIsTyping] = useState(false)
	const messagesEndRef = useRef<HTMLDivElement>(null)
	const textareaRef = useRef<HTMLTextAreaElement>(null)

	// WebSocket connection
	useEffect(() => {
		wsClient.connect(projectId).catch(console.error)

		const unsubscribe = wsClient.on("task-update", (message: unknown) => {
			const msg = message as { content?: string }
			if (msg.content && typeof msg.content === "string") {
				setIsTyping(false)
				setMessages((prev) => [
					...prev,
					{
						id: Date.now().toString(),
						role: "assistant",
						content: msg.content as string,
						timestamp: Date.now(),
						status: "sent",
					},
				])
			}
		})

		return () => {
			unsubscribe()
		}
	}, [projectId])

	// Create task mutation
	const createTaskMutation = useMutation({
		mutationFn: (prompt: string) => apiClient.createTask(projectId, prompt, selectedFiles),
		onMutate: () => setIsTyping(true),
		onSuccess: () => {
			setMessages((prev) => [
				...prev,
				{
					id: Date.now().toString(),
					role: "user",
					content: input,
					timestamp: Date.now(),
					status: "sent",
				},
			])
			setInput("")
			setSelectedFiles([])
			if (textareaRef.current) {
				textareaRef.current.style.height = "auto"
			}
		},
		onError: () => setIsTyping(false),
	})

	// Scroll to bottom
	const scrollToBottom = useCallback(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
	}, [])

	useEffect(() => {
		scrollToBottom()
	}, [messages, scrollToBottom])

	// Handle submit
	const handleSubmit = (e?: React.FormEvent) => {
		e?.preventDefault()
		if (input.trim() && !createTaskMutation.isPending) {
			createTaskMutation.mutate(input.trim())
		}
	}

	// Handle keyboard shortcuts
	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault()
			handleSubmit()
		}
	}

	// Auto-resize textarea
	const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setInput(e.target.value)
		e.target.style.height = "auto"
		e.target.style.height = Math.min(e.target.scrollHeight, 200) + "px"
	}

	const removeFile = (file: string) => {
		setSelectedFiles((prev) => prev.filter((f) => f !== file))
	}

	const clearChat = () => {
		setMessages([])
	}

	return (
		<div className="h-full flex flex-col bg-secondary">
			{/* Messages */}
			<div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scrollbar-thin">
				{/* Empty State */}
				{messages.length === 0 && <WelcomeState onSuggestionClick={setInput} />}

				{/* Message List */}
				{messages.map((message) => (
					<MessageBubble key={message.id} message={message} />
				))}

				{/* Typing Indicator */}
				{isTyping && <TypingIndicator />}

				<div ref={messagesEndRef} />
			</div>

			{/* Input Area */}
			<div className="border-t border-border-primary p-4 bg-secondary">
				{/* Selected Files */}
				{selectedFiles.length > 0 && (
					<div className="flex flex-wrap gap-1.5 mb-3">
						{selectedFiles.map((file) => (
							<FileTag file={file} key={file} onRemove={() => removeFile(file)} />
						))}
					</div>
				)}

				{/* Input Form */}
				<form onSubmit={handleSubmit}>
					<div className="flex items-end gap-2 py-2 px-3 bg-tertiary border border-border-primary rounded-lg focus-within:border-accent-bright transition-colors duration-150">
						<textarea
							className="flex-1 py-1 px-0 text-[13px] text-primary bg-transparent border-none outline-none resize-none leading-normal min-h-6 max-h-[200px] placeholder:text-muted"
							disabled={createTaskMutation.isPending}
							onChange={handleInputChange}
							onKeyDown={handleKeyDown}
							placeholder="Ask Cline to help with your code..."
							ref={textareaRef}
							rows={1}
							value={input}
						/>
						<div className="flex gap-1 shrink-0">
							<IconButton size="md" tooltip="Attach file" type="button">
								<AttachIcon size={18} />
							</IconButton>
							<Button
								aria-label="Send message"
								disabled={!input.trim() || createTaskMutation.isPending}
								size="icon"
								type="submit"
								variant="primary">
								<SendIcon size={18} />
							</Button>
						</div>
					</div>
				</form>

				{/* Footer Hints */}
				<div className="flex items-center justify-between mt-2 px-1">
					<span className="text-xs text-muted">
						Press{" "}
						<kbd className="px-1.5 py-0.5 text-[10px] bg-tertiary border border-border-primary rounded">Enter</kbd> to
						send,{" "}
						<kbd className="px-1.5 py-0.5 text-[10px] bg-tertiary border border-border-primary rounded">
							Shift + Enter
						</kbd>{" "}
						for new line
					</span>
					{messages.length > 0 && (
						<button
							className="text-xs text-muted hover:text-secondary bg-transparent border-none cursor-pointer transition-colors duration-75"
							onClick={clearChat}>
							Clear chat
						</button>
					)}
				</div>
			</div>
		</div>
	)
}

// Welcome State Component
interface WelcomeStateProps {
	onSuggestionClick: (prompt: string) => void
}

function WelcomeState({ onSuggestionClick }: WelcomeStateProps) {
	const suggestions = [
		{ text: "Understand this codebase", prompt: "Help me understand this codebase" },
		{ text: "Create a new component", prompt: "Create a new component for " },
		{ text: "Debug an issue", prompt: "Fix the bug in " },
		{ text: "Refactor code", prompt: "Refactor the code in " },
	]

	return (
		<div className="flex flex-col items-center justify-center text-center p-8 m-auto animate-fade-in">
			<div className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-status-success to-accent-bright rounded-2xl mb-5 text-bright">
				<SparkleIcon size={36} />
			</div>
			<h3 className="text-xl font-semibold text-primary mb-2">Welcome to Cline AI</h3>
			<p className="text-sm text-secondary mb-5">I'm your AI coding assistant. Ask me to help you:</p>
			<div className="flex flex-wrap gap-2 justify-center max-w-md">
				{suggestions.map((suggestion) => (
					<button
						className="flex items-center gap-2 py-2 px-3.5 bg-tertiary border border-border-primary rounded-lg text-secondary text-sm cursor-pointer transition-all duration-100 hover:bg-elevated hover:border-accent-bright hover:text-primary"
						key={suggestion.text}
						onClick={() => onSuggestionClick(suggestion.prompt)}>
						{suggestion.text}
					</button>
				))}
			</div>
		</div>
	)
}

// Message Bubble Component
interface MessageBubbleProps {
	message: Message
}

const MessageBubble = memo(function MessageBubble({ message }: MessageBubbleProps) {
	const isUser = message.role === "user"

	return (
		<div className={cn("flex gap-3 p-3 rounded-lg animate-fade-in-up", isUser ? "bg-tertiary" : "")}>
			{/* Avatar */}
			<div
				className={cn(
					"w-8 h-8 flex items-center justify-center rounded-lg shrink-0 text-bright",
					isUser ? "bg-accent-primary" : "bg-gradient-to-br from-status-success to-accent-bright",
				)}>
				{isUser ? <UserIcon size={18} /> : <SparkleIcon size={18} />}
			</div>

			{/* Content */}
			<div className="flex-1 min-w-0">
				<div className="flex items-center gap-2 mb-1">
					<span className="text-sm font-semibold text-primary">{isUser ? "You" : "Cline"}</span>
					<span className="text-xs text-muted">
						{new Date(message.timestamp).toLocaleTimeString([], {
							hour: "2-digit",
							minute: "2-digit",
						})}
					</span>
				</div>
				<div className="text-[13px] text-primary leading-relaxed whitespace-pre-wrap break-words">{message.content}</div>
			</div>
		</div>
	)
})

// Typing Indicator Component
function TypingIndicator() {
	return (
		<div className="flex gap-3 p-3 animate-fade-in">
			<div className="w-8 h-8 flex items-center justify-center rounded-lg shrink-0 bg-gradient-to-br from-status-success to-accent-bright text-bright">
				<SparkleIcon size={18} />
			</div>
			<div className="flex gap-1.5 items-center py-2">
				<span className="w-2 h-2 bg-muted rounded-full animate-bounce-dots" style={{ animationDelay: "0s" }} />
				<span className="w-2 h-2 bg-muted rounded-full animate-bounce-dots" style={{ animationDelay: "0.2s" }} />
				<span className="w-2 h-2 bg-muted rounded-full animate-bounce-dots" style={{ animationDelay: "0.4s" }} />
			</div>
		</div>
	)
}

// File Tag Component
interface FileTagProps {
	file: string
	onRemove: () => void
}

function FileTag({ file, onRemove }: FileTagProps) {
	return (
		<span className="flex items-center gap-1.5 py-1 px-2 bg-tertiary rounded text-xs text-secondary">
			<FileIcon size={12} />
			{file}
			<button
				className="flex items-center justify-center w-4 h-4 p-0 bg-transparent border-none rounded text-muted cursor-pointer transition-all duration-75 hover:bg-surface-elevated hover:text-primary"
				onClick={onRemove}>
				<CloseIcon size={10} />
			</button>
		</span>
	)
}
