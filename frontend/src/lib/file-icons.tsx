/**
 * Centralized File Icon System
 * Single source of truth for file and folder icons
 */
import { type ReactNode } from 'react'

export interface FileIconResult {
  icon: ReactNode
  color: string
}

// Icon definitions
const Icons = {
  folder: (
    <svg fill="currentColor" height="16" viewBox="0 0 16 16" width="16">
      <path d="M1.75 2.5a.25.25 0 0 0-.25.25v10.5c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25V4.75a.25.25 0 0 0-.25-.25H7.5a.75.75 0 0 1-.6-.3L5.7 2.5H1.75Z" />
    </svg>
  ),
  folderOpen: (
    <svg fill="currentColor" height="16" viewBox="0 0 16 16" width="16">
      <path d="M.513 1.513A1.75 1.75 0 0 1 1.75 1h4.5a.75.75 0 0 1 .6.3l1.2 1.6H14.5a.75.75 0 0 1 0 1.5H7.5a.75.75 0 0 1-.6-.3l-1.2-1.6H1.75a.25.25 0 0 0-.25.25v10.5c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25V5.75a.25.25 0 0 0-.25-.25.75.75 0 0 1 0-1.5 1.75 1.75 0 0 1 1.75 1.75v7.5A1.75 1.75 0 0 1 14.25 15H1.75A1.75 1.75 0 0 1 0 13.25V2.75c0-.464.184-.91.513-1.237Z" />
    </svg>
  ),
  file: (
    <svg fill="none" height="16" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 16 16" width="16">
      <path d="M9 1H3.5A1.5 1.5 0 0 0 2 2.5v11A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V5L9 1Z" />
      <path d="M9 1v4h4" />
    </svg>
  ),
  react: (
    <svg fill="currentColor" height="16" viewBox="0 0 16 16" width="16">
      <circle cx="8" cy="8" r="1.5" />
      <ellipse cx="8" cy="8" fill="none" rx="6" ry="2.5" stroke="currentColor" strokeWidth="1" />
      <ellipse cx="8" cy="8" fill="none" rx="6" ry="2.5" stroke="currentColor" strokeWidth="1" transform="rotate(60 8 8)" />
      <ellipse cx="8" cy="8" fill="none" rx="6" ry="2.5" stroke="currentColor" strokeWidth="1" transform="rotate(120 8 8)" />
    </svg>
  ),
  typescript: <span className="text-[10px] font-bold font-mono tracking-tight">TS</span>,
  javascript: <span className="text-[10px] font-bold font-mono tracking-tight">JS</span>,
  python: (
    <svg fill="currentColor" height="16" viewBox="0 0 16 16" width="16">
      <path d="M8 1c-2.5 0-4 1-4 2.5V5h4v.5H4C2.5 5.5 1.5 6.75 1.5 8.5c0 1.75 1 3 2.5 3H5V10c0-1 .75-2 2-2h4c1 0 2-.5 2-1.5V4c0-1.5-1.5-3-4-3H8ZM6 2.5c.25 0 .5.25.5.5s-.25.5-.5.5-.5-.25-.5-.5.25-.5.5-.5Z" />
      <path d="M8 15c2.5 0 4-1 4-2.5V11H8v-.5h4c1.5 0 2.5-1.25 2.5-3 0-1.75-1-3-2.5-3H11v1.5c0 1-.75 2-2 2H5c-1 0-2 .5-2 1.5V12c0 1.5 1.5 3 4 3h1Zm2-.5c-.25 0-.5-.25-.5-.5s.25-.5.5-.5.5.25.5.5-.25.5-.5.5Z" />
    </svg>
  ),
  json: <span className="text-[10px] font-bold font-mono tracking-tight">{'{}'}</span>,
  css: <span className="text-[10px] font-bold font-mono tracking-tight">#</span>,
  html: <span className="text-[10px] font-bold font-mono tracking-tight">&lt;/&gt;</span>,
  markdown: <span className="text-[10px] font-bold font-mono tracking-tight">MD</span>,
  git: (
    <svg fill="currentColor" height="16" viewBox="0 0 16 16" width="16">
      <path d="M15.698 7.287 8.712.302a1.03 1.03 0 0 0-1.457 0L5.632 1.924l1.839 1.839a1.224 1.224 0 0 1 1.55 1.56l1.773 1.773a1.224 1.224 0 1 1-.734.688L8.372 6.096v4.286a1.224 1.224 0 1 1-1.008-.023V6.032a1.224 1.224 0 0 1-.664-1.607L4.873 2.597.302 7.17a1.03 1.03 0 0 0 0 1.457l6.986 6.986a1.03 1.03 0 0 0 1.457 0l6.953-6.953a1.03 1.03 0 0 0 0-1.373Z" />
    </svg>
  ),
  go: <span className="text-[10px] font-bold font-mono tracking-tight">GO</span>,
  rust: <span className="text-[10px] font-bold font-mono tracking-tight">RS</span>,
  shell: <span className="text-[10px] font-bold font-mono tracking-tight">$</span>,
  yaml: <span className="text-[10px] font-bold font-mono tracking-tight">YML</span>,
  sql: <span className="text-[10px] font-bold font-mono tracking-tight">SQL</span>,
  docker: (
    <svg fill="currentColor" height="16" viewBox="0 0 16 16" width="16">
      <path d="M9.5 5h1.5v1.5H9.5V5ZM7.5 5H9v1.5H7.5V5ZM5.5 5H7v1.5H5.5V5ZM7.5 3.5H9V5H7.5V3.5ZM5.5 3.5H7V5H5.5V3.5ZM3.5 5H5v1.5H3.5V5ZM5.5 6.5H7V8H5.5V6.5ZM7.5 6.5H9V8H7.5V6.5ZM15 8c-.5-.25-1-.375-1.5-.375-.125-.625-.5-1.125-1-1.5l-.25-.125-.125.25c-.25.375-.375.875-.375 1.375 0 .375.125.75.25 1.125-1.75-.875-2.25 0-6.5 0C5.25 10.5 6 12 6 13c0 1.125.875 3 5 3 4 0 7-2.5 7-7 1 .125 1.625-.75 1.625-.75L15.5 8.5 15 8Z" />
    </svg>
  ),
  env: <span className="text-[10px] font-bold font-mono tracking-tight">ENV</span>,
  lock: (
    <svg fill="none" height="16" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 16 16" width="16">
      <rect height="8" rx="1.5" width="10" x="3" y="6" />
      <path d="M5.5 6V4a2.5 2.5 0 0 1 5 0v2" />
    </svg>
  ),
  config: (
    <svg fill="none" height="16" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 16 16" width="16">
      <circle cx="8" cy="8" r="2" />
      <path d="M8 1v2M8 13v2M1 8h2M13 8h2M2.93 2.93l1.41 1.41M11.66 11.66l1.41 1.41M2.93 13.07l1.41-1.41M11.66 4.34l1.41-1.41" />
    </svg>
  ),
}

