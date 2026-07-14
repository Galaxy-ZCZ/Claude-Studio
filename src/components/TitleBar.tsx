const TitleBar = () => {
  return (
    <div className="h-8 bg-[#0d1117] flex items-center justify-between px-4 select-none drag-region">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4 text-[#58a6ff]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          <span className="text-sm font-semibold text-[#e6edf3]">Claude Studio</span>
        </div>
        <span className="text-xs text-[#484f58]">v1.0.0</span>
      </div>

      <div className="flex items-center gap-1 no-drag">
        <button className="p-1.5 hover:bg-[#30363d] rounded transition-colors" onClick={() => window.electronAPI?.minimize()}>
          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="2" y1="6" x2="10" y2="6" />
          </svg>
        </button>
        <button className="p-1.5 hover:bg-[#30363d] rounded transition-colors" onClick={() => window.electronAPI?.maximize()}>
          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="2" y="2" width="8" height="8" rx="1" />
          </svg>
        </button>
        <button className="p-1.5 hover:bg-[#da3633] rounded transition-colors" onClick={() => window.electronAPI?.close()}>
          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="2" y1="2" x2="10" y2="10" />
            <line x1="10" y1="2" x2="2" y2="10" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default TitleBar
