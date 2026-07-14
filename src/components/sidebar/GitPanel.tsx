import { useState, useEffect, useCallback } from 'react'
import { useApp } from '../../store/AppContext'

const api = window.electronAPI

export default function GitPanel() {
  const { state, dispatch } = useApp()
  const [commitMsg, setCommitMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [log, setLog] = useState<string[]>([])

  const refreshStatus = useCallback(async () => {
    if (!api || !state.workspacePath) return
    setLoading(true)
    try {
      const status = await api.gitStatus(state.workspacePath)
      dispatch({ type: 'SET_GIT_STATUS', payload: status })

      const logLines = await api.gitLog(state.workspacePath, 10)
      setLog(logLines)
    } catch (err) {
      console.error('Git status error:', err)
    }
    setLoading(false)
  }, [state.workspacePath, dispatch])

  useEffect(() => {
    refreshStatus()
    const interval = setInterval(refreshStatus, 30000)
    return () => clearInterval(interval)
  }, [refreshStatus])

  const handleStageAll = async () => {
    if (!api || !state.workspacePath) return
    await api.gitStageAll(state.workspacePath)
    refreshStatus()
  }

  const handleStage = async (file: string) => {
    if (!api || !state.workspacePath) return
    await api.gitStage(state.workspacePath, file)
    refreshStatus()
  }

  const handleUnstage = async (file: string) => {
    if (!api || !state.workspacePath) return
    await api.gitUnstage(state.workspacePath, file)
    refreshStatus()
  }

  const handleCommit = async () => {
    if (!api || !state.workspacePath || !commitMsg.trim()) return
    try {
      await api.gitCommit(state.workspacePath, commitMsg)
      setCommitMsg('')
      dispatch({ type: 'SET_STATUS', payload: 'Changes committed' })
      refreshStatus()
    } catch (err: any) {
      dispatch({ type: 'SET_STATUS', payload: `Commit failed: ${err.message}` })
    }
  }

  const gs = state.gitStatus

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#30363d]">
        <span className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">
          Source Control
        </span>
        <div className="flex items-center gap-1">
          <button onClick={refreshStatus} className="btn-icon" title="Refresh">
            <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 2v6h-6M3 12a9 9 0 0115.36-6.36L21 8M3 22v-6h6M21 12a9 9 0 01-15.36 6.36L3 16" />
            </svg>
          </button>
        </div>
      </div>

      {!gs ? (
        <div className="flex-1 flex items-center justify-center text-[#484f58] text-xs">
          <p>Not a git repository</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto min-h-0">
          {/* Branch info */}
          <div className="px-3 py-2 border-b border-[#30363d] text-xs">
            <div className="flex items-center gap-2 text-[#e6edf3]">
              <span>🔀</span>
              <span className="font-medium">{gs.branch}</span>
              {gs.ahead > 0 && <span className="text-[#3fb950]">↑{gs.ahead}</span>}
              {gs.behind > 0 && <span className="text-[#f85149]">↓{gs.behind}</span>}
            </div>
          </div>

          {/* Commit input */}
          <div className="px-3 py-2 border-b border-[#30363d]">
            <div className="flex gap-2">
              <input
                value={commitMsg}
                onChange={e => setCommitMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCommit()}
                placeholder="Commit message..."
                className="input-field text-xs py-1.5 flex-1"
              />
              <button
                onClick={handleCommit}
                disabled={!commitMsg.trim() || gs.staged.length === 0}
                className="btn-primary text-xs py-1 px-2 disabled:opacity-50"
              >
                ✓
              </button>
            </div>
          </div>

          {/* Staged changes */}
          {gs.staged.length > 0 && (
            <div className="border-b border-[#30363d]">
              <div className="flex items-center justify-between px-3 py-1.5 text-xs">
                <span className="text-[#8b949e] font-medium">Staged Changes ({gs.staged.length})</span>
                <button onClick={handleStageAll} className="text-[#58a6ff] hover:underline text-[10px]">
                  Unstage All
                </button>
              </div>
              {gs.staged.map(file => (
                <div
                  key={file}
                  className="flex items-center justify-between px-4 py-1 text-xs hover:bg-[#30363d40] group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[#3fb950]">A</span>
                    <span className="truncate text-[#e6edf3]">{file}</span>
                  </div>
                  <button
                    onClick={() => handleUnstage(file)}
                    className="opacity-0 group-hover:opacity-100 text-[#f85149] text-[10px]"
                  >
                    −
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Modified / Untracked */}
          {(gs.modified.length > 0 || gs.untracked.length > 0) && (
            <div className="border-b border-[#30363d]">
              <div className="flex items-center justify-between px-3 py-1.5 text-xs">
                <span className="text-[#8b949e] font-medium">
                  Changes ({gs.modified.length + gs.untracked.length})
                </span>
                <button onClick={handleStageAll} className="text-[#58a6ff] hover:underline text-[10px]">
                  Stage All
                </button>
              </div>
              {gs.modified.map(file => (
                <div
                  key={file}
                  className="flex items-center justify-between px-4 py-1 text-xs hover:bg-[#30363d40] group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[#d29922]">M</span>
                    <span className="truncate text-[#e6edf3]">{file}</span>
                  </div>
                  <button
                    onClick={() => handleStage(file)}
                    className="opacity-0 group-hover:opacity-100 text-[#3fb950] text-[10px]"
                  >
                    +
                  </button>
                </div>
              ))}
              {gs.untracked.map(file => (
                <div
                  key={file}
                  className="flex items-center justify-between px-4 py-1 text-xs hover:bg-[#30363d40] group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[#8b949e]">U</span>
                    <span className="truncate text-[#e6edf3]">{file}</span>
                  </div>
                  <button
                    onClick={() => handleStage(file)}
                    className="opacity-0 group-hover:opacity-100 text-[#3fb950] text-[10px]"
                  >
                    +
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Recent commits */}
          {log.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-xs text-[#8b949e] font-medium border-b border-[#30363d]">
                Recent Commits
              </div>
              {log.map((line, idx) => {
                const [hash, msg, author, time] = line.split('|')
                return (
                  <div key={idx} className="px-3 py-1.5 text-xs hover:bg-[#30363d40] border-b border-[#30363d40]">
                    <div className="flex items-center gap-2">
                      <span className="text-[#58a6ff] font-mono">{hash}</span>
                      <span className="truncate text-[#e6edf3]">{msg}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[#484f58]">
                      <span>{author}</span>
                      <span>{time}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