// Color mappings for file types
const FILE_COLORS = {
  folder: '#e8ab53',
  folderOpen: '#dcb67a',
  typescript: '#3178c6',
  javascript: '#f0db4f',
  react: '#61dafb',
  python: '#3776ab',
  json: '#cbcb41',
  css: '#42a5f5',
  html: '#e34c26',
  markdown: '#519aba',
  git: '#f05032',
  go: '#00add8',
  rust: '#dea584',
  shell: '#89e051',
  yaml: '#cb171e',
  sql: '#e38c00',
  docker: '#2496ed',
  env: '#ecd53f',
  lock: '#8b949e',
  config: '#8b949e',
  default: '#8b949e',
} as const

// Extension to icon type mapping
const EXTENSION_MAP: Record<string, keyof typeof Icons | string> = {
  ts: 'typescript',
  tsx: 'react',
  js: 'javascript',
  jsx: 'react',
  mjs: 'javascript',
  cjs: 'javascript',
  py: 'python',
  pyw: 'python',
  json: 'json',
  css: 'css',
  scss: 'css',
  sass: 'css',
  less: 'css',
  html: 'html',
  htm: 'html',
  md: 'markdown',
  mdx: 'markdown',
  go: 'go',
  rs: 'rust',
  sh: 'shell',
  bash: 'shell',
  zsh: 'shell',
  yaml: 'yaml',
  yml: 'yaml',
  sql: 'sql',
  dockerfile: 'docker',
  env: 'env',
}

