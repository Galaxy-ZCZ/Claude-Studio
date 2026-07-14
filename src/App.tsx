import { useEffect, useCallback } from 'react'
import { useApp } from './store/AppContext'
import TitleBar from './components/common/TitleBar'
import Sidebar from './components/sidebar/Sidebar'
import CodeEditor from './components/editor/CodeEditor'
import ChatPanel from './components/chat/ChatPanel'
import Terminal from './components/terminal/Terminal'
import StatusBar from './components/common/StatusBar'
import CommandPalette from './components/common/CommandPalette'

const api = window.electronAPI

function AppContent() {
  const { state, dispatch } = useApp()

  // Save file handler
  const handleSave = useCallback(async () => {
    const activeTab = state.tabs.find(t => t.id === state.activeTabId)
    if (!activeTab || !api) return

    try {
      await api.writeFile(activeTab.path, activeTab.content)
      dispatch({ type: 'SET_TAB_MODIFIED', payload: { id: activeTab.id, modified: false } })
      dispatch({ type: 'SET_STATUS', payload: `Saved: ${activeTab.name}` })
    } catch (err) {
      dispatch({ type: 'SET_STATUS', payload: `Save failed: ${err}` })
    }
  }, [state.tabs, state.activeTabId, dispatch])

  // Save As handler
  const handleSaveAs = useCallback(async () => {
    const activeTab = state.tabs.find(t => t.id === state.activeTabId)
    if (!activeTab || !api) return

    const path = await api.saveFileDialog(activeTab.path)
    if (!path) return

    await api.writeFile(path, activeTab.content)
    dispatch({ type: 'SET_STATUS', payload: `Saved: ${path}` })
  }, [state.tabs, state.activeTabId, dispatch])

  // New file handler
  const handleNewFile = useCallback(() => {
    const { v4: uuid } = require('uuid')
    dispatch({
      type: 'OPEN_FILE',
      payload: {
        id: uuid(),
        path: `untitled-${Date.now()}`,
        name: 'untitled',
        language: 'plaintext',
        content: '',
        modified: true,
      },
    })
  }, [dispatch])

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey

      if (ctrl && e.key === 's' && !e.shiftKey) {
        e.preventDefault()
        handleSave()
      }

      if (ctrl && e.key === 's' && e.shiftKey) {
        e.preventDefault()
        handleSaveAs()
      }

      if (ctrl && e.key === 'n') {
        e.preventDefault()
        handleNewFile()
      }

      if (ctrl && e.key === 'b') {
        e.preventDefault()
        dispatch({ type: 'TOGGLE_SIDEBAR' })
      }

      if (ctrl && e.key === '`') {
        e.preventDefault()
        dispatch({ type: 'TOGGLE_TERMINAL' })
      }

      if (ctrl && e.shiftKey && e.key === 'P') {
        e.preventDefault()
        dispatch({ type: 'TOGGLE_COMMAND_PALETTE' })
      }

      if (ctrl && e.key === 'p' && !e.shiftKey) {
        e.preventDefault()
        dispatch({ type: 'TOGGLE_COMMAND_PALETTE' })
      }

      // Close active tab with Ctrl+W
      if (ctrl && e.key === 'w') {
        e.preventDefault()
        if (state.activeTabId) {
          dispatch({ type: 'CLOSE_TAB', payload: state.activeTabId })
        }
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleSave, handleSaveAs, handleNewFile, state.activeTabId, dispatch])

  return (
    <div className="flex flex-col h-screen bg-[#0d1117] text-[#e6edf3] overflow-hidden">
      <TitleBar />

      <div className="flex flex-1 overflow-hidden min-h-0">
        <Sidebar />

        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          {/* Main area: Editor + Chat */}
          <div className="flex-1 flex overflow-hidden min-h-0">
            <CodeEditor />
            <ChatPanel />
          </div>

          {/* Terminal */}
          {state.terminalVisible && <Terminal />}
        </div>
      </div>

      <StatusBar />
      <CommandPalette />
    </div>
  )
}

export default function App() {
  return <AppContent />
}
