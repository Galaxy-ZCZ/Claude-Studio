// ─── LLM Provider System ─────────────────────────────
// Supports multiple API formats: OpenAI-compatible, Claude, custom

export interface LLMProvider {
  id: string
  name: string
  type: 'openai' | 'claude' | 'custom'
  baseURL: string
  apiKey: string
  models: LLMModel[]
  headers?: Record<string, string>
}

export interface LLMModel {
  id: string
  name: string
  contextLength?: number
  maxOutput?: number
}

export interface LLMMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface LLMConfig {
  providerId: string
  modelId: string
  temperature?: number
  maxTokens?: number
  systemPrompt?: string
}

export interface StreamCallbacks {
  onToken: (token: string) => void
  onComplete: () => void
  onError: (error: Error) => void
}

// ─── Default Providers ───────────────────────────────
export const defaultProviders: LLMProvider[] = [
  {
    id: 'claude',
    name: 'Anthropic Claude',
    type: 'claude',
    baseURL: 'https://api.anthropic.com/v1',
    apiKey: '',
    models: [
      { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', contextLength: 200000, maxOutput: 8192 },
      { id: 'claude-opus-4-20250514', name: 'Claude Opus 4', contextLength: 200000, maxOutput: 8192 },
      { id: 'claude-haiku-4-20250514', name: 'Claude Haiku 4', contextLength: 200000, maxOutput: 8192 },
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', contextLength: 200000, maxOutput: 8192 },
    ],
  },
  {
    id: 'openai',
    name: 'OpenAI',
    type: 'openai',
    baseURL: 'https://api.openai.com/v1',
    apiKey: '',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', contextLength: 128000, maxOutput: 4096 },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', contextLength: 128000, maxOutput: 4096 },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', contextLength: 128000, maxOutput: 4096 },
      { id: 'o1-preview', name: 'o1-preview', contextLength: 128000, maxOutput: 32768 },
    ],
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    type: 'openai',
    baseURL: 'https://api.deepseek.com/v1',
    apiKey: '',
    models: [
      { id: 'deepseek-chat', name: 'DeepSeek Chat', contextLength: 64000, maxOutput: 4096 },
      { id: 'deepseek-coder', name: 'DeepSeek Coder', contextLength: 64000, maxOutput: 4096 },
      { id: 'deepseek-reasoner', name: 'DeepSeek Reasoner', contextLength: 64000, maxOutput: 4096 },
    ],
  },
  {
    id: 'xiaomi-mimo',
    name: 'Xiaomi MiMo',
    type: 'openai',
    baseURL: 'https://api.xiaomi.com/v1',
    apiKey: '',
    models: [
      { id: 'mimo-v2-pro', name: 'MiMo V2 Pro', contextLength: 128000, maxOutput: 4096 },
      { id: 'mimo-v2-flash', name: 'MiMo V2 Flash', contextLength: 128000, maxOutput: 4096 },
    ],
  },
  {
    id: 'zhipu',
    name: 'Zhipu AI (智谱)',
    type: 'openai',
    baseURL: 'https://open.bigmodel.cn/api/paas/v4',
    apiKey: '',
    models: [
      { id: 'glm-4-plus', name: 'GLM-4 Plus', contextLength: 128000, maxOutput: 4096 },
      { id: 'glm-4-flash', name: 'GLM-4 Flash', contextLength: 128000, maxOutput: 4096 },
      { id: 'glm-4-long', name: 'GLM-4 Long', contextLength: 1000000, maxOutput: 4096 },
    ],
  },
  {
    id: 'qwen',
    name: 'Alibaba Qwen (通义)',
    type: 'openai',
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    apiKey: '',
    models: [
      { id: 'qwen-max', name: 'Qwen Max', contextLength: 32000, maxOutput: 4096 },
      { id: 'qwen-plus', name: 'Qwen Plus', contextLength: 131072, maxOutput: 4096 },
      { id: 'qwen-turbo', name: 'Qwen Turbo', contextLength: 131072, maxOutput: 4096 },
      { id: 'qwen-coder-plus', name: 'Qwen Coder Plus', contextLength: 131072, maxOutput: 4096 },
    ],
  },
  {
    id: 'moonshot',
    name: 'Moonshot AI (月之暗面)',
    type: 'openai',
    baseURL: 'https://api.moonshot.cn/v1',
    apiKey: '',
    models: [
      { id: 'moonshot-v1-128k', name: 'Moonshot V1 128K', contextLength: 128000, maxOutput: 4096 },
      { id: 'moonshot-v1-32k', name: 'Moonshot V1 32K', contextLength: 32000, maxOutput: 4096 },
      { id: 'moonshot-v1-8k', name: 'Moonshot V1 8K', contextLength: 8000, maxOutput: 4096 },
    ],
  },
  {
    id: 'doubao',
    name: 'ByteDance Doubao (豆包)',
    type: 'openai',
    baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
    apiKey: '',
    models: [
      { id: 'doubao-pro-128k', name: 'Doubao Pro 128K', contextLength: 128000, maxOutput: 4096 },
      { id: 'doubao-lite-128k', name: 'Doubao Lite 128K', contextLength: 128000, maxOutput: 4096 },
    ],
  },
  {
    id: 'minimax',
    name: 'MiniMax',
    type: 'openai',
    baseURL: 'https://api.minimax.chat/v1',
    apiKey: '',
    models: [
      { id: 'abab6.5-chat', name: 'Abab 6.5 Chat', contextLength: 32000, maxOutput: 4096 },
      { id: 'abab6.5s-chat', name: 'Abab 6.5s Chat', contextLength: 32000, maxOutput: 4096 },
    ],
  },
  {
    id: 'custom',
    name: 'Custom Provider',
    type: 'openai',
    baseURL: '',
    apiKey: '',
    models: [],
  },
]

