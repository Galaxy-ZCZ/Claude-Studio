import { useState, useCallback } from 'react'
import { useApp } from '../../store/AppContext'

const api = window.electronAPI

export default function SearchPanel() {
  const { state, dispatch } = useApp()
  const [query, setQuery] = useState('')
  const [replaceValue, setReplaceValue] = useState('')
  const [showReplace, setShowReplace] = useState(false)
  const [results, setResults] = useState<Array<{ file: string; line: number; text: string }>>([])
  const [searching, setSearching] = useState(false)

  const handleSearch = useCallback(async () => {
    if (!query.trim() || !api || !state.workspacePath) return

    setSearching(true)
    setResults([])

    try {
      const output = await api.execCommand(
        `grep -rn "${query.replace(/"/g, '\\"')}" --include="*" . | head -50`,
        state.workspacePath
      )

      const matches = output.split('\n').filter(Boolean).map(line => {
        const match = line.match(/^\.?\/?(.+):(\d+):(.*)$/)
        if (match) {
          return { file: match[1], line: parseInt(match[2]), text: match[3].trim() }
        }
        return null
      }).filter(Boolean) as Array<{ file: string; line: number; text: string }>

      setResults(matches)
    } catch {
      // grep might fail if no matches or not installed
      setResults([])
    }

    setSearching(false)
  }, [query, state.workspacePath])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  const openResult = async (result: { file: string; line: number }) => {
    if (!api || !state.workspacePath) return
    const fullPath = `${state.workspacePath}/${result.file}`
    const existing = state.tabs.find(t => t.path === fullPath)
    if (existing) {
      dispatch({ type: 'SET_ACTIVE_TAB', payload: existing.id })
    } else {
      const content = await api.readFile(fullPath)
      const { v4: uuid } = await import('uuid')
      const { getLanguage } = await import('../../utils/fileSystem')
      dispatch({
        type: 'OPEN_FILE',
        payload: {
          id: uuid(),
          path: fullPath,
          name: result.file.split('/').pop() || result.file,
          language: getLanguage(result.file),
          content,
          modified: false,
        },
      })
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#30363d]">
        <span className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">
          Search
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowReplace(!showReplace)}
            className={`btn-icon ${showReplace ? 'bg-[#30363d]' : ''}`}
            title="Toggle Replace"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Search input */}
      <div className="px-3 py-2 space-y-2 border-b border-[#30363d]">
        <div className="flex gap-1">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search..."
            className="input-field text-xs py-1.5 flex-1"
          />
          <button
            onClick={handleSearch}
            disabled={!query.trim()}
            className="btn-primary text-xs py-1 px-2 disabled:opacity-50"
          >
            {searching ? '...' : '🔍'}
          </button>
        </div>

        {showReplace && (
          <div className="flex gap-1">
            <input
              value={replaceValue}
              onChange={e => setReplaceValue(e.target.value)}
              placeholder="Replace..."
              className="input-field text-xs py-1.5 flex-1"
            />
            <button className="btn-primary text-xs py-1 px-2">
              All
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {results.length > 0 && (
          <div className="px-3 py-1.5 text-xs text-[#8b949e]">
            {results.length} results
          </div>
        )}
        {results.map((result, idx) => (
          <div
            key={idx}
            onClick={() => openResult(result)}
            className="px-3 py-1.5 text-xs hover:bg-[#30363d80] cursor-pointer border-b border-[#30363d40]"
          >
            <div className="flex items-center gap-2">
              <span className="text-[#58a6ff] truncate">{result.file}</span>
              <span className="text-[#484f58]">:{result.line}</span>
            </div>
            <div className="mt-0.5 text-[#e6edf3] truncate font-mono text-[10px]">
              {result.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
