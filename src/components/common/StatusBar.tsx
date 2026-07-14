import { useApp } from '../../store/AppContext'

const api = window.electronAPI

export default function StatusBar() {
  const { state, dispatch } = useApp()
  const activeTab = state.tabs.find(t => t.id === state.activeTabId)

  const handleSave = async () => {
    if (!activeTab || !api) return
    try {
      await api.writeFile(activeTab.path, activeTab.content)
      dispatch({ type: 'SET_TAB_MODIFIED', payload: { id: activeTab.id, modified: false } })
      dispatch({ type: 'SET_STATUS', payload: `Saved: ${activeTab.name}` })
    } catch (err) {
      dispatch({ type: 'SET_STATUS', payload: `Save failed: ${err}` })
    }
  }

  // Listen for save shortcut
  if (typeof window !== 'undefined') {
    window.addEventListener('editor-save', handleSave)
  }

  return (
    <div className="h-6 flex items-center justify-between px-3 bg-[#161b22] border-t border-[#30363d] text-[10px] text-[#484f58] shrink-0">
      {/* Left */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${state.settings.claude.apiKey ? 'bg-[#3fb950]' : 'bg-[#d29922]'}`} />
          <span>{state.settings.claude.apiKey ? 'Claude Ready' : 'No API Key'}</span>
        </div>
        {state.gitStatus && (
          <>
            <span>🔀 {state.gitStatus.branch}</span>
            {state.gitStatus.modified.length > 0 && (
              <span className="text-[#d29922]">M{state.gitStatus.modified.length}</span>
            )}
          </>
        )}
      </div>

      {/* Center */}
      <div className="flex items-center gap-1">
        <span>{state.statusMessage}</span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        {activeTab && (
          <>
            <span>{activeTab.language}</span>
            <span>UTF-8</span>
            <span>LF</span>
            <span>Spaces: {state.settings.editor.tabSize}</span>
          </>
        )}
        {state.workspacePath && (
          <span className="max-w-[200px] truncate">{state.workspacePath.split(/[/\\]/).pop()}</span>
        )}
      </div>
    </div>
  )
}
