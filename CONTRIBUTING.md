# Contributing to Claude Studio

Thank you for your interest in contributing to Claude Studio!

## Development Setup

### Prerequisites

- Node.js 18+
- npm 9+
- Git

### Getting Started

```bash
# Clone the repository
git clone https://github.com/Galaxy-ZCZ/Claude-Studio.git
cd Claude-Studio

# Install dependencies
npm install

# Start development server
npm run electron:dev
```

## Project Architecture

```
Claude-Studio/
├── electron/              # Electron main process
│   ├── main/             # Main process
│   │   └── index.ts      # Window creation, IPC handlers
│   └── preload/          # Preload scripts
│       └── index.ts      # Secure API bridge
├── src/                  # React frontend
│   ├── components/       # UI components
│   │   ├── editor/       # Monaco Editor
│   │   ├── chat/         # Claude chat panel
│   │   ├── terminal/     # Terminal emulator
│   │   ├── sidebar/      # File explorer, search, git
│   │   ├── settings/     # Settings panel
│   │   └── common/       # TitleBar, StatusBar, CommandPalette
│   ├── store/            # State management (React Context)
│   ├── utils/            # Utilities (Claude API, file system, git)
│   └── styles/           # Global styles
├── package.json          # Project config
├── vite.config.ts        # Vite config
└── tsconfig.json         # TypeScript config
```

## Code Guidelines

### Style

- Use TypeScript strict mode
- Use functional components with hooks
- Use Tailwind CSS for styling
- Keep code clean and well-commented

### Commit Convention

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: fix a bug
docs: documentation update
style: code style change
refactor: code refactoring
test: test related
chore: build/toolchain update
```

### Branch Strategy

- `main` - stable releases
- `develop` - development branch
- `feature/*` - feature branches
- `fix/*` - bug fix branches

## Adding Features

### New Component

1. Create component in `src/components/`
2. Import in the appropriate parent component
3. Add necessary styles

### Claude API Integration

1. API utilities are in `src/utils/claudeAPI.ts`
2. API key is configured in Settings
3. Chat panel handles streaming responses

### File Operations

1. Use `window.electronAPI` for file operations
2. IPC handlers are in `electron/main/index.ts`
3. Preload script exposes secure APIs

## Building

### Windows

```bash
npm run electron:build
```

Output is in the `release/` directory.

### Other Platforms

Modify the `build` config in `package.json`.

## Issues & Feedback

- Use GitHub Issues for bug reports
- Include reproduction steps
- Attach screenshots or logs if applicable

Thank you for contributing! 🎉
