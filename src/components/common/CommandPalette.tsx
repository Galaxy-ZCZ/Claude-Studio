import { useState, useEffect, useRef } from 'react'
import { useApp } from '../../store/AppContext'

const api = window.electronAPI

interface Command {
  id: string
  label: string
  shortcut?: string
  action: () => void
  category?: string
}

export default function CommandPalette() {
  const { state, dispatch } = useApp()
  const [query, setQuery] = useState('')
  const [selectedIdx, setSelectedIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const commands: Command[] = [
    {
      id: 'open-file',
      label: 'Open File',
      shortcut: 'Ctrl+O',
      category: 'File',
      action: async () => {
        if (!api) return
        const result = await api.openFileDialog()
        if (result) {
          const { v4: uuid } = await import('uuid')
          const { getLanguage } = await import('../../utils/fileSystem')
          dispatch({
            type: 'OPEN_FILE',
            payload: {
              id: uuid(),
              path: result.path,
              name: result.path.split(/[/\\]/).pop() || 'untitled',
              language: getLanguage(result.path),
              content: result.content,
              modified: false,
            },
          })
        }
        dispatch({ type: 'TOGGLE_COMMAND_PALETTE' })
      },
    },
    {
      id: 'open-folder',
      label: 'Open Folder',
      shortcut: 'Ctrl+Shift+O',
      category: 'File',
      action: async () => {
        if (!api) return
        const folder = await api.openFolderDialog()
        if (folder) {
          const tree = await api.readDir(folder)
          dispatch({ type: 'SET_WORKSPACE', payload: { path: folder, tree } })
        }
        dispatch({ type: 'TOGGLE_COMMAND_PALETTE' })
      },
    },
    {
      id: 'save-file',
      label: 'Save File',
      shortcut: 'Ctrl+S',
      category: 'File',
      action: () => {
        window.dispatchEvent(new CustomEvent('editor-save'))
        dispatch({ type: 'TOGGLE_COMMAND_PALETTE' })
      },
    },
    {
      id: 'toggle-sidebar',
      label: 'Toggle Sidebar',
      shortcut: 'Ctrl+B',
      category: 'View',
      action: () => {
        dispatch({ type: 'TOGGLE_SIDEBAR' })
        dispatch({ type: 'TOGGLE_COMMAND_PALETTE' })
      },
    },
    {
      id: 'toggle-terminal',
      label: 'Toggle Terminal',
      shortcut: 'Ctrl+`',
      category: 'View',
      action: () => {
        dispatch({ type: 'TOGGLE_TERMINAL' })
        dispatch({ type: 'TOGGLE_COMMAND_PALETTE' })
      },
    },
    {
      id: 'new-chat',
      label: 'New Claude Chat',
      category: 'Claude',
      action: () => {
        dispatch({ type: 'CLEAR_MESSAGES' })
        dispatch({ type: 'TOGGLE_COMMAND_PALETTE' })
      },
    },
    {
      id: 'show-files',
      label: 'Show File Explorer',
      category: 'View',
      action: () => {
        dispatch({ type: 'SET_SIDEBAR_VIEW', payload: 'files' })
        dispatch({ type: 'TOGGLE_COMMAND_PALETTE' })
      },
    },
    {
      id: 'show-search',
      label: 'Show Search Panel',
      category: 'View',
      action: () => {
        dispatch({ type: 'SET_SIDEBAR_VIEW', payload: 'search' })
        dispatch({ type: 'TOGGLE_COMMAND_PALETTE' })
      },
    },
    {
      id: 'show-git',
      label: 'Show Git Panel',
      category: 'View',
      action: () => {
        dispatch({ type: 'SET_SIDEBAR_VIEW', payload: 'git' })
        dispatch({ type: 'TOGGLE_COMMAND_PALETTE' })
      },
    },
    {
      id: 'show-settings',
      label: 'Open Settings',
      category: 'Preferences',
      action: () => {
        dispatch({ type: 'SET_SIDEBAR_VIEW', payload: 'settings' })
        dispatch({ type: 'TOGGLE_COMMAND_PALETTE' })
      },
    },
  ]

  const filtered = commands.filter(cmd =>
    cmd.label.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category?.toLowerCase().includes(query.toLowerCase())
  )

  useEffect(() => {
    if (state.commandPaletteOpen) {
      setQuery('')
      setSelectedIdx(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [state.commandPaletteOpen])

  useEffect(() => {
    setSelectedIdx(0)
  }, [query])

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selected = listRef.current.children[selectedIdx] as HTMLElement
      selected?.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIdx])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      dispatch({ type: 'TOGGLE_COMMAND_PALETTE' })
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIdx(prev => Math.min(prev + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIdx(prev => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      filtered[selectedIdx]?.action()
    }
  }

  if (!state.commandPaletteOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      onClick={() => dispatch({ type: 'TOGGLE_COMMAND_PALETTE' })}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Palette */}
      <div
        className="relative w-[500px] bg-[#161b22] border border-[#30363d] rounded-lg shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#30363d]">
          <svg className="w-4 h-4 text-[#484f58]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command..."
            className="flex-1 bg-transparent outline-none text-sm text-[#e6edf3] placeholder-[#484f58]"
          />
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[300px] overflow-y-auto py-1">
          {filtered.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-[#484f58]">
              No commands found
            </div>
          ) : (
            filtered.map((cmd, idx) => (
              <button
                key={cmd.id}
                onClick={cmd.action}
                className={`
                  w-full flex items-center justify-between px-4 py-2 text-sm text-left
                  transition-colors
                  ${idx === selectedIdx ? 'bg-[#30363d]' : 'hover:bg-[#30363d80]'}
                `}
              >
                <div className="flex items-center gap-2">
                  {cmd.category && (
                    <span className="text-[10px] text-[#484f58] bg-[#30363d] px-1.5 py-0.5 rounded">
                      {cmd.category}
                    </span>
                  )}
                  <span className="text-[#e6edf3]">{cmd.label}</span>
                </div>
                {cmd.shortcut && (
                  <kbd className="text-[10px] text-[#484f58] bg-[#0d1117] px-1.5 py-0.5 rounded font-mono">
                    {cmd.shortcut}
                  </kbd>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
