import { useState, useEffect, useCallback } from 'react'
import { useApp, FileNode, FileTab } from '../../store/AppContext'
import { getLanguage } from '../../utils/fileSystem'
import { v4 as uuid } from 'uuid'

const api = window.electronAPI

export default function FileExplorer() {
  const { state, dispatch } = useApp()
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; node: FileNode } | null>(null)
  const [renaming, setRenaming] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [creating, setCreating] = useState<{ dir: string; type: 'file' | 'folder' } | null>(null)
  const [createValue, setCreateValue] = useState('')

  // Load workspace
  const handleOpenFolder = useCallback(async () => {
    if (!api) return
    const folderPath = await api.openFolderDialog()
    if (!folderPath) return

    const tree = await api.readDir(folderPath)
    dispatch({ type: 'SET_WORKSPACE', payload: { path: folderPath, tree } })
    dispatch({ type: 'SET_STATUS', payload: `Opened: ${folderPath}` })
  }, [dispatch])

  // Open single file
  const handleOpenFile = useCallback(async () => {
    if (!api) return
    const result = await api.openFileDialog()
    if (!result) return

    const tab: FileTab = {
      id: uuid(),
      path: result.path,
      name: result.path.split(/[/\\]/).pop() || 'untitled',
      language: getLanguage(result.path),
      content: result.content,
      modified: false,
    }
    dispatch({ type: 'OPEN_FILE', payload: tab })
  }, [dispatch])

  // Toggle directory expand
  const toggleDir = async (node: FileNode) => {
    if (!node.isDirectory) return

    const expanded = state.fileTreeExpanded.has(node.path)
    dispatch({ type: 'TOGGLE_DIR_EXPAND', payload: node.path })

    if (!expanded && (!node.children || node.children.length === 0) && api) {
      const children = await api.readDir(node.path)
      node.children = children
      // Force re-render by refreshing tree
      dispatch({ type: 'REFRESH_FILE_TREE', payload: [...state.fileTree] })
    }
  }

  // Open file in editor
  const openFileInEditor = async (node: FileNode) => {
    if (node.isDirectory) {
      toggleDir(node)
      return
    }

    // Check if already open
    const existing = state.tabs.find(t => t.path === node.path)
    if (existing) {
      dispatch({ type: 'SET_ACTIVE_TAB', payload: existing.id })
      return
    }

    if (!api) return
    const content = await api.readFile(node.path)
    const tab: FileTab = {
      id: uuid(),
      path: node.path,
      name: node.name,
      language: getLanguage(node.name),
      content,
      modified: false,
    }
    dispatch({ type: 'OPEN_FILE', payload: tab })
  }

  // Context menu actions
  const handleContextMenu = (e: React.MouseEvent, node: FileNode) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({ x: e.clientX, y: e.clientY, node })
  }

  const handleCreateNew = async (type: 'file' | 'folder') => {
    if (!contextMenu || !api) return
    const dir = contextMenu.node.isDirectory ? contextMenu.node.path : contextMenu.node.path.split(/[/\\]/).slice(0, -1).join('/')
    setCreating({ dir, type })
    setCreateValue('')
    setContextMenu(null)
  }

  const confirmCreate = async () => {
    if (!creating || !createValue || !api) return
    try {
      if (creating.type === 'file') {
        await api.createFile(creating.dir, createValue)
      } else {
        await api.createDir(creating.dir, createValue)
      }
      // Refresh tree
      if (state.workspacePath) {
        const tree = await api.readDir(state.workspacePath)
        dispatch({ type: 'REFRESH_FILE_TREE', payload: tree })
      }
    } catch (err) {
      console.error('Create failed:', err)
    }
    setCreating(null)
    setCreateValue('')
  }

  const handleDelete = async () => {
    if (!contextMenu || !api) return
    try {
      await api.deleteFile(contextMenu.node.path)
      // Close tab if open
      const tab = state.tabs.find(t => t.path === contextMenu.node.path)
      if (tab) dispatch({ type: 'CLOSE_TAB', payload: tab.id })
      // Refresh
      if (state.workspacePath) {
        const tree = await api.readDir(state.workspacePath)
        dispatch({ type: 'REFRESH_FILE_TREE', payload: tree })
      }
    } catch (err) {
      console.error('Delete failed:', err)
    }
    setContextMenu(null)
  }

  const handleRename = () => {
    if (!contextMenu) return
    setRenaming(contextMenu.node.path)
    setRenameValue(contextMenu.node.name)
    setContextMenu(null)
  }

  const confirmRename = async () => {
    if (!renaming || !renameValue || !api) return
    try {
      await api.renameFile(renaming, renameValue)
      if (state.workspacePath) {
        const tree = await api.readDir(state.workspacePath)
        dispatch({ type: 'REFRESH_FILE_TREE', payload: tree })
      }
    } catch (err) {
      console.error('Rename failed:', err)
    }
    setRenaming(null)
    setRenameValue('')
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'o' && !e.shiftKey) {
          e.preventDefault()
          handleOpenFile()
        }
        if (e.key === 'o' && e.shiftKey) {
          e.preventDefault()
          handleOpenFolder()
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleOpenFile, handleOpenFolder])

  // Close context menu on click outside
  useEffect(() => {
    const handler = () => setContextMenu(null)
    window.addEventListener('click', handler)
    return () => window.removeEventListener('click', handler)
  }, [])

  const renderNode = (node: FileNode, depth: number = 0) => {
    const isExpanded = state.fileTreeExpanded.has(node.path)
    const isRenaming = renaming === node.path

    return (
      <div key={node.path}>
        <div
          className={`
            flex items-center gap-1 py-0.5 px-2 cursor-pointer text-xs
            hover:bg-[#30363d80] transition-colors
            ${state.tabs.find(t => t.path === node.path && t.id === state.activeTabId) ? 'bg-[#30363d]' : ''}
          `}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => openFileInEditor(node)}
          onContextMenu={(e) => handleContextMenu(e, node)}
          onDoubleClick={() => !node.isDirectory && openFileInEditor(node)}
        >
          {node.isDirectory ? (
            <svg
              className={`w-3 h-3 shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              viewBox="0 0 16 16"
              fill="currentColor"
            >
              <path d="M6 4l4 4-4 4V4z" />
            </svg>
          ) : (
            <span className="w-3" />
          )}

          {node.isDirectory ? (
            <span className="text-[#58a6ff] mr-1">📁</span>
          ) : (
            <span className="mr-1">{getFileIcon(node.name)}</span>
          )}

          {isRenaming ? (
            <input
              autoFocus
              value={renameValue}
              onChange={e => setRenameValue(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') confirmRename()
                if (e.key === 'Escape') setRenaming(null)
              }}
              onBlur={confirmRename}
              className="flex-1 bg-[#0d1117] border border-[#58a6ff] rounded px-1 text-xs outline-none"
              onClick={e => e.stopPropagation()}
            />
          ) : (
            <span className="truncate text-[#e6edf3]">{node.name}</span>
          )}
        </div>

        {node.isDirectory && isExpanded && node.children?.map(child =>
          renderNode(child, depth + 1)
        )}
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#30363d]">
        <span className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">
          Explorer
        </span>
        <div className="flex items-center gap-1">
          <button onClick={handleOpenFile} className="btn-icon" title="Open File (Ctrl+O)">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <path d="M14 2v6h6M12 18v-6M9 15h6" />
            </svg>
          </button>
          <button onClick={handleOpenFolder} className="btn-icon" title="Open Folder (Ctrl+Shift+O)">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-1">
        {state.workspacePath ? (
          <>
            <div className="px-3 py-1.5 text-xs text-[#8b949e] flex items-center gap-1 border-b border-[#30363d] mb-1">
              <span className="truncate font-medium">
                {state.workspacePath.split(/[/\\]/).pop()}
              </span>
            </div>
            {state.fileTree.map(node => renderNode(node))}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-[#484f58] text-xs gap-3 px-4">
            <svg className="w-10 h-10 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
            </svg>
            <p className="text-center">No folder opened</p>
            <button onClick={handleOpenFolder} className="btn-primary text-xs py-1.5 px-3">
              Open Folder
            </button>
          </div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-[#1c2128] border border-[#30363d] rounded-md shadow-xl py-1 z-50 min-w-[160px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={e => e.stopPropagation()}
        >
          {contextMenu.node.isDirectory && (
            <>
              <ContextMenuItem label="New File" onClick={() => handleCreateNew('file')} />
              <ContextMenuItem label="New Folder" onClick={() => handleCreateNew('folder')} />
              <div className="border-t border-[#30363d] my-1" />
            </>
          )}
          <ContextMenuItem label="Rename" onClick={handleRename} />
          <ContextMenuItem label="Delete" onClick={handleDelete} danger />
          <div className="border-t border-[#30363d] my-1" />
          <ContextMenuItem label="Copy Path" onClick={() => {
            navigator.clipboard.writeText(contextMenu.node.path)
            setContextMenu(null)
          }} />
        </div>
      )}

      {/* Create Input */}
      {creating && (
        <div className="px-3 py-2 border-t border-[#30363d] bg-[#161b22]">
          <div className="text-xs text-[#8b949e] mb-1">
            New {creating.type === 'file' ? 'File' : 'Folder'}:
          </div>
          <input
            autoFocus
            value={createValue}
            onChange={e => setCreateValue(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') confirmCreate()
              if (e.key === 'Escape') setCreating(null)
            }}
            onBlur={confirmCreate}
            placeholder={creating.type === 'file' ? 'filename.ts' : 'folder-name'}
            className="input-field text-xs py-1"
          />
        </div>
      )}
    </div>
  )
}

function ContextMenuItem({ label, onClick, danger }: { label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[#30363d] transition-colors ${
        danger ? 'text-[#f85149]' : 'text-[#e6edf3]'
      }`}
    >
      {label}
    </button>
  )
}

function getFileIcon(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() || ''
  const iconMap: Record<string, string> = {
    ts: '📘',
    tsx: '📘',
    js: '📒',
    jsx: '📒',
    py: '🐍',
    rs: '🦀',
    go: '🐹',
    java: '☕',
    html: '🌐',
    css: '🎨',
    scss: '🎨',
    json: '📋',
    yaml: '📋',
    yml: '📋',
    md: '📝',
    txt: '📄',
    svg: '🖼️',
    png: '🖼️',
    jpg: '🖼️',
    gitignore: '🔀',
    env: '🔒',
    sh: '⚙️',
    bat: '⚙️',
    sql: '🗃️',
  }
  return iconMap[ext] || '📄'
}
