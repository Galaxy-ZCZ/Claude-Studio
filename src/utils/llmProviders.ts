// ─── LLM Provider System ─────────────────────────────
// Universal LLM provider supporting OpenAI-compatible & Anthropic-compatible APIs
// Users can configure ANY model via API key + model name

export type ProviderType = 'openai' | 'anthropic'

export interface LLMProvider {
  id: string
  name: string
  type: ProviderType
  baseURL: string
  apiKey: string
  models: string[] // Model IDs - can be anything the user inputs
  headers?: Record<string, string>
}

export interface LLMConfig {
  providerId: string
  modelId: string // Can be ANY string - user input
  temperature: number
  maxTokens: number
  systemPrompt: string
}

export interface LLMMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface StreamCallbacks {
  onToken: (token: string) => void
  onComplete: () => void
  onError: (error: Error) => void
}

// ─── Popular Providers (presets for quick setup) ─────
export const presetProviders: Array<{
  id: string
  name: string
  type: ProviderType
  baseURL: string
  models: string[]
}> = [
  // ─── OpenAI Compatible ───
  {
    id: 'openai',
    name: 'OpenAI',
    type: 'openai',
    baseURL: 'https://api.openai.com/v1',
    models: ['gpt-4o', 'gpt-4o-mini', 'o1', 'o1-mini', 'o1-pro', 'o3', 'o3-mini', 'o4-mini', 'gpt-4.1', 'gpt-4.1-mini', 'gpt-4.1-nano'],
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    type: 'openai',
    baseURL: 'https://api.deepseek.com/v1',
    models: ['deepseek-chat', 'deepseek-coder', 'deepseek-reasoner', 'deepseek-r1'],
  },
  {
    id: 'xiaomi-mimo',
    name: 'Xiaomi MiMo',
    type: 'openai',
    baseURL: 'https://api.xiaomi.com/v1',
    models: ['mimo-v2-pro', 'mimo-v2-flash', 'MiMo-GPT-4o', 'MiMo-7B-RL'],
  },
  {
    id: 'zhipu',
    name: 'Zhipu AI (智谱)',
    type: 'openai',
    baseURL: 'https://open.bigmodel.cn/api/paas/v4',
    models: ['glm-4-plus', 'glm-4-flash', 'glm-4-long', 'glm-4v-plus', 'glm-4v-flash', 'glm-z1-air', 'glm-z1-airx', 'glm-z1-flash'],
  },
  {
    id: 'qwen',
    name: 'Alibaba Qwen (通义)',
    type: 'openai',
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    models: ['qwen-max', 'qwen-plus', 'qwen-turbo', 'qwen-coder-plus', 'qwq-plus', 'qwq-max', 'qwen3-235b-a22b', 'qwen3-32b', 'qwen3-8b'],
  },
  {
    id: 'moonshot',
    name: 'Moonshot AI (月之暗面)',
    type: 'openai',
    baseURL: 'https://api.moonshot.cn/v1',
    models: ['moonshot-v1-128k', 'moonshot-v1-32k', 'moonshot-v1-8k', 'kimi-latest'],
  },
  {
    id: 'doubao',
    name: 'ByteDance Doubao (豆包)',
    type: 'openai',
    baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
    models: ['doubao-1.5-pro-256k', 'doubao-1.5-pro-32k', 'doubao-1.5-lite-32k', 'doubao-pro-128k', 'doubao-lite-128k'],
  },
  {
    id: 'minimax',
    name: 'MiniMax',
    type: 'openai',
    baseURL: 'https://api.minimax.chat/v1',
    models: ['MiniMax-Text-01', 'abab6.5-chat', 'abab6.5s-chat', 'MiniMax-M1'],
  },
  {
    id: 'baichuan',
    name: 'Baichuan (百川)',
    type: 'openai',
    baseURL: 'https://api.baichuan-ai.com/v1',
    models: ['Baichuan4', 'Baichuan3-Turbo', 'Baichuan4-Turbo'],
  },
  {
    id: 'yi',
    name: '01.AI (零一万物)',
    type: 'openai',
    baseURL: 'https://api.lingyiwanwu.com/v1',
    models: ['yi-large', 'yi-medium', 'yi-spark', 'yi-large-turbo', 'yi-lightning'],
  },
  {
    id: 'stepfun',
    name: 'StepFun (阶跃星辰)',
    type: 'openai',
    baseURL: 'https://api.stepfun.com/v1',
    models: ['step-2-16k', 'step-2-16k-exp', 'step-1-flash', 'step-1v-8k'],
  },
  {
    id: 'spark',
    name: 'iFlytek Spark (讯飞星火)',
    type: 'openai',
    baseURL: 'https://spark-api-open.xf-yun.com/v1',
    models: ['generalv3.5', 'generalv3', '4.0Ultra', 'max-32k'],
  },
  {
    id: 'internlm',
    name: 'InternLM (书生)',
    type: 'openai',
    baseURL: 'https://internlm-chat.intern-ai.org.cn/puyu/api/v1',
    models: ['internlm2.5-latest', 'internlm2-latest'],
  },
  {
    id: 'groq',
    name: 'Groq',
    type: 'openai',
    baseURL: 'https://api.groq.com/openai/v1',
    models: ['llama-4-maverick-17b-128e-instruct', 'llama-4-scout-17b-16e-instruct', 'llama3-70b-8192', 'llama3-8b-8192', 'mixtral-8x7b-32768', 'gemma2-9b-it'],
  },
  {
    id: 'together',
    name: 'Together AI',
    type: 'openai',
    baseURL: 'https://api.together.xyz/v1',
    models: ['meta-llama/Llama-4-Maverick-17B-128E-Instruct', 'meta-llama/Llama-4-Scout-17B-16E-Instruct', 'meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo', 'deepseek-ai/DeepSeek-R1', 'Qwen/Qwen3-235B-A22B'],
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    type: 'openai',
    baseURL: 'https://openrouter.ai/api/v1',
    models: ['anthropic/claude-sonnet-4', 'google/gemini-2.5-pro-preview', 'meta-llama/llama-4-maverick', 'deepseek/deepseek-r1', 'qwen/qwen3-235b-a22b'],
  },
  {
    id: 'siliconflow',
    name: 'SiliconFlow (硅基流动)',
    type: 'openai',
    baseURL: 'https://api.siliconflow.cn/v1',
    models: ['deepseek-ai/DeepSeek-R1', 'deepseek-ai/DeepSeek-V3', 'Qwen/Qwen3-235B-A22B', 'THUDM/GLM-Z1-32B-0414', 'Pro/deepseek-ai/DeepSeek-R1'],
  },
  {
    id: 'ollama',
    name: 'Ollama (Local)',
    type: 'openai',
    baseURL: 'http://localhost:11434/v1',
    models: ['llama3.3', 'qwen3', 'deepseek-r1', 'codellama', 'mistral', 'gemma3', 'phi4'],
  },
  {
    id: 'lmstudio',
    name: 'LM Studio (Local)',
    type: 'openai',
    baseURL: 'http://localhost:1234/v1',
    models: [],
  },
  {
    id: 'vllm',
    name: 'vLLM (Local)',
    type: 'openai',
    baseURL: 'http://localhost:8000/v1',
    models: [],
  },

  // ─── Anthropic Compatible ───
  {
    id: 'claude',
    name: 'Anthropic Claude',
    type: 'anthropic',
    baseURL: 'https://api.anthropic.com/v1',
    models: ['claude-opus-4-20250514', 'claude-sonnet-4-20250514', 'claude-haiku-4-20250514', 'claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229'],
  },
]

