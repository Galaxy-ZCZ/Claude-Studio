import { useState, useEffect } from 'react'
import { getLLMManager } from '../../utils/llmProviders'
import { loadSettings, saveSettings, AppSettingsData } from '../../utils/settingsManager'

export default function SettingsPanel() {
  const [settings, setSettings] = useState<AppSettingsData | null>(null)
  const [showApiKey, setShowApiKey] = useState(false)
  const [activeSection, setActiveSection] = useState<'models' | 'editor' | 'shortcuts'>('models')
  const [showAddProvider, setShowAddProvider] = useState(false)
  const [searchProvider, setSearchProvider] = useState('')
  const [newProvider, setNewProvider] = useState({
    id: '',
    name: '',
    type: 'openai' as 'openai' | 'anthropic',
    baseURL: '',
    apiKey: '',
  })

  useEffect(() => {
    loadSettings().then(s => {
      setSettings(s)
      getLLMManager().loadSettings(s)
    })
  }, [])

  useEffect(() => {
    if (settings) {
      saveSettings(settings)
      getLLMManager().loadSettings(settings)
    }
  }, [settings])

  if (!settings) return <div className="h-full flex items-center justify-center text-[#484f58] text-sm">Loading...</div>

  const manager = getLLMManager()
  const providers = manager.getProviders()
  const config = manager.getConfig()
  const activeProvider = manager.getActiveProvider()

  const updateConfig = (updates: Partial<typeof config>) => {
    manager.updateConfig(updates)
    setSettings(prev => prev ? { ...prev, activeConfig: manager.getConfig() } : null)
  }

  const updateProviderKey = (providerId: string, apiKey: string) => {
    manager.updateProvider(providerId, { apiKey })
    setSettings(prev => {
      if (!prev) return null
      const providers: Record<string, any> = { ...(prev.providers || {}) }
      providers[providerId] = { ...(providers[providerId] || {}), apiKey }
      return { ...prev, providers }
    })
  }

  const getProviderKey = (providerId: string): string => {
    const p = manager.getProvider(providerId)
    return p?.apiKey || ''
  }

  const handleAddProvider = () => {
    if (!newProvider.id || !newProvider.name || !newProvider.baseURL) return
    manager.addProvider({
      ...newProvider,
      models: [],
    })
    setSettings(prev => prev ? {
      ...prev,
      providers: {
        ...prev.providers,
        [newProvider.id]: { apiKey: newProvider.apiKey, baseURL: newProvider.baseURL, type: newProvider.type }
      }
    } : null)
    setNewProvider({ id: '', name: '', type: 'openai', baseURL: '', apiKey: '' })
    setShowAddProvider(false)
  }

  // Filter providers for search
  const filteredProviders = providers.filter(p =>
    p.name.toLowerCase().includes(searchProvider.toLowerCase()) ||
    p.id.toLowerCase().includes(searchProvider.toLowerCase())
  )

  const sections = [
    { id: 'models', label: 'AI Models', icon: '🤖' },
    { id: 'editor', label: 'Editor', icon: '📝' },
    { id: 'shortcuts', label: 'Shortcuts', icon: '⌨️' },
  ]

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center px-3 py-2 border-b border-[#30363d]">
        <span className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">Settings</span>
      </div>

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

      <div className="flex-1 overflow-y-auto min-h-0">
        {activeSection === 'models' && (
          <div className="p-4 space-y-5">
            {/* ─── Active Model Config ─── */}
            <section className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3">
              <h3 className="text-xs font-semibold text-[#58a6ff] mb-3 flex items-center gap-2">
                <span>⚡</span> ACTIVE MODEL
              </h3>

              {/* Provider */}
              <div className="space-y-2.5">
                <div>
                  <label className="block text-[10px] text-[#8b949e] mb-1 uppercase">Provider</label>
                  <select
                    value={config.providerId}
                    onChange={e => {
                      const id = e.target.value
                      const p = manager.getProvider(id)
                      updateConfig({
                        providerId: id,
                        modelId: p?.models[0] || '',
                      })
                    }}
                    className="input-field text-xs py-1.5"
                  >
                    <optgroup label="Cloud Providers">
                      {providers.filter(p => !['ollama', 'lmstudio', 'vllm'].includes(p.id)).map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Local Models">
                      {providers.filter(p => ['ollama', 'lmstudio', 'vllm'].includes(p.id)).map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                {/* Model - with datalist for suggestions + free input */}
                <div>
                  <label className="block text-[10px] text-[#8b949e] mb-1 uppercase">
                    Model ID <span className="text-[#484f58]">(select or type any)</span>
                  </label>
                  <input
                    value={config.modelId}
                    onChange={e => updateConfig({ modelId: e.target.value })}
                    list="model-suggestions"
                    placeholder="e.g. deepseek-coder, gpt-4o, qwen3-235b-a22b"
                    className="input-field text-xs py-1.5"
                  />
                  <datalist id="model-suggestions">
                    {activeProvider?.models.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </datalist>
                </div>

                {/* API Key */}
                {activeProvider && !['ollama', 'lmstudio', 'vllm'].includes(activeProvider.id) && (
                  <div>
                    <label className="block text-[10px] text-[#8b949e] mb-1 uppercase">
                      API Key <span className="text-[#484f58]">({activeProvider.name})</span>
                    </label>
                    <div className="flex gap-1">
                      <input
                        type={showApiKey ? 'text' : 'password'}
                        value={getProviderKey(activeProvider.id)}
                        onChange={e => updateProviderKey(activeProvider.id, e.target.value)}
                        placeholder={`Enter ${activeProvider.name} API key...`}
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
                )}

                {/* Base URL (editable for custom endpoints) */}
                {activeProvider && (
                  <div>
                    <label className="block text-[10px] text-[#8b949e] mb-1 uppercase">Base URL</label>
                    <input
                      value={activeProvider.baseURL}
                      onChange={e => {
                        manager.updateProvider(activeProvider.id, { baseURL: e.target.value })
                        setSettings(prev => prev ? { ...prev } : null)
                      }}
                      className="input-field text-xs py-1.5"
                    />
                  </div>
                )}

                {/* Temperature & Max Tokens */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-[#8b949e] mb-1 uppercase">
                      Temp: {config.temperature}
                    </label>
                    <input
                      type="range" min="0" max="2" step="0.1"
                      value={config.temperature}
                      onChange={e => updateConfig({ temperature: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#8b949e] mb-1 uppercase">Max Tokens</label>
                    <input
                      type="number"
                      value={config.maxTokens}
                      onChange={e => updateConfig({ maxTokens: parseInt(e.target.value) })}
                      className="input-field text-xs py-1"
                      min={256} max={200000}
                    />
                  </div>
                </div>

                {/* System Prompt */}
                <div>
                  <label className="block text-[10px] text-[#8b949e] mb-1 uppercase">System Prompt</label>
                  <textarea
                    value={config.systemPrompt}
                    onChange={e => updateConfig({ systemPrompt: e.target.value })}
                    className="input-field text-xs py-1.5 resize-none h-20"
                  />
                </div>
              </div>
            </section>

            {/* ─── Provider List ─── */}
            <section>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-[#8b949e] uppercase">All Providers</h3>
                <button
                  onClick={() => setShowAddProvider(!showAddProvider)}
                  className="text-[10px] text-[#58a6ff] hover:underline"
                >
                  {showAddProvider ? 'Cancel' : '+ Custom Provider'}
                </button>
              </div>

              {/* Search */}
              <input
                value={searchProvider}
                onChange={e => setSearchProvider(e.target.value)}
                placeholder="Search providers..."
                className="input-field text-xs py-1 mb-2"
              />

              {/* Custom provider form */}
              {showAddProvider && (
                <div className="mb-3 p-3 bg-[#0d1117] border border-[#58a6ff40] rounded-lg space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      value={newProvider.id}
                      onChange={e => setNewProvider(prev => ({ ...prev, id: e.target.value }))}
                      placeholder="ID (e.g. my-llm)"
                      className="input-field text-xs py-1"
                    />
                    <input
                      value={newProvider.name}
                      onChange={e => setNewProvider(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Display Name"
                      className="input-field text-xs py-1"
                    />
                  </div>
                  <select
                    value={newProvider.type}
                    onChange={e => setNewProvider(prev => ({ ...prev, type: e.target.value as any }))}
                    className="input-field text-xs py-1"
                  >
                    <option value="openai">OpenAI Compatible</option>
                    <option value="anthropic">Anthropic Compatible</option>
                  </select>
                  <input
                    value={newProvider.baseURL}
                    onChange={e => setNewProvider(prev => ({ ...prev, baseURL: e.target.value }))}
                    placeholder="Base URL (https://api.example.com/v1)"
                    className="input-field text-xs py-1"
                  />
                  <input
                    type="password"
                    value={newProvider.apiKey}
                    onChange={e => setNewProvider(prev => ({ ...prev, apiKey: e.target.value }))}
                    placeholder="API Key"
                    className="input-field text-xs py-1"
                  />
                  <button
                    onClick={handleAddProvider}
                    disabled={!newProvider.id || !newProvider.name || !newProvider.baseURL}
                    className="btn-primary text-xs py-1.5 w-full disabled:opacity-50"
                  >
                    Add Provider
                  </button>
                </div>
              )}

              {/* Provider list */}
              <div className="space-y-1">
                {filteredProviders.map(p => {
                  const hasKey = !!p.apiKey || ['ollama', 'lmstudio', 'vllm'].includes(p.id)
                  return (
                    <div
                      key={p.id}
                      className={`flex items-center justify-between px-2 py-1.5 rounded text-xs cursor-pointer transition-colors ${
                        config.providerId === p.id ? 'bg-[#30363d]' : 'hover:bg-[#30363d40]'
                      }`}
                      onClick={() => {
                        updateConfig({
                          providerId: p.id,
                          modelId: p.models[0] || '',
                        })
                      }}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${hasKey ? 'bg-[#3fb950]' : 'bg-[#30363d]'}`} />
                        <span className="text-[#e6edf3] truncate">{p.name}</span>
                        <span className="text-[10px] text-[#484f58] shrink-0">({p.type})</span>
                      </div>
                      {config.providerId === p.id && (
                        <span className="text-[10px] text-[#58a6ff] shrink-0">Active</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>

            {/* ─── Quick Tips ─── */}
            <section className="text-[10px] text-[#484f58] bg-[#0d1117] border border-[#30363d] rounded-md p-3 space-y-2">
              <p className="font-medium text-[#8b949e]">💡 How to use any model:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Select a provider above (or add custom)</li>
                <li>Enter the <strong className="text-[#e6edf3]">exact model ID</strong> in the Model field</li>
                <li>You can type <strong className="text-[#e6edf3]">any model name</strong> - not limited to suggestions</li>
                <li>For local models (Ollama/LM Studio), no API key needed</li>
              </ul>
              <p className="font-medium text-[#8b949e] mt-2">📁 Settings file:</p>
              <code className="block p-2 bg-[#161b22] rounded text-[#58a6ff]">
                {process.platform === 'win32' ? '%APPDATA%\\Claude-Studio\\settings.json' : '~/.config/claude-studio/settings.json'}
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
                <input type="number" value={settings.editor.fontSize}
                  onChange={e => setSettings(prev => prev ? { ...prev, editor: { ...prev.editor, fontSize: parseInt(e.target.value) } } : null)}
                  className="input-field text-xs py-1.5" min={8} max={32} />
              </div>
              <div>
                <label className="block text-xs text-[#8b949e] mb-1">Tab Size</label>
                <select value={settings.editor.tabSize}
                  onChange={e => setSettings(prev => prev ? { ...prev, editor: { ...prev.editor, tabSize: parseInt(e.target.value) } } : null)}
                  className="input-field text-xs py-1.5">
                  <option value={2}>2 Spaces</option>
                  <option value={4}>4 Spaces</option>
                  <option value={8}>8 Spaces</option>
                </select>
              </div>
            </div>
            <label className="flex items-center gap-2 text-xs text-[#e6edf3] cursor-pointer">
              <input type="checkbox" checked={settings.editor.minimap}
                onChange={e => setSettings(prev => prev ? { ...prev, editor: { ...prev.editor, minimap: e.target.checked } } : null)} />
              Show Minimap
            </label>
            <label className="flex items-center gap-2 text-xs text-[#e6edf3] cursor-pointer">
              <input type="checkbox" checked={settings.editor.lineNumbers}
                onChange={e => setSettings(prev => prev ? { ...prev, editor: { ...prev.editor, lineNumbers: e.target.checked } } : null)} />
              Show Line Numbers
            </label>
          </div>
        )}

        {activeSection === 'shortcuts' && (
          <div className="p-4">
            <h3 className="text-sm font-medium text-[#e6edf3] mb-3">Keyboard Shortcuts</h3>
            <div className="space-y-1.5 text-xs">
              {[ ['Ctrl+N', 'New File'], ['Ctrl+O', 'Open File'], ['Ctrl+Shift+O', 'Open Folder'],
                 ['Ctrl+S', 'Save'], ['Ctrl+B', 'Sidebar'], ['Ctrl+`', 'Terminal'],
                 ['Ctrl+Shift+P', 'Commands'], ['Ctrl+W', 'Close Tab'] ].map(([key, desc]) => (
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
