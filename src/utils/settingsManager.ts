// ─── Settings Manager ────────────────────────────────
// Manages settings.json file for persistent configuration

const fs = window.require ? window.require('fs') : null
const path = window.require ? window.require('path') : null

export interface AppSettingsData {
  // LLM Configuration
  providers: Array<{
    id: string
    apiKey: string
    baseURL: string
    models: Array<{
      id: string
      name: string
      contextLength?: number
      maxOutput?: number
    }>
  }>
  activeConfig: {
    providerId: string
    modelId: string
    temperature: number
    maxTokens: number
    systemPrompt: string
  }

  // Editor Configuration
  editor: {
    fontSize: number
    fontFamily: string
    tabSize: number
    wordWrap: 'on' | 'off' | 'wordWrapColumn'
    minimap: boolean
    lineNumbers: boolean
    theme: string
  }

  // Terminal Configuration
  terminal: {
    shell: string
    fontSize: number
  }

  // UI Configuration
  ui: {
    showPet: boolean
    petMood: number
    sidebarView: string
  }

  // Custom providers (user-defined)
  customProviders: Array<{
    id: string
    name: string
    type: 'openai' | 'claude' | 'custom'
    baseURL: string
    apiKey: string
    models: Array<{
      id: string
      name: string
    }>
    headers?: Record<string, string>
  }>
}

const defaultSettings: AppSettingsData = {
  providers: [],
  activeConfig: {
    providerId: 'claude',
    modelId: 'claude-sonnet-4-20250514',
    temperature: 0.7,
    maxTokens: 4096,
    systemPrompt: `You are an AI coding assistant integrated into Claude Studio IDE.
You help users write, understand, and debug code.
When providing code, use markdown code blocks with language identifiers.
Be concise and helpful.`,
  },
  editor: {
    fontSize: 14,
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
    tabSize: 2,
    wordWrap: 'off',
    minimap: true,
    lineNumbers: true,
    theme: 'claude-dark',
  },
  terminal: {
    shell: process.platform === 'win32' ? 'powershell.exe' : '/bin/bash',
    fontSize: 14,
  },
  ui: {
    showPet: true,
    petMood: 100,
    sidebarView: 'files',
  },
  customProviders: [],
}

function getSettingsPath(): string | null {
  if (!path) return null

  // Use app data directory
  const home = process.env.HOME || process.env.USERPROFILE || ''
  if (process.platform === 'win32') {
    return path.join(process.env.APPDATA || home, 'Claude-Studio', 'settings.json')
  }
  return path.join(home, '.config', 'claude-studio', 'settings.json')
}

export async function loadSettings(): Promise<AppSettingsData> {
  const settingsPath = getSettingsPath()
  if (!settingsPath || !fs) return defaultSettings

  try {
    const exists = await fs.promises.access(settingsPath).then(() => true).catch(() => false)
    if (!exists) return defaultSettings

    const content = await fs.promises.readFile(settingsPath, 'utf-8')
    const loaded = JSON.parse(content)

    // Merge with defaults
    return {
      ...defaultSettings,
      ...loaded,
      activeConfig: { ...defaultSettings.activeConfig, ...loaded.activeConfig },
      editor: { ...defaultSettings.editor, ...loaded.editor },
      terminal: { ...defaultSettings.terminal, ...loaded.terminal },
      ui: { ...defaultSettings.ui, ...loaded.ui },
    }
  } catch (err) {
    console.error('Failed to load settings:', err)
    return defaultSettings
  }
}

export async function saveSettings(settings: AppSettingsData): Promise<void> {
  const settingsPath = getSettingsPath()
  if (!settingsPath || !fs) return

  try {
    const dir = path.dirname(settingsPath)
    await fs.promises.mkdir(dir, { recursive: true })
    await fs.promises.writeFile(settingsPath, JSON.stringify(settings, null, 2), 'utf-8')
  } catch (err) {
    console.error('Failed to save settings:', err)
  }
}

export function getDefaultSettings(): AppSettingsData {
  return defaultSettings
}

// ─── Environment Variable Support ────────────────────
// Users can set API keys via environment variables
export function getEnvApiKey(providerId: string): string | undefined {
  const envMap: Record<string, string> = {
    'claude': 'ANTHROPIC_API_KEY',
    'openai': 'OPENAI_API_KEY',
    'deepseek': 'DEEPSEEK_API_KEY',
    'xiaomi-mimo': 'XIAOMI_MIMO_API_KEY',
    'zhipu': 'ZHIPU_API_KEY',
    'qwen': 'DASHSCOPE_API_KEY',
    'moonshot': 'MOONSHOT_API_KEY',
    'doubao': 'ARK_API_KEY',
    'minimax': 'MINIMAX_API_KEY',
  }

  const envKey = envMap[providerId]
  if (!envKey) return undefined

  // Check process.env (Electron main) or window.env
  return process.env?.[envKey] || (window as any).env?.[envKey]
}

// ─── Import from Claude Code ─────────────────────────
// Try to read Claude Code's settings for API key
export async function importClaudeCodeSettings(): Promise<string | null> {
  if (!fs || !path) return null

  try {
    const home = process.env.HOME || process.env.USERPROFILE || ''
    let claudeConfigPath: string

    if (process.platform === 'win32') {
      claudeConfigPath = path.join(home, '.claude', 'settings.json')
    } else {
      claudeConfigPath = path.join(home, '.claude', 'settings.json')
    }

    const exists = await fs.promises.access(claudeConfigPath).then(() => true).catch(() => false)
    if (!exists) return null

    const content = await fs.promises.readFile(claudeConfigPath, 'utf-8')
    const config = JSON.parse(content)

    // Claude Code stores API key in different formats
    return config.apiKey || config.anthropicApiKey || null
  } catch {
    return null
  }
}
