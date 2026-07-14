import { createContext, useContext, useReducer, ReactNode } from 'react'

// ─── Types ───────────────────────────────────────────
export interface FileTab {
  id: string
  path: string
  name: string
  language: string
  content: string
  modified: boolean
}

export interface FileNode {
  name: string
  path: string
  isDirectory: boolean
  children?: FileNode[]
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  codeContext?: string
}

export interface GitStatus {
  branch: string
  ahead: number
  behind: number
  modified: string[]
  staged: string[]
  untracked: string[]
}

export interface AppSettings {
  editor: {
    fontSize: number
    fontFamily: string
    tabSize: number
    wordWrap: 'on' | 'off' | 'wordWrapColumn'
    minimap: boolean
    lineNumbers: boolean
    theme: string
  }
  claude: {
    apiKey: string
    model: string
    maxTokens: number
    systemPrompt: string
  }
  terminal: {
    shell: string
    fontSize: number
  }
  theme: string
}

export interface AppState {
  // Editor
  tabs: FileTab[]
  activeTabId: string | null

  // File explorer
  workspacePath: string | null
  fileTree: FileNode[]
  fileTreeExpanded: Set<string>

  // Chat
  messages: ChatMessage[]
  isStreaming: boolean

  // Terminal
  terminalVisible: boolean

  // Sidebar
  sidebarVisible: boolean
  sidebarView: 'files' | 'search' | 'git' | 'settings'

  // Git
  gitStatus: GitStatus | null

  // Settings
  settings: AppSettings

  // Command palette
  commandPaletteOpen: boolean

  // Status
  statusMessage: string
}

// ─── Actions ─────────────────────────────────────────
type Action =
  | { type: 'OPEN_FILE'; payload: FileTab }
  | { type: 'CLOSE_TAB'; payload: string }
  | { type: 'SET_ACTIVE_TAB'; payload: string | null }
  | { type: 'UPDATE_TAB_CONTENT'; payload: { id: string; content: string } }
  | { type: 'SET_TAB_MODIFIED'; payload: { id: string; modified: boolean } }
  | { type: 'SET_WORKSPACE'; payload: { path: string; tree: FileNode[] } }
  | { type: 'TOGGLE_DIR_EXPAND'; payload: string }
  | { type: 'REFRESH_FILE_TREE'; payload: FileNode[] }
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'UPDATE_LAST_MESSAGE'; payload: string }
  | { type: 'SET_STREAMING'; payload: boolean }
  | { type: 'CLEAR_MESSAGES' }
  | { type: 'TOGGLE_TERMINAL' }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SIDEBAR_VIEW'; payload: AppState['sidebarView'] }
  | { type: 'SET_GIT_STATUS'; payload: GitStatus | null }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'UPDATE_EDITOR_SETTINGS'; payload: Partial<AppSettings['editor']> }
  | { type: 'UPDATE_CLAUDE_SETTINGS'; payload: Partial<AppSettings['claude']> }
  | { type: 'TOGGLE_COMMAND_PALETTE' }
  | { type: 'SET_STATUS'; payload: string }

// ─── Default settings ────────────────────────────────
const defaultSettings: AppSettings = {
  editor: {
    fontSize: 14,
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
    tabSize: 2,
    wordWrap: 'off',
    minimap: true,
    lineNumbers: true,
    theme: 'claude-dark',
  },
  claude: {
    apiKey: '',
    model: 'claude-sonnet-4-20250514',
    maxTokens: 4096,
    systemPrompt: `You are Claude, an AI assistant integrated into Claude Studio IDE.
You help users write, understand, and debug code.
When providing code, use markdown code blocks with language identifiers.
Be concise and helpful.`,
  },
  terminal: {
    shell: process.platform === 'win32' ? 'powershell.exe' : '/bin/bash',
    fontSize: 14,
  },
  theme: 'claude-dark',
}

