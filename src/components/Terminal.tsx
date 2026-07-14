import { useState, useRef, useEffect } from 'react'

interface TerminalProps {
  active: boolean
  onSwitch: () => void
}

const Terminal = ({ active, onSwitch }: TerminalProps) => {
  const [history, setHistory] = useState<string[]>([
    'Claude Studio Terminal v1.0.0',
    'Type "help" for available commands',
    ''
  ])
  const [input, setInput] = useState('')
  const terminalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [history])

  const handleCommand = (cmd: string) => {
    const newHistory = [...history, `$ ${cmd}`]

    switch (cmd.toLowerCase()) {
      case 'help':
        newHistory.push(
          'Available commands:',
          '  help     - Show this help',
          '  clear    - Clear terminal',
          '  version  - Show version',
          '  status   - Show system status',
          ''
        )
        break
      case 'clear':
        setHistory([])
        setInput('')
        return
      case 'version':
        newHistory.push('Claude Studio v1.0.0', '')
        break
      case 'status':
        newHistory.push('System Status:', '  Editor: Active', '  Claude: Ready', '  Memory: 128MB', '')
        break
      default:
        newHistory.push(`Command not found: ${cmd}`, '')
    }

    setHistory(newHistory)
    setInput('')
  }

  return (
    <div className={`h-64 flex flex-col border-t border-[#30363d] ${active ? 'flex' : 'hidden'}`}>
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-[#58a6ff]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M8 21h8M12 17v4" />
          </svg>
          <span className="panel-title">Terminal</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="btn-icon" title="新建终端">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
          <button className="btn-icon" title="清空">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M8 6V4h8v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
            </svg>
          </button>
        </div>
      </div>

      <div ref={terminalRef} className="flex-1 overflow-y-auto p-3 font-mono text-sm bg-[#0d1117]">
        {history.map((line, idx) => (
          <div key={idx} className="text-[#e6edf3]">
            {line}
          </div>
        ))}
        <div className="flex items-center gap-2">
          <span className="text-[#238636]">$</span>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCommand(input)}
            className="flex-1 bg-transparent outline-none text-[#e6edf3]"
            autoFocus
          />
        </div>
      </div>
    </div>
  )
}

export default Terminal