// ─── Provider Manager ────────────────────────────────
export class LLMProviderManager {
  private providers: LLMProvider[]
  private activeConfig: LLMConfig

  constructor() {
    this.providers = [...defaultProviders]
    this.activeConfig = {
      providerId: 'claude',
      modelId: 'claude-sonnet-4-20250514',
      temperature: 0.7,
      maxTokens: 4096,
      systemPrompt: `You are Claude, an AI assistant integrated into Claude Studio IDE.
You help users write, understand, and debug code.
When providing code, use markdown code blocks with language identifiers.
Be concise and helpful.`,
    }
  }

  // Load from settings
  loadSettings(settings: any) {
    if (settings.providers) {
      // Merge custom providers with defaults
      for (const provider of settings.providers) {
        const existing = this.providers.find(p => p.id === provider.id)
        if (existing) {
          Object.assign(existing, provider)
        } else {
          this.providers.push(provider)
        }
      }
    }
    if (settings.activeConfig) {
      this.activeConfig = { ...this.activeConfig, ...settings.activeConfig }
    }
  }

  // Save settings
  toSettings() {
    return {
      providers: this.providers.map(p => ({
        id: p.id,
        apiKey: p.apiKey,
        baseURL: p.baseURL,
        models: p.models,
      })),
      activeConfig: this.activeConfig,
    }
  }

  getProviders(): LLMProvider[] {
    return this.providers
  }

  getProvider(id: string): LLMProvider | undefined {
    return this.providers.find(p => p.id === id)
  }

  getActiveProvider(): LLMProvider | undefined {
    return this.providers.find(p => p.id === this.activeConfig.providerId)
  }

  getActiveModel(): LLMModel | undefined {
    const provider = this.getActiveProvider()
    return provider?.models.find(m => m.id === this.activeConfig.modelId)
  }

  getActiveConfig(): LLMConfig {
    return this.activeConfig
  }

  setActiveConfig(config: Partial<LLMConfig>) {
    this.activeConfig = { ...this.activeConfig, ...config }
  }

  updateProvider(id: string, updates: Partial<LLMProvider>) {
    const provider = this.providers.find(p => p.id === id)
    if (provider) {
      Object.assign(provider, updates)
    }
  }

  addProvider(provider: LLMProvider) {
    const existing = this.providers.find(p => p.id === provider.id)
    if (existing) {
      Object.assign(existing, provider)
    } else {
      this.providers.push(provider)
    }
  }

  removeProvider(id: string) {
    if (id === 'custom') return // Can't remove custom
    this.providers = this.providers.filter(p => p.id !== id)
  }

