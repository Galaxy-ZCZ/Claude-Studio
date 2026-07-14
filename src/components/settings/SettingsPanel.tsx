import { useState, useEffect } from 'react'
import { getLLMManager, LLMProvider } from '../../utils/llmProviders'
import { loadSettings, saveSettings, AppSettingsData } from '../../utils/settingsManager'

export default function SettingsPanel() {
  const [settings, setSettings] = useState<AppSettingsData | null>(null)
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({})
  const [activeSection, setActiveSection] = useState<'models' | 'editor' | 'shortcuts'>('models')
  const [editProvider, setEditProvider] = useState<string | null>(null)
  const [customProvider, setCustomProvider] = useState({
    id: '',
    name: '',
    baseURL: '',
    apiKey: '',
    modelId: '',
    modelName: '',
  })

  // Load settings on mount
  useEffect(() => {
    loadSettings().then(s => {
      setSettings(s)
      // Apply to LLM manager
      const manager = getLLMManager()
      manager.loadSettings(s)
    })
  }, [])

  // Save settings whenever they change
  useEffect(() => {
    if (settings) {
      saveSettings(settings)
      // Update LLM manager
      const manager = getLLMManager()
      manager.loadSettings(settings)
    }
  }, [settings])

  if (!settings) {
    return (
      <div className="h-full flex items-center justify-center text-[#484f58] text-sm">
        Loading settings...
      </div>
    )
  }

  const manager = getLLMManager()
  const providers = manager.getProviders()
  const activeConfig = settings.activeConfig
  const activeProvider = providers.find(p => p.id === activeConfig.providerId)

  const updateActiveConfig = (updates: Partial<typeof activeConfig>) => {
    setSettings(prev => prev ? {
      ...prev,
      activeConfig: { ...prev.activeConfig, ...updates }
    } : null)
  }

  const updateProviderApiKey = (providerId: string, apiKey: string) => {
    setSettings(prev => {
      if (!prev) return null
      const existing = prev.providers.find(p => p.id === providerId)
      if (existing) {
        return {
          ...prev,
          providers: prev.providers.map(p =>
            p.id === providerId ? { ...p, apiKey } : p
          ),
        }
      }
      return {
        ...prev,
        providers: [...prev.providers, { id: providerId, apiKey, baseURL: '', models: [] }],
      }
    })
    // Also update the manager
    manager.updateProvider(providerId, { apiKey })
  }

  const getProviderApiKey = (providerId: string): string => {
    const saved = settings.providers.find(p => p.id === providerId)
    if (saved?.apiKey) return saved.apiKey
    const provider = providers.find(p => p.id === providerId)
    return provider?.apiKey || ''
  }

  const handleAddCustomProvider = () => {
    if (!customProvider.id || !customProvider.name || !customProvider.baseURL) return

    const newProvider: LLMProvider = {
      id: customProvider.id,
      name: customProvider.name,
      type: 'openai',
      baseURL: customProvider.baseURL,
      apiKey: customProvider.apiKey,
      models: customProvider.modelId ? [{
        id: customProvider.modelId,
        name: customProvider.modelName || customProvider.modelId,
      }] : [],
    }

    manager.addProvider(newProvider)
    setSettings(prev => prev ? {
      ...prev,
      customProviders: [...prev.customProviders, {
        id: newProvider.id,
        name: newProvider.name,
        type: newProvider.type,
        baseURL: newProvider.baseURL,
        apiKey: newProvider.apiKey,
        models: newProvider.models,
      }],
    } : null)

    setCustomProvider({ id: '', name: '', baseURL: '', apiKey: '', modelId: '', modelName: '' })
    setEditProvider(null)
  }

  const sections = [
    { id: 'models', label: 'AI Models', icon: '🤖' },
    { id: 'editor', label: 'Editor', icon: '📝' },
    { id: 'shortcuts', label: 'Shortcuts', icon: '⌨️' },
  ]

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center px-3 py-2 border-b border-[#30363d]">
        <span className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">
          Settings
        </span>
      </div>

      {/* Section tabs */}
      <div className="flex border-b border-[#30363d]">
        {sections.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id as any)}
            className={`flex-1 px-2 py-2 text-xs flex items-center justify-center gap-1.5 transition-colors ${
              activeSection === s.id
                ? 'text-[#e6edf3] border-b-2 border-[#58a6ff] bg-[#0d1117]'
                : 'text-[#484f58] hover:text-[#8b949e]'
            }`}
          >
            <span>{s.icon}</span>
            <span>{s.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {activeSection === 'models' && (
          <div className="p-4 space-y-6">
            {/* Active Model */}
            <section>
              <h3 className="text-sm font-medium text-[#e6edf3] mb-3">Active Model</h3>

              {/* Provider selector */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-[#8b949e] mb-1">Provider</label>
                  <select
                    value={activeConfig.providerId}
                    onChange={e => {
                      const providerId = e.target.value
                      const provider = providers.find(p => p.id === providerId)
                      updateActiveConfig({
                        providerId,
                        modelId: provider?.models[0]?.id || '',
                      })
                    }}
                    className="input-field text-xs py-1.5"
                  >
                    {providers.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                {/* Model selector */}
                {activeProvider && activeProvider.models.length > 0 && (
                  <div>
                    <label className="block text-xs text-[#8b949e] mb-1">Model</label>
                    <select
                      value={activeConfig.modelId}
                      onChange={e => updateActiveConfig({ modelId: e.target.value })}
                      className="input-field text-xs py-1.5"
                    >
                      {activeProvider.models.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.name} {m.contextLength ? `(${Math.round(m.contextLength / 1000)}k)` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Custom model input for custom provider */}
                {activeProvider?.id === 'custom' && (
                  <div>
                    <label className="block text-xs text-[#8b949e] mb-1">Custom Model ID</label>
                    <input
                      value={activeConfig.modelId}
                      onChange={e => updateActiveConfig({ modelId: e.target.value })}
                      placeholder="e.g., gpt-4o, deepseek-chat, custom-model"
                      className="input-field text-xs py-1.5"
                    />
                  </div>
                )}

                {/* Temperature */}
                <div>
                  <label className="block text-xs text-[#8b949e] mb-1">
                    Temperature: {activeConfig.temperature}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={activeConfig.temperature}
                    onChange={e => updateActiveConfig({ temperature: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-[10px] text-[#484f58]">
                    <span>Precise</span>
                    <span>Creative</span>
                  </div>
                </div>

                {/* Max Tokens */}
                <div>
                  <label className="block text-xs text-[#8b949e] mb-1">Max Output Tokens</label>
                  <input
                    type="number"
                    value={activeConfig.maxTokens}
                    onChange={e => updateActiveConfig({ maxTokens: parseInt(e.target.value) })}
                    className="input-field text-xs py-1.5"
                    min={256}
                    max={100000}
                  />
                </div>

                {/* System Prompt */}
                <div>
                  <label className="block text-xs text-[#8b949e] mb-1">System Prompt</label>
                  <textarea
                    value={activeConfig.systemPrompt}
                    onChange={e => updateActiveConfig({ systemPrompt: e.target.value })}
                    className="input-field text-xs py-1.5 resize-none h-24"
                  />
                </div>
              </div>
            </section>

            {/* API Keys */}
            <section>
              <h3 className="text-sm font-medium text-[#e6edf3] mb-3">API Keys</h3>
              <div className="space-y-3">
                {providers.filter(p => p.id !== 'custom').map(provider => (
                  <div key={provider.id}>
                    <label className="block text-xs text-[#8b949e] mb-1">{provider.name}</label>
                    <div className="flex gap-1">
                      <input
                        type={showApiKey[provider.id] ? 'text' : 'password'}
                        value={getProviderApiKey(provider.id)}
                        onChange={e => updateProviderApiKey(provider.id, e.target.value)}
                        placeholder={`Enter ${provider.name} API key...`}
                        className="input-field text-xs py-1.5 flex-1"
                      />
                      <button
                        onClick={() => setShowApiKey(prev => ({ ...prev, [provider.id]: !prev[provider.id] }))}
                        className="btn-icon"
                        title={showApiKey[provider.id] ? 'Hide' : 'Show'}
                      >
                        {showApiKey[provider.id] ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Custom Provider */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-[#e6edf3]">Custom Provider</h3>
                <button
                  onClick={() => setEditProvider(editProvider ? null : 'new')}
                  className="btn-primary text-xs py-1 px-2"
                >
                  {editProvider ? 'Cancel' : '+ Add'}
                </button>
              </div>

              {/* List custom providers */}
              {settings.customProviders.map(cp => (
                <div
                  key={cp.id}
                  className="mb-2 p-2 bg-[#0d1117] border border-[#30363d] rounded-md"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-medium text-[#e6edf3]">{cp.name}</div>
                      <div className="text-[10px] text-[#484f58]">{cp.baseURL}</div>
                    </div>
                    <button
                      onClick={() => {
                        setSettings(prev => prev ? {
                          ...prev,
                          customProviders: prev.customProviders.filter(p => p.id !== cp.id),
                        } : null)
                        manager.removeProvider(cp.id)
                      }}
                      className="text-[#f85149] text-xs hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              {/* Add custom provider form */}
              {editProvider && (
                <div className="p-3 bg-[#0d1117] border border-[#30363d] rounded-md space-y-2">
                  <input
                    value={customProvider.id}
                    onChange={e => setCustomProvider(prev => ({ ...prev, id: e.target.value }))}
                    placeholder="Provider ID (e.g., my-llm)"
                    className="input-field text-xs py-1.5"
                  />
                  <input
                    value={customProvider.name}
                    onChange={e => setCustomProvider(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Provider Name"
                    className="input-field text-xs py-1.5"
                  />
                  <input
                    value={customProvider.baseURL}
                    onChange={e => setCustomProvider(prev => ({ ...prev, baseURL: e.target.value }))}
                    placeholder="Base URL (e.g., https://api.example.com/v1)"
                    className="input-field text-xs py-1.5"
                  />
                  <input
                    type="password"
                    value={customProvider.apiKey}
                    onChange={e => setCustomProvider(prev => ({ ...prev, apiKey: e.target.value }))}
                    placeholder="API Key"
                    className="input-field text-xs py-1.5"
                  />
                  <div className="flex gap-2">
                    <input
                      value={customProvider.modelId}
                      onChange={e => setCustomProvider(prev => ({ ...prev, modelId: e.target.value }))}
                      placeholder="Model ID"
                      className="input-field text-xs py-1.5 flex-1"
                    />
                    <input
                      value={customProvider.modelName}
                      onChange={e => setCustomProvider(prev => ({ ...prev, modelName: e.target.value }))}
                      placeholder="Display Name"
                      className="input-field text-xs py-1.5 flex-1"
                    />
                  </div>
                  <button
                    onClick={handleAddCustomProvider}
                    disabled={!customProvider.id || !customProvider.name || !customProvider.baseURL}
                    className="btn-primary text-xs py-1.5 w-full disabled:opacity-50"
                  >
                    Add Provider
                  </button>
                </div>
              )}
            </section>

            {/* settings.json hint */}
            <section className="text-[10px] text-[#484f58] bg-[#0d1117] border border-[#30363d] rounded-md p-3">
              <p className="mb-1 font-medium text-[#8b949e]">💡 Pro Tip: Edit settings.json directly</p>
              <p>Settings are saved to:</p>
              <code className="block mt-1 p-2 bg-[#161b22] rounded text-[#58a6ff]">
                {process.platform === 'win32'
                  ? '%APPDATA%\\Claude-Studio\\settings.json'
                  : '~/.config/claude-studio/settings.json'}
              </code>
              <p className="mt-2">You can also set API keys via environment variables:</p>
              <code className="block mt-1 p-2 bg-[#161b22] rounded text-[#58a6ff]">
                ANTHROPIC_API_KEY=sk-ant-...<br/>
                DEEPSEEK_API_KEY=sk-...<br/>
                OPENAI_API_KEY=sk-...
              </code>
            </section>
          </div>
        )}

        {activeSection === 'editor' && (
          <div className="p-4 space-y-4">
            <h3 className="text-sm font-medium text-[#e6edf3]">Editor Settings</h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-[#8b949e] mb-1">Font Size</label>
                <input
                  type="number"
                  value={settings.editor.fontSize}
                  onChange={e => setSettings(prev => prev ? {
                    ...prev,
                    editor: { ...prev.editor, fontSize: parseInt(e.target.value) }
                  } : null)}
                  className="input-field text-xs py-1.5"
                  min={8}
                  max={32}
                />
              </div>
              <div>
                <label className="block text-xs text-[#8b949e] mb-1">Tab Size</label>
                <select
                  value={settings.editor.tabSize}
                  onChange={e => setSettings(prev => prev ? {
                    ...prev,
                    editor: { ...prev.editor, tabSize: parseInt(e.target.value) }
                  } : null)}
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
                onChange={e => setSettings(prev => prev ? {
                  ...prev,
                  editor: { ...prev.editor, fontFamily: e.target.value }
                } : null)}
                className="input-field text-xs py-1.5"
              />
            </div>

            <div>
              <label className="block text-xs text-[#8b949e] mb-1">Word Wrap</label>
              <select
                value={settings.editor.wordWrap}
                onChange={e => setSettings(prev => prev ? {
                  ...prev,
                  editor: { ...prev.editor, wordWrap: e.target.value as any }
                } : null)}
                className="input-field text-xs py-1.5"
              >
                <option value="off">Off</option>
                <option value="on">On</option>
                <option value="wordWrapColumn">Wrap at Column</option>
              </select>
            </div>

            <label className="flex items-center gap-2 text-xs text-[#e6edf3] cursor-pointer">
              <input
                type="checkbox"
                checked={settings.editor.minimap}
                onChange={e => setSettings(prev => prev ? {
                  ...prev,
                  editor: { ...prev.editor, minimap: e.target.checked }
                } : null)}
                className="rounded"
              />
              Show Minimap
            </label>

            <label className="flex items-center gap-2 text-xs text-[#e6edf3] cursor-pointer">
              <input
                type="checkbox"
                checked={settings.editor.lineNumbers}
                onChange={e => setSettings(prev => prev ? {
                  ...prev,
                  editor: { ...prev.editor, lineNumbers: e.target.checked }
                } : null)}
                className="rounded"
              />
              Show Line Numbers
            </label>
          </div>
        )}

        {activeSection === 'shortcuts' && (
          <div className="p-4">
            <h3 className="text-sm font-medium text-[#e6edf3] mb-3">Keyboard Shortcuts</h3>
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
                ['Ctrl+W', 'Close Tab'],
                ['Ctrl+/', 'Toggle Comment'],
              ].map(([key, desc]) => (
                <div key={key} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-[#30363d40]">
                  <span className="text-[#e6edf3]">{desc}</span>
                  <kbd className="bg-[#30363d] px-1.5 py-0.5 rounded text-[10px] font-mono">{key}</kbd>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
