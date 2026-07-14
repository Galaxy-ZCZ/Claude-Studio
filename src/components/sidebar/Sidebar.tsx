import { useApp } from '../../store/AppContext'
import FileExplorer from './FileExplorer'
import SearchPanel from './SearchPanel'
import GitPanel from './GitPanel'
import SettingsPanel from '../settings/SettingsPanel'

export default function Sidebar() {
  const { state, dispatch } = useApp()

  const sidebarItems = [
    {
      id: 'files' as const,
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
        </svg>
      ),
      label: 'Explorer',
    },
    {
      id: 'search' as const,
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
      ),
      label: 'Search',
    },
    {
      id: 'git' as const,
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="18" cy="18" r="3" />
          <circle cx="6" cy="6" r="3" />
          <path d="M13 6h3a2 2 0 012 2v7" />
          <path d="M6 9v12" />
        </svg>
      ),
      label: 'Git',
    },
    {
      id: 'settings' as const,
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
        </svg>
      ),
      label: 'Settings',
    },
  ]

  const renderPanel = () => {
    switch (state.sidebarView) {
      case 'files':
        return <FileExplorer />
      case 'search':
        return <SearchPanel />
      case 'git':
        return <GitPanel />
      case 'settings':
        return <SettingsPanel />
    }
  }

  return (
    <div className="flex shrink-0">
      {/* Activity Bar (icon strip) */}
      <div className="w-12 bg-[#0d1117] border-r border-[#30363d] flex flex-col items-center py-2 gap-1 shrink-0">
        {sidebarItems.map(item => (
          <button
            key={item.id}
            onClick={() => {
              if (state.sidebarView === item.id && state.sidebarVisible) {
                dispatch({ type: 'TOGGLE_SIDEBAR' })
              } else {
                dispatch({ type: 'SET_SIDEBAR_VIEW', payload: item.id })
              }
            }}
            className={`
              w-10 h-10 flex items-center justify-center rounded-md transition-colors
              ${state.sidebarView === item.id && state.sidebarVisible
                ? 'text-[#e6edf3] bg-[#30363d]'
                : 'text-[#484f58] hover:text-[#e6edf3] hover:bg-[#161b22]'
              }
            `}
            title={item.label}
          >
            {item.icon}
          </button>
        ))}
      </div>

      {/* Panel */}
      {state.sidebarVisible && (
        <div className="w-64 bg-[#161b22] border-r border-[#30363d] overflow-hidden shrink-0">
          {renderPanel()}
        </div>
      )}
    </div>
  )
}