// ─── Default Config ──────────────────────────────────
export const defaultConfig: LLMConfig = {
  providerId: 'claude',
  modelId: 'claude-sonnet-4-20250514',
  temperature: 0.7,
  maxTokens: 8192,
  systemPrompt: `You are an AI coding assistant integrated into Claude Studio IDE.
You help users write, understand, and debug code.
When providing code, use markdown code blocks with language identifiers.
Be concise and helpful.`,
}

// ─── Provider Manager ────────────────────────────────
export class LLMProviderManager {
  private providers: Map<string, LLMProvider>
  private config: LLMConfig

  constructor() {
    this.providers = new Map()
    this.config = { ...defaultConfig }

    // Load presets
    for (const preset of presetProviders) {
      this.providers.set(preset.id, {
        ...preset,
        apiKey: '',
      })
    }
  }

  // ─── Load/Save ───────────────────────────────────
  loadSettings(settings: any) {
    if (settings.providers) {
      for (const [id, data] of Object.entries(settings.providers) as [string, any][]) {
        const existing = this.providers.get(id)
        if (existing) {
          existing.apiKey = data.apiKey || existing.apiKey
          if (data.models?.length) existing.models = data.models
          if (data.baseURL) existing.baseURL = data.baseURL
        } else {
          // Custom provider
          this.providers.set(id, {
            id,
            name: data.name || id,
            type: data.type || 'openai',
            baseURL: data.baseURL || '',
            apiKey: data.apiKey || '',
            models: data.models || [],
            headers: data.headers,
          })
        }
      }
    }
    if (settings.activeConfig) {
      this.config = { ...this.config, ...settings.activeConfig }
    }
  }

  toSettings() {
    const providers: Record<string, any> = {}
    for (const [id, p] of this.providers) {
      providers[id] = {
        apiKey: p.apiKey,
        baseURL: p.baseURL,
        type: p.type,
        models: p.models,
        name: p.name,
        headers: p.headers,
      }
    }
    return {
      providers,
      activeConfig: this.config,
    }
  }

  // ─── Provider CRUD ───────────────────────────────
  getProviders(): LLMProvider[] {
    return Array.from(this.providers.values())
  }

