import { ChatMessage } from '../store/AppContext'

interface ClaudeConfig {
  apiKey: string
  model: string
  maxTokens: number
  systemPrompt: string
}

interface StreamCallbacks {
  onToken: (token: string) => void
  onComplete: () => void
  onError: (error: Error) => void
}

export class ClaudeAPI {
  private config: ClaudeConfig

  constructor(config: ClaudeConfig) {
    this.config = config
  }

  updateConfig(config: Partial<ClaudeConfig>) {
    this.config = { ...this.config, ...config }
  }

  async sendMessage(
    message: string,
    history: ChatMessage[],
    codeContext: string | undefined,
    callbacks: StreamCallbacks
  ): Promise<void> {
    if (!this.config.apiKey) {
      callbacks.onError(new Error('API key not configured. Go to Settings to add your Claude API key.'))
      return
    }

    // Build messages array
    const messages = this.buildMessages(message, history, codeContext)

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: this.config.model,
          max_tokens: this.config.maxTokens,
          system: this.config.systemPrompt,
          messages,
          stream: true,
        }),
      })

      if (!response.ok) {
        const errBody = await response.text()
        throw new Error(`API Error ${response.status}: ${errBody}`)
      }

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
          const data = line.slice(6)
          if (data === '[DONE]') continue

          try {
            const parsed = JSON.parse(data)
            if (parsed.type === 'content_block_delta') {
              const text = parsed.delta?.text
              if (text) {
                callbacks.onToken(text)
              }
            }
          } catch {
            // skip malformed chunks
          }
        }
      }

      callbacks.onComplete()
    } catch (error) {
      callbacks.onError(error instanceof Error ? error : new Error(String(error)))
    }
  }

  private buildMessages(
    currentMessage: string,
    history: ChatMessage[],
    codeContext?: string
  ): Array<{ role: 'user' | 'assistant'; content: string }> {
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = []

    // Add recent history (last 20 messages)
    const recentHistory = history.slice(-20)
    for (const msg of recentHistory) {
      if (msg.role === 'user' || msg.role === 'assistant') {
        messages.push({
          role: msg.role,
          content: msg.content,
        })
      }
    }

    // Build current message with optional code context
    let content = currentMessage
    if (codeContext) {
      content = `\`\`\`\n${codeContext}\n\`\`\`\n\n${currentMessage}`
    }

    messages.push({ role: 'user', content })
    return messages
  }

  // Non-streaming fallback
  async sendMessageSync(
    message: string,
    history: ChatMessage[],
    codeContext?: string
  ): Promise<string> {
    if (!this.config.apiKey) {
      throw new Error('API key not configured')
    }

    const messages = this.buildMessages(message, history, codeContext)

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: this.config.model,
        max_tokens: this.config.maxTokens,
        system: this.config.systemPrompt,
        messages,
      }),
    })

    if (!response.ok) {
      throw new Error(`API Error ${response.status}`)
    }

    const data = await response.json()
    return data.content?.[0]?.text || ''
  }
}

let instance: ClaudeAPI | null = null

export function getClaudeAPI(config?: ClaudeConfig): ClaudeAPI {
  if (!instance && config) {
    instance = new ClaudeAPI(config)
  } else if (instance && config) {
    instance.updateConfig(config)
  }
  if (!instance) {
    instance = new ClaudeAPI({
      apiKey: '',
      model: 'claude-sonnet-4-20250514',
      maxTokens: 4096,
      systemPrompt: '',
    })
  }
  return instance
}
