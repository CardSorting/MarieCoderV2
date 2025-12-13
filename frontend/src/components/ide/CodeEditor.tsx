/**
 * Code Editor Component
 * Monaco Editor with VS Code-like configuration
 */
"use client"

import Editor, { OnMount } from "@monaco-editor/react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ErrorIcon, LoadingSpinner } from "@/components/ui/icons"
import { apiClient } from "@/lib/api-client"
import { EDITOR_THEME, SYNTAX_COLORS } from "@/lib/constants"
import { getDisplayLanguage, getLanguageFromPath } from "@/lib/file-icons"
import { debounce } from "@/lib/utils"
import { wsClient } from "@/lib/websocket-client"

interface CodeEditorProps {
	filePath: string
	projectId: string
	onFileChange?: (path: string, content: string) => void
	onCursorChange?: (line: number, column: number) => void
	onLanguageDetected?: (language: string) => void
}

export default function CodeEditor({ filePath, projectId, onFileChange, onCursorChange, onLanguageDetected }: CodeEditorProps) {
	const [content, setContent] = useState("")
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [, setIsDirty] = useState(false)
	const editorRef = useRef<unknown>(null)
	const originalContent = useRef<string>("")
	const language = getLanguageFromPath(filePath)

	// Notify parent of language
	useEffect(() => {
		onLanguageDetected?.(getDisplayLanguage(language))
	}, [language, onLanguageDetected])

	// Load file content
	useEffect(() => {
		let cancelled = false

		const loadFile = async () => {
			setLoading(true)
			setError(null)
			setIsDirty(false)

			try {
				const fileContent = await apiClient.readFile(projectId, filePath)
				if (!cancelled) {
					setContent(fileContent)
					originalContent.current = fileContent
				}
			} catch (err: unknown) {
				if (!cancelled) {
					const axiosError = err as { response?: { data?: { error?: string } } }
					setError(axiosError.response?.data?.error || "Failed to load file")
					setContent("")
				}
			} finally {
				if (!cancelled) setLoading(false)
			}
		}

		loadFile()
		return () => {
			cancelled = true
		}
	}, [filePath, projectId])

	// Debounced save
	const debouncedSave = useMemo(
		() =>
			debounce(async (path: string, newContent: string) => {
				try {
					await apiClient.writeFile(projectId, path, newContent)
					originalContent.current = newContent
					setIsDirty(false)
					wsClient.send({ type: "file-change", path, content: newContent })
				} catch (err: unknown) {
					console.error("Failed to save file", err)
				}
			}, 1500),
		[projectId],
	)

	// Editor mount handler
	const handleEditorDidMount: OnMount = useCallback(
		(editor, monaco) => {
			editorRef.current = editor

			// Define custom theme (GitHub Dark Dimmed inspired)
			monaco.editor.defineTheme("cline-dark", {
				base: "vs-dark",
				inherit: true,
				rules: [
					{ token: "comment", foreground: SYNTAX_COLORS.comment.slice(1), fontStyle: "italic" },
					{ token: "keyword", foreground: SYNTAX_COLORS.keyword.slice(1) },
					{ token: "string", foreground: SYNTAX_COLORS.string.slice(1) },
					{ token: "number", foreground: SYNTAX_COLORS.number.slice(1) },
					{ token: "type", foreground: SYNTAX_COLORS.type.slice(1) },
					{ token: "function", foreground: SYNTAX_COLORS.function.slice(1) },
					{ token: "variable", foreground: SYNTAX_COLORS.variable.slice(1) },
					{ token: "constant", foreground: SYNTAX_COLORS.constant.slice(1) },
					{ token: "class", foreground: SYNTAX_COLORS.class.slice(1) },
					{ token: "operator", foreground: SYNTAX_COLORS.operator.slice(1) },
				],
				colors: {
					"editor.background": EDITOR_THEME.background,
					"editor.foreground": EDITOR_THEME.foreground,
					"editor.lineHighlightBackground": EDITOR_THEME.lineHighlight,
					"editor.selectionBackground": EDITOR_THEME.selection,
					"editor.inactiveSelectionBackground": EDITOR_THEME.inactiveSelection,
					"editorCursor.foreground": EDITOR_THEME.cursor,
					"editorLineNumber.foreground": EDITOR_THEME.lineNumber,
					"editorLineNumber.activeForeground": EDITOR_THEME.lineNumberActive,
					"editorGutter.background": EDITOR_THEME.gutter,
					"editorIndentGuide.background": EDITOR_THEME.indentGuide,
					"editorIndentGuide.activeBackground": EDITOR_THEME.indentGuideActive,
					"editor.findMatchBackground": EDITOR_THEME.findMatch,
					"editor.findMatchHighlightBackground": EDITOR_THEME.findMatchHighlight,
					"editorBracketMatch.background": "#388bfd33",
					"editorBracketMatch.border": EDITOR_THEME.bracket,
					"minimap.background": EDITOR_THEME.minimap,
					"scrollbarSlider.background": "rgba(110, 118, 129, 0.4)",
					"scrollbarSlider.hoverBackground": "rgba(110, 118, 129, 0.7)",
				},
			})

			monaco.editor.setTheme("cline-dark")

			// Track cursor position
			editor.onDidChangeCursorPosition((e: { position: { lineNumber: number; column: number } }) => {
				onCursorChange?.(e.position.lineNumber, e.position.column)
			})

			// Handle Cmd+S to save
			editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
				if (editorRef.current) {
					const currentEditor = editorRef.current as { getValue: () => string }
					const currentContent = currentEditor.getValue()
					apiClient.writeFile(projectId, filePath, currentContent).then(() => {
						originalContent.current = currentContent
						setIsDirty(false)
					})
				}
			})
		},
		[filePath, projectId, onCursorChange],
	)

	// Handle content changes
	const handleChange = useCallback(
		(value: string | undefined) => {
			const newContent = value || ""
			setContent(newContent)
			setIsDirty(newContent !== originalContent.current)
			debouncedSave(filePath, newContent)
			onFileChange?.(filePath, newContent)
		},
		[filePath, debouncedSave, onFileChange],
	)

	// Loading state
	if (loading) {
		return (
			<div className="h-full w-full bg-primary flex flex-col items-center justify-center gap-3">
				<LoadingSpinner className="text-accent-bright" size={32} />
				<span className="text-secondary text-sm">Loading file...</span>
			</div>
		)
	}

	// Error state
	if (error) {
		return (
			<div className="h-full w-full bg-primary flex flex-col items-center justify-center gap-3 text-muted">
				<ErrorIcon className="text-status-error opacity-50" size={48} />
				<h3 className="text-lg font-medium text-secondary">Unable to load file</h3>
				<p className="text-sm">{error}</p>
			</div>
		)
	}

	return (
		<div className="h-full w-full bg-primary relative">
			<Editor
				height="100%"
				language={language}
				loading={
					<div className="h-full flex flex-col items-center justify-center gap-3 bg-primary">
						<LoadingSpinner className="text-accent-bright" size={32} />
						<span className="text-secondary text-sm">Initializing editor...</span>
					</div>
				}
				onChange={handleChange}
				onMount={handleEditorDidMount}
				options={{
					// Typography
					fontSize: 13,
					fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', Monaco, Consolas, monospace",
					fontLigatures: true,
					lineHeight: 20,
					letterSpacing: 0.3,

					// Minimap
					minimap: {
						enabled: true,
						maxColumn: 80,
						renderCharacters: false,
						showSlider: "mouseover",
					},

					// Editor behavior
					wordWrap: "on",
					automaticLayout: true,
					tabSize: 2,
					insertSpaces: true,
					formatOnPaste: true,
					formatOnType: true,

					// Suggestions
					suggestOnTriggerCharacters: true,
					acceptSuggestionOnEnter: "on",
					quickSuggestions: true,

					// Scrolling
					scrollBeyondLastLine: false,
					smoothScrolling: true,

					// Cursor
					cursorBlinking: "smooth",
					cursorSmoothCaretAnimation: "on",
					cursorWidth: 2,

					// Display
					renderWhitespace: "selection",
					renderLineHighlight: "all",
					bracketPairColorization: { enabled: true },
					guides: {
						bracketPairs: true,
						indentation: true,
						highlightActiveIndentation: true,
					},
					padding: { top: 12, bottom: 12 },

					// Folding
					folding: true,
					foldingHighlight: true,
					showFoldingControls: "mouseover",

					// Matching
					matchBrackets: "always",
					occurrencesHighlight: "singleFile",
					selectionHighlight: true,

					// Features
					codeLens: true,
					inlayHints: { enabled: "on" },
					stickyScroll: { enabled: true },
					mouseWheelZoom: true,
					links: true,
					colorDecorators: true,
				}}
				theme="vs-dark"
				value={content}
			/>
		</div>
	)
}

export { getDisplayLanguage }