// Special filename mappings
const FILENAME_MAP: Record<string, { icon: keyof typeof Icons; color: string }> = {
  'package.json': { icon: 'json', color: '#89d185' },
  'package-lock.json': { icon: 'lock', color: FILE_COLORS.lock },
  'yarn.lock': { icon: 'lock', color: FILE_COLORS.lock },
  'pnpm-lock.yaml': { icon: 'lock', color: FILE_COLORS.lock },
  'tsconfig.json': { icon: 'json', color: FILE_COLORS.typescript },
  'jsconfig.json': { icon: 'json', color: FILE_COLORS.javascript },
  '.gitignore': { icon: 'git', color: FILE_COLORS.git },
  '.gitattributes': { icon: 'git', color: FILE_COLORS.git },
  '.gitmodules': { icon: 'git', color: FILE_COLORS.git },
  'dockerfile': { icon: 'docker', color: FILE_COLORS.docker },
  'docker-compose.yml': { icon: 'docker', color: FILE_COLORS.docker },
  'docker-compose.yaml': { icon: 'docker', color: FILE_COLORS.docker },
  '.env': { icon: 'env', color: FILE_COLORS.env },
  '.env.local': { icon: 'env', color: FILE_COLORS.env },
  '.env.development': { icon: 'env', color: FILE_COLORS.env },
  '.env.production': { icon: 'env', color: FILE_COLORS.env },
  'tailwind.config.js': { icon: 'config', color: '#38bdf8' },
  'tailwind.config.ts': { icon: 'config', color: '#38bdf8' },
  'tailwind.config.mjs': { icon: 'config', color: '#38bdf8' },
  'vite.config.ts': { icon: 'config', color: '#646cff' },
  'vite.config.js': { icon: 'config', color: '#646cff' },
  'next.config.js': { icon: 'config', color: '#000000' },
  'next.config.ts': { icon: 'config', color: '#000000' },
  'next.config.mjs': { icon: 'config', color: '#000000' },
  'readme.md': { icon: 'markdown', color: FILE_COLORS.markdown },
  'license': { icon: 'file', color: FILE_COLORS.default },
  'license.md': { icon: 'markdown', color: FILE_COLORS.markdown },
}

/**
 * Get file icon and color based on filename and type
 */
export function getFileIcon(
  filename: string,
  isDirectory: boolean,
  isOpen = false
): FileIconResult {
  // Handle directories
  if (isDirectory) {
    return {
      icon: isOpen ? Icons.folderOpen : Icons.folder,
      color: isOpen ? FILE_COLORS.folderOpen : FILE_COLORS.folder,
    }
  }

  const lowerName = filename.toLowerCase()

  // Check special filenames first
  const specialFile = FILENAME_MAP[lowerName]
  if (specialFile) {
    const iconKey = specialFile.icon as keyof typeof Icons
    return {
      icon: Icons[iconKey] || Icons.file,
      color: specialFile.color,
    }
  }

  // Check extension
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  const iconType = EXTENSION_MAP[ext]

  if (iconType) {
    const iconKey = iconType as keyof typeof Icons
    return {
      icon: Icons[iconKey] || Icons.file,
      color: FILE_COLORS[iconKey as keyof typeof FILE_COLORS] || FILE_COLORS.default,
    }
  }

  // Default file icon
  return {
    icon: Icons.file,
    color: FILE_COLORS.default,
  }
}

/**
 * Get language from file path
 */
export function getLanguageFromPath(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase() || ''
  const languageMap: Record<string, string> = {
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
  return languageMap[ext] || 'plaintext'
}

/**
 * Get display name for language
 */
export function getDisplayLanguage(language: string): string {
  const displayMap: Record<string, string> = {
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
  return displayMap[language] || language.charAt(0).toUpperCase() + language.slice(1)
}