  // ─── API Calls ─────────────────────────────────────
  async sendMessage(
    messages: LLMMessage[],
    callbacks: StreamCallbacks
  ): Promise<void> {
    const provider = this.getActiveProvider()
    if (!provider) {
      callbacks.onError(new Error('No provider selected'))
      return
    }

    if (!provider.apiKey) {
      callbacks.onError(new Error(`API key not configured for ${provider.name}. Go to Settings to add your API key.`))
      return
    }

    try {
      switch (provider.type) {
        case 'claude':
          await this.sendClaudeMessage(provider, messages, callbacks)
          break
        case 'openai':
        case 'custom':
          await this.sendOpenAIMessage(provider, messages, callbacks)
          break
        default:
          callbacks.onError(new Error(`Unsupported provider type: ${provider.type}`))
      }
    } catch (error) {
      callbacks.onError(error instanceof Error ? error : new Error(String(error)))
    }
  }

  private async sendClaudeMessage(
    provider: LLMProvider,
    messages: LLMMessage[],
    callbacks: StreamCallbacks
  ) {
    const config = this.activeConfig
    const systemMessage = messages.find(m => m.role === 'system')
    const chatMessages = messages.filter(m => m.role !== 'system')

    const body: any = {
      model: config.modelId,
      max_tokens: config.maxTokens || 4096,
      messages: chatMessages.map(m => ({
        role: m.role,
        content: m.content,
      })),
      stream: true,
    }

    if (systemMessage || config.systemPrompt) {
      body.system = systemMessage?.content || config.systemPrompt
    }

    if (config.temperature !== undefined) {
      body.temperature = config.temperature
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-api-key': provider.apiKey,
      'anthropic-version': '2023-06-01',
      ...provider.headers,
    }

    // Enable browser access for development
    if (typeof window !== 'undefined') {
      headers['anthropic-dangerous-direct-browser-access'] = 'true'
    }

    const response = await fetch(`${provider.baseURL}/messages`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`Claude API Error ${response.status}: ${errText}`)
    }

    await this.handleSSEStream(response, callbacks, 'claude')
  }

  private async sendOpenAIMessage(
    provider: LLMProvider,
    messages: LLMMessage[],
    callbacks: StreamCallbacks
  ) {
    const config = this.activeConfig

    // Build messages with system prompt
    const apiMessages: any[] = []
    const systemPrompt = config.systemPrompt || messages.find(m => m.role === 'system')?.content
    if (systemPrompt) {
      apiMessages.push({ role: 'system', content: systemPrompt })
    }
    for (const msg of messages) {
      if (msg.role !== 'system') {
        apiMessages.push({ role: msg.role, content: msg.content })
      }
    }

    const body: any = {
      model: config.modelId,
      messages: apiMessages,
      max_tokens: config.maxTokens || 4096,
      stream: true,
    }

    if (config.temperature !== undefined) {
      body.temperature = config.temperature
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${provider.apiKey}`,
      ...provider.headers,
    }

    const baseURL = provider.baseURL.endsWith('/') ? provider.baseURL.slice(0, -1) : provider.baseURL

    const response = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`API Error ${response.status}: ${errText}`)
    }

    await this.handleSSEStream(response, callbacks, 'openai')
  }

  private async handleSSEStream(
    response: Response,
    callbacks: StreamCallbacks,
    format: 'claude' | 'openai'
  ) {
    const reader = response.body?.getReader()
    if (!reader) throw new Error('No response body')

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const data = line.slice(6).trim()
        if (data === '[DONE]') continue

        try {
          const parsed = JSON.parse(data)

          if (format === 'claude') {
            // Claude format
            if (parsed.type === 'content_block_delta') {
              const text = parsed.delta?.text
              if (text) callbacks.onToken(text)
            }
          } else {
            // OpenAI format
            const delta = parsed.choices?.[0]?.delta
            if (delta?.content) {
              callbacks.onToken(delta.content)
            }
          }
        } catch {
          // Skip malformed chunks
        }
      }
    }

    callbacks.onComplete()
  }

  // Non-streaming version
  async sendMessageSync(messages: LLMMessage[]): Promise<string> {
    return new Promise((resolve, reject) => {
      let result = ''
      this.sendMessage(messages, {
        onToken: (token) => { result += token },
        onComplete: () => resolve(result),
        onError: (error) => reject(error),
      })
    })
  }
}

// ─── Singleton ───────────────────────────────────────
let manager: LLMProviderManager | null = null

export function getLLMManager(): LLMProviderManager {
  if (!manager) {
    manager = new LLMProviderManager()
  }
  return manager
}
