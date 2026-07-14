import { useEffect, useRef, useCallback, useState } from 'react'
import { useApp } from '../../store/AppContext'

const api = window.electronAPI

export default function Terminal() {
  const { state } = useApp()
  const [history, setHistory] = useState<string[]>([
    '╔═══════════════════════════════════════════╗',
    '║       Claude Studio Terminal v1.0.0       ║',
    '╚═══════════════════════════════════════════╝',
    '',
    'Type "help" for available commands',
    '',
  ])
  const [input, setInput] = useState('')
  const [cmdHistory, setCmdHistory] = useState<string[]>([])
  const [historyIdx, setHistoryIdx] = useState(-1)
  const [cwd, setCwd] = useState(state.workspacePath || '~')
  const terminalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [history])

  // Focus input on click
  const focusInput = () => inputRef.current?.focus()

  const executeCommand = useCallback(async (cmd: string) => {
    const trimmed = cmd.trim()
    if (!trimmed) return

    // Add to command history
    setCmdHistory(prev => [...prev, trimmed])
    setHistoryIdx(-1)

    const prompt = `${cwd} $ `
    setHistory(prev => [...prev, `${prompt}${trimmed}`])

    // Built-in commands
    const parts = trimmed.split(/\s+/)
    const command = parts[0].toLowerCase()
    const args = parts.slice(1)

    switch (command) {
      case 'help':
        setHistory(prev => [...prev,
          'Available commands:',
          '  help          - Show this help',
          '  clear         - Clear terminal',
          '  cd <dir>      - Change directory',
          '  ls / dir      - List files',
          '  pwd           - Print working directory',
          '  cat <file>    - Show file content',
          '  echo <text>   - Print text',
          '  node <args>   - Run Node.js',
          '  npm <args>    - Run npm',
          '  git <args>    - Run git',
          '  version       - Show version',
          '  cls / clear   - Clear screen',
          '',
        ])
        return

      case 'clear':
      case 'cls':
        setHistory([])
        return

      case 'version':
        setHistory(prev => [...prev, 'Claude Studio v1.0.0', ''])
        return

      case 'cd': {
        if (!api) {
          setHistory(prev => [...prev, 'Error: File system not available', ''])
          return
        }
        const target = args[0] || state.workspacePath || '~'
        if (target === '~' || target === '') {
          setCwd(state.workspacePath || '~')
          setHistory(prev => [...prev, ''])
          return
        }
        try {
          const newPath = target.startsWith('/') || target.startsWith('\\') || target.includes(':')
            ? target
            : `${cwd}/${target}`
          const exists = await api.fileExists(newPath)
          if (exists) {
            setCwd(newPath)
            setHistory(prev => [...prev, ''])
          } else {
            setHistory(prev => [...prev, `cd: no such directory: ${target}`, ''])
          }
        } catch {
          setHistory(prev => [...prev, `cd: error: ${target}`, ''])
        }
        return
      }

      case 'ls':
      case 'dir': {
        if (!api) {
          setHistory(prev => [...prev, 'Error: File system not available', ''])
          return
        }
        try {
          const items = await api.readDir(cwd)
          const lines = items.map(item =>
            item.isDirectory ? `📁 ${item.name}/` : `📄 ${item.name}`
          )
          setHistory(prev => [...prev, ...lines, ''])
        } catch (err: any) {
          setHistory(prev => [...prev, `Error: ${err.message}`, ''])
        }
        return
      }

      case 'pwd':
        setHistory(prev => [...prev, cwd, ''])
        return

      case 'cat': {
        if (!args[0]) {
          setHistory(prev => [...prev, 'Usage: cat <file>', ''])
          return
        }
        if (!api) return
        try {
          const filePath = args[0].startsWith('/') ? args[0] : `${cwd}/${args[0]}`
          const content = await api.readFile(filePath)
          setHistory(prev => [...prev, ...content.split('\n'), ''])
        } catch (err: any) {
          setHistory(prev => [...prev, `Error: ${err.message}`, ''])
        }
        return
      }

      case 'echo':
        setHistory(prev => [...prev, args.join(' '), ''])
        return

      default: {
        // Execute as shell command
        if (!api) {
          setHistory(prev => [...prev, `Command not found: ${command}`, ''])
          return
        }
        try {
          const result = await api.execCommand(trimmed, cwd)
          setHistory(prev => [...prev, ...result.split('\n'), ''])
        } catch (err: any) {
          setHistory(prev => [...prev, `Error: ${err.message}`, ''])
        }
      }
    }
  }, [cwd, state.workspacePath])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand(input)
      setInput('')
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (cmdHistory.length > 0) {
        const newIdx = historyIdx < 0 ? cmdHistory.length - 1 : Math.max(0, historyIdx - 1)
        setHistoryIdx(newIdx)
        setInput(cmdHistory[newIdx])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIdx >= 0) {
        const newIdx = historyIdx + 1
        if (newIdx >= cmdHistory.length) {
          setHistoryIdx(-1)
          setInput('')
        } else {
          setHistoryIdx(newIdx)
          setInput(cmdHistory[newIdx])
        }
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault()
      setHistory([])
    }
  }

  return (
    <div className="h-60 flex flex-col border-t border-[#30363d] bg-[#0d1117] shrink-0">
      {/* Header */}
      <div className="panel-header shrink-0">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-[#58a6ff]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M8 21h8M12 17v4" />
          </svg>
          <span className="panel-title">Terminal</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setHistory([])}
            className="btn-icon"
            title="Clear (Ctrl+L)"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M8 6V4h8v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      <div
        ref={terminalRef}
        className="flex-1 overflow-y-auto p-2 font-mono text-xs cursor-text min-h-0"
        onClick={focusInput}
      >
        {history.map((line, idx) => (
          <div key={idx} className="text-[#e6edf3] whitespace-pre-wrap break-all leading-5">
            {line}
          </div>
        ))}
        <div className="flex items-center gap-1.5 leading-5">
          <span className="text-[#3fb950] shrink-0">{cwd === '~' ? '~' : cwd.split(/[/\\]/).pop()}</span>
          <span className="text-[#58a6ff] shrink-0">$</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none text-[#e6edf3] font-mono text-xs min-w-0"
            spellCheck={false}
            autoComplete="off"
          />
        </div>
      </div>
    </div>
  )
}