// ─── Reducer ─────────────────────────────────────────
function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'OPEN_FILE': {
      const existing = state.tabs.find(t => t.path === action.payload.path)
      if (existing) {
        return { ...state, activeTabId: existing.id }
      }
      return {
        ...state,
        tabs: [...state.tabs, action.payload],
        activeTabId: action.payload.id,
      }
    }
    case 'CLOSE_TAB': {
      const newTabs = state.tabs.filter(t => t.id !== action.payload)
      let newActive = state.activeTabId
      if (state.activeTabId === action.payload) {
        const idx = state.tabs.findIndex(t => t.id === action.payload)
        newActive = newTabs.length > 0
          ? newTabs[Math.min(idx, newTabs.length - 1)]?.id ?? null
          : null
      }
      return { ...state, tabs: newTabs, activeTabId: newActive }
    }
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTabId: action.payload }
    case 'UPDATE_TAB_CONTENT':
      return {
        ...state,
        tabs: state.tabs.map(t =>
          t.id === action.payload.id
            ? { ...t, content: action.payload.content, modified: true }
            : t
        ),
      }
    case 'SET_TAB_MODIFIED':
      return {
        ...state,
        tabs: state.tabs.map(t =>
          t.id === action.payload.id
            ? { ...t, modified: action.payload.modified }
            : t
        ),
      }
    case 'SET_WORKSPACE':
      return {
        ...state,
        workspacePath: action.payload.path,
        fileTree: action.payload.tree,
      }
    case 'TOGGLE_DIR_EXPAND': {
      const expanded = new Set(state.fileTreeExpanded)
      if (expanded.has(action.payload)) {
        expanded.delete(action.payload)
      } else {
        expanded.add(action.payload)
      }
      return { ...state, fileTreeExpanded: expanded }
    }
    case 'REFRESH_FILE_TREE':
      return { ...state, fileTree: action.payload }
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] }
    case 'UPDATE_LAST_MESSAGE':
      return {
        ...state,
        messages: state.messages.map((m, i) =>
          i === state.messages.length - 1
            ? { ...m, content: m.content + action.payload }
            : m
        ),
      }
    case 'SET_STREAMING':
      return { ...state, isStreaming: action.payload }
    case 'CLEAR_MESSAGES':
      return { ...state, messages: [] }
    case 'TOGGLE_TERMINAL':
      return { ...state, terminalVisible: !state.terminalVisible }
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarVisible: !state.sidebarVisible }
    case 'SET_SIDEBAR_VIEW':
      return {
        ...state,
        sidebarView: action.payload,
        sidebarVisible: true,
      }
    case 'SET_GIT_STATUS':
      return { ...state, gitStatus: action.payload }
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } }
    case 'UPDATE_EDITOR_SETTINGS':
      return {
        ...state,
        settings: {
          ...state.settings,
          editor: { ...state.settings.editor, ...action.payload },
        },
      }
    case 'UPDATE_CLAUDE_SETTINGS':
      return {
        ...state,
        settings: {
          ...state.settings,
          claude: { ...state.settings.claude, ...action.payload },
        },
      }
    case 'TOGGLE_COMMAND_PALETTE':
      return { ...state, commandPaletteOpen: !state.commandPaletteOpen }
    case 'SET_STATUS':
      return { ...state, statusMessage: action.payload }
    default:
      return state
  }
}

// ─── Context ─────────────────────────────────────────
const AppContext = createContext<{
  state: AppState
  dispatch: React.Dispatch<Action>
} | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    tabs: [],
    activeTabId: null,
    workspacePath: null,
    fileTree: [],
    fileTreeExpanded: new Set<string>(),
    messages: [],
    isStreaming: false,
    terminalVisible: true,
    sidebarVisible: true,
    sidebarView: 'files' as const,
    gitStatus: null,
    settings: defaultSettings,
    commandPaletteOpen: false,
    statusMessage: 'Ready',
  })

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

export { defaultSettings }
