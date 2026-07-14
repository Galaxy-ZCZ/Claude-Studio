import { useApp } from '../../store/AppContext'
import MonacoEditor from './MonacoEditor'
import { getLanguage } from '../../utils/fileSystem'

export default function CodeEditor() {
  const { state, dispatch } = useApp()
  const activeTab = state.tabs.find(t => t.id === state.activeTabId)

  const handleChange = (content: string) => {
    if (activeTab) {
      dispatch({ type: 'UPDATE_TAB_CONTENT', payload: { id: activeTab.id, content } })
    }
  }

  const handleCloseTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    dispatch({ type: 'CLOSE_TAB', payload: tabId })
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 min-h-0">
      {/* Tab Bar */}
      {state.tabs.length > 0 && (
        <div className="flex items-center bg-[#161b22] border-b border-[#30363d] overflow-x-auto shrink-0">
          <div className="flex items-center min-w-0">
            {state.tabs.map(tab => (
              <div
                key={tab.id}
                onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: tab.id })}
                className={`
                  group flex items-center gap-1.5 px-3 py-2 text-sm cursor-pointer
                  border-r border-[#30363d] whitespace-nowrap min-w-0 max-w-[180px]
                  transition-colors duration-100
                  ${activeTab?.id === tab.id
                    ? 'bg-[#0d1117] text-[#e6edf3] border-b-2 border-b-[#58a6ff]'
                    : 'text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#1c2128]'
                  }
                `}
              >
                <span className="truncate text-xs">{tab.name}</span>
                {tab.modified && (
                  <span className="w-2 h-2 rounded-full bg-[#58a6ff] shrink-0" />
                )}
                <button
                  onClick={(e) => handleCloseTab(tab.id, e)}
                  className="ml-auto opacity-0 group-hover:opacity-100 hover:bg-[#30363d] rounded p-0.5 transition-opacity shrink-0"
                >
                  <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <line x1="2" y1="2" x2="10" y2="10" />
                    <line x1="10" y1="2" x2="2" y2="10" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Editor Area */}
      {activeTab ? (
        <div className="flex-1 min-h-0">
          <MonacoEditor
            key={activeTab.id}
            value={activeTab.content}
            language={activeTab.language || getLanguage(activeTab.name)}
            onChange={handleChange}
            filePath={activeTab.path}
          />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-[#0d1117]">
          <div className="text-center text-[#484f58]">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <p className="text-lg mb-1">Welcome to Claude Studio</p>
            <p className="text-sm">Open a file or folder to get started</p>
            <div className="mt-6 flex flex-col gap-2 text-xs">
              <p><kbd className="bg-[#30363d] px-1.5 py-0.5 rounded">Ctrl+O</kbd> Open File</p>
              <p><kbd className="bg-[#30363d] px-1.5 py-0.5 rounded">Ctrl+K Ctrl+O</kbd> Open Folder</p>
              <p><kbd className="bg-[#30363d] px-1.5 py-0.5 rounded">Ctrl+N</kbd> New File</p>
            </div>
          </div>
        </div>
      )}

      {/* Editor Status */}
      {activeTab && (
        <div className="flex items-center justify-between px-3 py-0.5 bg-[#161b22] border-t border-[#30363d] text-[10px] text-[#484f58] shrink-0">
          <div className="flex items-center gap-3">
            <span>{activeTab.language || getLanguage(activeTab.name)}</span>
            <span>UTF-8</span>
            <span>LF</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Spaces: {state.settings.editor.tabSize}</span>
          </div>
        </div>
      )}
    </div>
  )
}