  getProvider(id: string): LLMProvider | undefined {
    return this.providers.get(id)
  }

  getActiveProvider(): LLMProvider | undefined {
    return this.providers.get(this.config.providerId)
  }

  setActiveProvider(id: string) {
    if (this.providers.has(id)) {
      this.config.providerId = id
    }
  }

  updateProvider(id: string, updates: Partial<LLMProvider>) {
    const p = this.providers.get(id)
    if (p) Object.assign(p, updates)
  }

  addProvider(provider: LLMProvider) {
    this.providers.set(provider.id, provider)
  }

  removeProvider(id: string) {
    // Don't remove presets, just clear API key
    const p = this.providers.get(id)
    if (p) p.apiKey = ''
  }

  // ─── Config ──────────────────────────────────────
  getConfig(): LLMConfig {
    return { ...this.config }
  }

  updateConfig(updates: Partial<LLMConfig>) {
    Object.assign(this.config, updates)
  }

  // ─── API Calls ───────────────────────────────────
  async sendMessage(
    messages: LLMMessage[],
    callbacks: StreamCallbacks
  ): Promise<void> {
    const provider = this.getActiveProvider()
    if (!provider) {
      callbacks.onError(new Error('No provider selected'))
      return
    }

    if (!provider.apiKey && provider.type !== 'openai') {
      // Ollama/LM Studio etc. don't need API key
      const needsKey = !['ollama', 'lmstudio', 'vllm'].includes(provider.id)
      if (needsKey) {
        callbacks.onError(new Error(`API key not configured for ${provider.name}. Go to Settings to add your API key.`))
        return
      }
    }

    try {
      if (provider.type === 'anthropic') {
        await this.sendAnthropicMessage(provider, messages, callbacks)
      } else {
        await this.sendOpenAIMessage(provider, messages, callbacks)
      }
    } catch (error) {
      callbacks.onError(error instanceof Error ? error : new Error(String(error)))
    }
  }

  private async sendAnthropicMessage(
    provider: LLMProvider,
    messages: LLMMessage[],
    callbacks: StreamCallbacks
  ) {
    const systemMessage = messages.find(m => m.role === 'system')
    const chatMessages = messages.filter(m => m.role !== 'system')

    const body: any = {
      model: this.config.modelId,
      max_tokens: this.config.maxTokens,
      messages: chatMessages.map(m => ({
        role: m.role,
        content: m.content,
      })),
      stream: true,
    }

    const systemPrompt = systemMessage?.content || this.config.systemPrompt
    if (systemPrompt) {
      body.system = systemPrompt
    }

    if (this.config.temperature !== undefined) {
      body.temperature = this.config.temperature
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-api-key': provider.apiKey,
      'anthropic-version': '2023-06-01',
      ...provider.headers,
    }

    // Enable direct browser access for development
    headers['anthropic-dangerous-direct-browser-access'] = 'true'

    const baseURL = provider.baseURL.replace(/\/+$/, '')
    const response = await fetch(`${baseURL}/messages`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`Anthropic API Error ${response.status}: ${errText}`)
    }

    await this.handleSSEStream(response, callbacks, 'anthropic')
  }

  private async sendOpenAIMessage(
    provider: LLMProvider,
    messages: LLMMessage[],
    callbacks: StreamCallbacks
  ) {
    const apiMessages: any[] = []
    const systemPrompt = this.config.systemPrompt || messages.find(m => m.role === 'system')?.content
    if (systemPrompt) {
      apiMessages.push({ role: 'system', content: systemPrompt })
    }
    for (const msg of messages) {
      if (msg.role !== 'system') {
        apiMessages.push({ role: msg.role, content: msg.content })
      }
    }

    const body: any = {
      model: this.config.modelId,
      messages: apiMessages,
      max_tokens: this.config.maxTokens,
      stream: true,
    }

    if (this.config.temperature !== undefined) {
      body.temperature = this.config.temperature
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...provider.headers,
    }

    // Some providers need Bearer, some don't
    if (provider.apiKey) {
      headers['Authorization'] = `Bearer ${provider.apiKey}`
    }

    const baseURL = provider.baseURL.replace(/\/+$/, '')
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
    format: 'anthropic' | 'openai'
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
        const trimmed = line.trim()
        if (!trimmed.startsWith('data: ')) continue
        const data = trimmed.slice(6)
        if (data === '[DONE]') continue

        try {
          const parsed = JSON.parse(data)

          if (format === 'anthropic') {
            if (parsed.type === 'content_block_delta') {
              const text = parsed.delta?.text
              if (text) callbacks.onToken(text)
            }
          } else {
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
}

// ─── Singleton ───────────────────────────────────────
let manager: LLMProviderManager | null = null

export function getLLMManager(): LLMProviderManager {
  if (!manager) {
    manager = new LLMProviderManager()
  }
  return manager
}
