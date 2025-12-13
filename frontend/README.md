# Cline IDE Frontend

A modern, AI-powered code editor frontend built with **Next.js 16** and the App Router.

## Features

- 🚀 Built with Next.js 16 and React 19
- ⚡ Turbopack for blazing-fast development
- 🎨 Tailwind CSS v4 with custom VS Code-like theming
- 📝 Monaco Editor for code editing
- 🖥️ XTerm.js for terminal emulation
- 🤖 AI-powered coding assistant
- 🔄 Real-time collaboration via WebSocket
- 📁 File tree with context menu actions
- 🔍 Command palette for quick navigation

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, Tailwind CSS v4
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Editor**: Monaco Editor
- **Terminal**: XTerm.js
- **Styling**: CSS Variables, Custom VSCode Theme

## Getting Started

### Prerequisites

- Node.js 20.9 or higher
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server with Turbopack
npm run dev
```

### Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:3000
```

### Building for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx         # Root layout with providers
│   │   ├── page.tsx           # Home page (redirects)
│   │   ├── providers.tsx      # React Query provider
│   │   ├── loading.tsx        # Loading UI
│   │   ├── login/             # Login page
│   │   ├── projects/          # Projects list page
│   │   ├── ide/[projectId]/   # IDE page
│   │   └── settings/          # Settings page
│   ├── components/
│   │   ├── auth-guard.tsx     # Authentication wrapper
│   │   └── ide/               # IDE components
│   │       ├── IDELayout.tsx
│   │       ├── ActivityBar.tsx
│   │       ├── AIChat.tsx
│   │       ├── Breadcrumbs.tsx
│   │       ├── CodeEditor.tsx
│   │       ├── CommandPalette.tsx
│   │       ├── EditorTabs.tsx
│   │       ├── FileTree.tsx
│   │       ├── PanelTabs.tsx
│   │       ├── StatusBar.tsx
│   │       └── Terminal.tsx
│   ├── lib/
│   │   ├── api-client.ts      # API client singleton
│   │   ├── utils.ts           # Utility functions
│   │   └── websocket-client.ts # WebSocket client
│   ├── stores/
│   │   └── auth-store.ts      # Zustand auth store
│   └── styles/
│       └── globals.css        # Global styles & theme
├── public/                     # Static assets
├── next.config.ts             # Next.js configuration
├── postcss.config.mjs         # PostCSS configuration
├── tailwind.config.mjs        # Tailwind v4 configuration
└── tsconfig.json              # TypeScript configuration
```

## Docker

```bash
# Build Docker image
docker build -t cline-ide-frontend .

# Run container
docker run -p 3000:3000 cline-ide-frontend
```

## Development

### Key Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Editor Keyboard Shortcuts

- `⌘+P` - Quick open / Command palette
- `⌘+B` - Toggle sidebar
- `⌘+J` - Toggle panel
- `⌘+W` - Close active tab
- `⌘+S` - Save file

## License

MIT
