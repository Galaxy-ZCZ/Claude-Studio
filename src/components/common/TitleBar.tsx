import { useApp } from '../../store/AppContext'

export default function TitleBar() {
  const { dispatch } = useApp()

  return (
    <div className="h-9 bg-[#0d1117] flex items-center justify-between px-3 select-none shrink-0 drag-region border-b border-[#30363d]">
      {/* Left */}
      <div className="flex items-center gap-3 no-drag">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-[#58a6ff]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          <span className="text-sm font-semibold text-[#e6edf3]">Claude Studio</span>
        </div>

        {/* Menu items */}
        <div className="flex items-center gap-0.5">
          {['File', 'Edit', 'View', 'Terminal', 'Help'].map(menu => (
            <button
              key={menu}
              className="px-2 py-1 text-xs text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#30363d] rounded transition-colors"
            >
              {menu}
            </button>
          ))}
        </div>
      </div>

      {/* Center - Command palette trigger */}
      <button
        onClick={() => dispatch({ type: 'TOGGLE_COMMAND_PALETTE' })}
        className="flex items-center gap-2 px-3 py-1 bg-[#161b22] border border-[#30363d] rounded-md text-xs text-[#484f58] hover:border-[#484f58] transition-colors no-drag max-w-[400px]"
      >
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <span>Search or run a command...</span>
        <kbd className="ml-auto text-[10px] bg-[#0d1117] px-1 py-0.5 rounded">Ctrl+Shift+P</kbd>
      </button>

      {/* Right - Window controls */}
      <div className="flex items-center gap-1 no-drag">
        <button
          className="p-1.5 hover:bg-[#30363d] rounded transition-colors"
          onClick={() => window.electronAPI?.minimize()}
        >
          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="2" y1="6" x2="10" y2="6" />
          </svg>
        </button>
        <button
          className="p-1.5 hover:bg-[#30363d] rounded transition-colors"
          onClick={() => window.electronAPI?.maximize()}
        >
          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="2" y="2" width="8" height="8" rx="1" />
          </svg>
        </button>
        <button
          className="p-1.5 hover:bg-[#da3633] rounded transition-colors"
          onClick={() => window.electronAPI?.close()}
        >
          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="2" y1="2" x2="10" y2="10" />
            <line x1="10" y1="2" x2="2" y2="10" />
          </svg>
        </button>
      </div>
    </div>
  )
}
