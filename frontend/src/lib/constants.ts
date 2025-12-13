/**
 * Design System Constants
 * Centralized configuration for the IDE theme and layout
 */

// Layout dimensions
export const LAYOUT = {
  ACTIVITY_BAR_WIDTH: 48,
  SIDEBAR_WIDTH: 260,
  SIDEBAR_MIN_WIDTH: 170,
  SIDEBAR_MAX_WIDTH: 500,
  PANEL_HEIGHT: 280,
  PANEL_MIN_HEIGHT: 100,
  STATUS_BAR_HEIGHT: 22,
  TITLE_BAR_HEIGHT: 35,
  TAB_HEIGHT: 35,
  BREADCRUMB_HEIGHT: 22,
} as const

// Keyboard shortcuts
export const SHORTCUTS = {
  COMMAND_PALETTE: { key: 'p', modifiers: ['meta'] },
  COMMAND_PALETTE_COMMANDS: { key: 'p', modifiers: ['meta', 'shift'] },
  TOGGLE_SIDEBAR: { key: 'b', modifiers: ['meta'] },
  TOGGLE_PANEL: { key: 'j', modifiers: ['meta'] },
  CLOSE_TAB: { key: 'w', modifiers: ['meta'] },
  SAVE_FILE: { key: 's', modifiers: ['meta'] },
  NEW_FILE: { key: 'n', modifiers: ['meta'] },
  GO_TO_FILE: { key: 'p', modifiers: ['meta'] },
  FIND_IN_FILES: { key: 'f', modifiers: ['meta', 'shift'] },
} as const

// File extension to language mapping
export const LANGUAGE_MAP: Record<string, string> = {
  ts: 'typescript',
  tsx: 'typescript',
  js: 'javascript',
  jsx: 'javascript',
  py: 'python',
  java: 'java',
  cpp: 'cpp',
  c: 'c',
  go: 'go',
  rs: 'rust',
  rb: 'ruby',
  php: 'php',
  html: 'html',
  css: 'css',
  scss: 'scss',
  less: 'less',
  json: 'json',
  md: 'markdown',
  yaml: 'yaml',
  yml: 'yaml',
  sh: 'shell',
  bash: 'shell',
  sql: 'sql',
  xml: 'xml',
  graphql: 'graphql',
  dockerfile: 'dockerfile',
}

// Display language names
export const LANGUAGE_DISPLAY: Record<string, string> = {
  typescript: 'TypeScript',
  javascript: 'JavaScript',
  python: 'Python',
  java: 'Java',
  cpp: 'C++',
  c: 'C',
  go: 'Go',
  rust: 'Rust',
  ruby: 'Ruby',
  php: 'PHP',
  html: 'HTML',
  css: 'CSS',
  scss: 'SCSS',
  less: 'Less',
  json: 'JSON',
  markdown: 'Markdown',
  yaml: 'YAML',
  shell: 'Shell Script',
  sql: 'SQL',
  xml: 'XML',
  graphql: 'GraphQL',
  dockerfile: 'Dockerfile',
  plaintext: 'Plain Text',
}

// Terminal theme (VSCode Dark+)
export const TERMINAL_THEME = {
  background: '#0d1117',
  foreground: '#c9d1d9',
  cursor: '#58a6ff',
  cursorAccent: '#0d1117',
  selectionBackground: '#388bfd33',
  selectionForeground: '#ffffff',
  black: '#484f58',
  red: '#ff7b72',
  green: '#3fb950',
  yellow: '#d29922',
  blue: '#58a6ff',
  magenta: '#bc8cff',
  cyan: '#39c5cf',
  white: '#b1bac4',
  brightBlack: '#6e7681',
  brightRed: '#ffa198',
  brightGreen: '#56d364',
  brightYellow: '#e3b341',
  brightBlue: '#79c0ff',
  brightMagenta: '#d2a8ff',
  brightCyan: '#56d4dd',
  brightWhite: '#f0f6fc',
} as const

// Editor theme colors (VSCode Dark+ inspired)
export const EDITOR_THEME = {
  background: '#0d1117',
  foreground: '#c9d1d9',
  lineHighlight: '#161b22',
  selection: '#388bfd33',
  inactiveSelection: '#388bfd1a',
  cursor: '#58a6ff',
  lineNumber: '#6e7681',
  lineNumberActive: '#c9d1d9',
  gutter: '#0d1117',
  minimap: '#0d1117',
  findMatch: '#f2cc6044',
  findMatchHighlight: '#f2cc6022',
  bracket: '#8b949e',
  indentGuide: '#21262d',
  indentGuideActive: '#30363d',
} as const

// Syntax highlighting colors
export const SYNTAX_COLORS = {
  comment: '#8b949e',
  keyword: '#ff7b72',
  string: '#a5d6ff',
  number: '#79c0ff',
  type: '#7ee787',
  function: '#d2a8ff',
  variable: '#c9d1d9',
  constant: '#79c0ff',
  class: '#ffa657',
  parameter: '#ffa657',
  property: '#79c0ff',
  punctuation: '#8b949e',
  operator: '#ff7b72',
  tag: '#7ee787',
  attribute: '#79c0ff',
  regexp: '#7ee787',
} as const

