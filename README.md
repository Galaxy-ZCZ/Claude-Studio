# Claude Studio

A powerful visual GUI for Claude Code, inspired by the Codex design style. Built with Electron + React + TypeScript.

## ✨ Features

- 🎨 **Modern Dark UI** - Inspired by Codex / VS Code design language
- 📝 **Monaco Editor** - Full-featured code editor (VS Code engine)
- 🤖 **Claude AI Chat** - Real-time AI assistance with streaming responses
- 🖥️ **Integrated Terminal** - Execute commands without leaving the IDE
- 📁 **File Explorer** - Visual file tree with create/rename/delete
- 🔀 **Git Integration** - View status, stage, commit, view diffs
- 🔍 **Global Search** - Search across your entire project
- ⌨️ **Command Palette** - Quick access to all commands (Ctrl+Shift+P)
- ⚙️ **Customizable Settings** - Editor, API, theme settings
- 💾 **Multi-tab Editor** - Open multiple files with tab management

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm 9+

### Install & Run

```bash
# Clone the repository
git clone https://github.com/Galaxy-ZCZ/Claude-Studio.git
cd Claude-Studio

# Install dependencies
npm install

# Start development
npm run electron:dev
```

### Or use the quick start script (Windows)

```bash
start.bat
```

## 📁 Project Structure

```
Claude-Studio/
├── electron/                  # Electron main process
│   ├── main/index.ts         # Window management, IPC handlers
│   └── preload/index.ts      # Secure API bridge
├── src/
│   ├── components/
│   │   ├── editor/           # Monaco Editor integration
│   │   ├── chat/             # Claude AI chat panel
│   │   ├── terminal/         # Integrated terminal
│   │   ├── sidebar/          # File explorer, search, git
│   │   ├── settings/         # Settings panel
│   │   └── common/           # TitleBar, StatusBar, CommandPalette
│   ├── store/                # Global state management
│   ├── utils/                # Claude API, file system, git
│   └── styles/               # Tailwind CSS
├── package.json
└── vite.config.ts
```

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+N` | New File |
| `Ctrl+O` | Open File |
| `Ctrl+Shift+O` | Open Folder |
| `Ctrl+S` | Save File |
| `Ctrl+Shift+S` | Save As |
| `Ctrl+B` | Toggle Sidebar |
| `Ctrl+`` ` | Toggle Terminal |
| `Ctrl+Shift+P` | Command Palette |
| `Ctrl+W` | Close Tab |

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Editor**: Monaco Editor (VS Code engine)
- **Desktop**: Electron 28
- **Build**: Vite
- **AI**: Claude API (Anthropic)

## 📝 Configuration

### Claude API

1. Open Settings (click the gear icon in the sidebar)
2. Enter your Claude API key
3. Select your preferred model
4. Start chatting!

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📄 License

MIT License - see [LICENSE](LICENSE)
