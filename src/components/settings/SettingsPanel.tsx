import { useState } from 'react'
import { useApp } from '../../store/AppContext'

export default function SettingsPanel() {
  const { state, dispatch } = useApp()
  const [showApiKey, setShowApiKey] = useState(false)
  const { settings } = state

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center px-3 py-2 border-b border-[#30363d]">
        <span className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">
          Settings
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 min-h-0">
        {/* Claude API Section */}
        <section>
          <h3 className="text-sm font-medium text-[#e6edf3] mb-3 flex items-center gap-2">
            <span>🤖</span> Claude API
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs text-[#8b949e] mb-1">API Key</label>
              <div className="flex gap-1">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={settings.claude.apiKey}
                  onChange={e => dispatch({ type: 'UPDATE_CLAUDE_SETTINGS', payload: { apiKey: e.target.value } })}
                  placeholder="sk-ant-..."
                  className="input-field text-xs py-1.5 flex-1"
                />
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="btn-icon"
                  title={showApiKey ? 'Hide' : 'Show'}
                >
                  {showApiKey ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs text-[#8b949e] mb-1">Model</label>
              <select
                value={settings.claude.model}
                onChange={e => dispatch({ type: 'UPDATE_CLAUDE_SETTINGS', payload: { model: e.target.value } })}
                className="input-field text-xs py-1.5"
              >
                <option value="claude-sonnet-4-20250514">Claude Sonnet 4</option>
                <option value="claude-opus-4-20250514">Claude Opus 4</option>
                <option value="claude-haiku-4-20250514">Claude Haiku 4</option>
                <option value="claude-sonnet-4-20250514">Claude 3.5 Sonnet</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-[#8b949e] mb-1">Max Tokens</label>
              <input
                type="number"
                value={settings.claude.maxTokens}
                onChange={e => dispatch({ type: 'UPDATE_CLAUDE_SETTINGS', payload: { maxTokens: parseInt(e.target.value) } })}
                className="input-field text-xs py-1.5"
                min={256}
                max={100000}
              />
            </div>

            <div>
              <label className="block text-xs text-[#8b949e] mb-1">System Prompt</label>
              <textarea
                value={settings.claude.systemPrompt}
                onChange={e => dispatch({ type: 'UPDATE_CLAUDE_SETTINGS', payload: { systemPrompt: e.target.value } })}
                className="input-field text-xs py-1.5 resize-none h-24"
              />
            </div>
          </div>
        </section>

        {/* Editor Section */}
        <section>
          <h3 className="text-sm font-medium text-[#e6edf3] mb-3 flex items-center gap-2">
            <span>📝</span> Editor
          </h3>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-[#8b949e] mb-1">Font Size</label>
                <input
                  type="number"
                  value={settings.editor.fontSize}
                  onChange={e => dispatch({ type: 'UPDATE_EDITOR_SETTINGS', payload: { fontSize: parseInt(e.target.value) } })}
                  className="input-field text-xs py-1.5"
                  min={8}
                  max={32}
                />
              </div>
              <div>
                <label className="block text-xs text-[#8b949e] mb-1">Tab Size</label>
                <select
                  value={settings.editor.tabSize}
                  onChange={e => dispatch({ type: 'UPDATE_EDITOR_SETTINGS', payload: { tabSize: parseInt(e.target.value) } })}
                  className="input-field text-xs py-1.5"
                >
                  <option value={2}>2 Spaces</option>
                  <option value={4}>4 Spaces</option>
                  <option value={8}>8 Spaces</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs text-[#8b949e] mb-1">Font Family</label>
              <input
                value={settings.editor.fontFamily}
                onChange={e => dispatch({ type: 'UPDATE_EDITOR_SETTINGS', payload: { fontFamily: e.target.value } })}
                className="input-field text-xs py-1.5"
              />
            </div>

            <div>
              <label className="block text-xs text-[#8b949e] mb-1">Word Wrap</label>
              <select
                value={settings.editor.wordWrap}
                onChange={e => dispatch({ type: 'UPDATE_EDITOR_SETTINGS', payload: { wordWrap: e.target.value as any } })}
                className="input-field text-xs py-1.5"
              >
                <option value="off">Off</option>
                <option value="on">On</option>
                <option value="wordWrapColumn">Word Wrap Column</option>
              </select>
            </div>

            <label className="flex items-center gap-2 text-xs text-[#e6edf3] cursor-pointer">
              <input
                type="checkbox"
                checked={settings.editor.minimap}
                onChange={e => dispatch({ type: 'UPDATE_EDITOR_SETTINGS', payload: { minimap: e.target.checked } })}
                className="rounded"
              />
              Show Minimap
            </label>

            <label className="flex items-center gap-2 text-xs text-[#e6edf3] cursor-pointer">
              <input
                type="checkbox"
                checked={settings.editor.lineNumbers}
                onChange={e => dispatch({ type: 'UPDATE_EDITOR_SETTINGS', payload: { lineNumbers: e.target.checked } })}
                className="rounded"
              />
              Show Line Numbers
            </label>
          </div>
        </section>

        {/* Keyboard Shortcuts */}
        <section>
          <h3 className="text-sm font-medium text-[#e6edf3] mb-3 flex items-center gap-2">
            <span>⌨️</span> Keyboard Shortcuts
          </h3>

          <div className="space-y-1.5 text-xs">
            {[
              ['Ctrl+N', 'New File'],
              ['Ctrl+O', 'Open File'],
              ['Ctrl+Shift+O', 'Open Folder'],
              ['Ctrl+S', 'Save File'],
              ['Ctrl+Shift+S', 'Save As'],
              ['Ctrl+B', 'Toggle Sidebar'],
              ['Ctrl+`', 'Toggle Terminal'],
              ['Ctrl+Shift+P', 'Command Palette'],
              ['Ctrl+/', 'Toggle Comment'],
            ].map(([key, desc]) => (
              <div key={key} className="flex items-center justify-between py-1 px-2 rounded hover:bg-[#30363d40]">
                <span className="text-[#e6edf3]">{desc}</span>
                <kbd className="bg-[#30363d] px-1.5 py-0.5 rounded text-[10px] font-mono">{key}</kbd>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
