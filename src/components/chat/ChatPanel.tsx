import { useState, useRef, useEffect, useCallback } from 'react'
import { useApp, ChatMessage } from '../../store/AppContext'
import { getLLMManager, LLMMessage } from '../../utils/llmProviders'
import { v4 as uuid } from 'uuid'

export default function ChatPanel() {
  const { state, dispatch } = useApp()
  const [input, setInput] = useState('')
  const messagesRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const streamingRef = useRef(false)

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight
    }
  }, [state.messages])

  const handleSend = useCallback(async () => {
    const text = input.trim()
    if (!text || state.isStreaming) return

    const manager = getLLMManager()
    const config = manager.getConfig()
    const provider = manager.getActiveProvider()

    if (!provider?.apiKey) {
      dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          id: uuid(),
          role: 'system',
          content: `⚠️ API key not configured for ${provider?.name || 'unknown provider'}. Go to Settings to add your API key.`,
          timestamp: Date.now(),
        },
      })
      return
    }

    // Get code context from active editor tab
    const activeTab = state.tabs.find(t => t.id === state.activeTabId)
    const codeContext = activeTab?.content

    // Add user message
    const userMsg: ChatMessage = {
      id: uuid(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
      codeContext: codeContext ? `[File: ${activeTab?.name}]\n${codeContext.slice(0, 3000)}` : undefined,
    }
    dispatch({ type: 'ADD_MESSAGE', payload: userMsg })
    setInput('')

    // Add empty assistant message
    const assistantMsg: ChatMessage = {
      id: uuid(),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    }
    dispatch({ type: 'ADD_MESSAGE', payload: assistantMsg })
    dispatch({ type: 'SET_STREAMING', payload: true })
    streamingRef.current = true

    // Build messages for API
    const apiMessages: LLMMessage[] = []

    // Add system prompt
    if (config.systemPrompt) {
      apiMessages.push({
        role: 'system',
        content: config.systemPrompt,
      })
    }

    // Add code context
    if (codeContext) {
      apiMessages.push({
        role: 'system',
        content: `The user is currently editing a file named "${activeTab?.name}". Here's the content:\n\n\`\`\`\n${codeContext.slice(0, 3000)}\n\`\`\``,
      })
    }

    // Add recent chat history (last 20 messages)
    const recentHistory = state.messages.slice(-20)
    for (const msg of recentHistory) {
      if (msg.role === 'user' || msg.role === 'assistant') {
        apiMessages.push({
          role: msg.role,
          content: msg.content,
        })
      }
    }

    // Add current message
    apiMessages.push({
      role: 'user',
      content: text,
    })

    // Send via LLM manager
    await manager.sendMessage(apiMessages, {
      onToken: (token) => {
        if (streamingRef.current) {
          dispatch({ type: 'UPDATE_LAST_MESSAGE', payload: token })
        }
      },
      onComplete: () => {
        dispatch({ type: 'SET_STREAMING', payload: false })
        streamingRef.current = false
      },
      onError: (error) => {
        dispatch({
          type: 'UPDATE_LAST_MESSAGE',
          payload: `\n\n⚠️ Error: ${error.message}`,
        })
        dispatch({ type: 'SET_STREAMING', payload: false })
        streamingRef.current = false
      },
    })
  }, [input, state.isStreaming, state.messages, state.tabs, state.activeTabId, dispatch])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleNewChat = () => {
    dispatch({ type: 'CLEAR_MESSAGES' })
  }

  const handleInsertCode = (code: string) => {
    const activeTab = state.tabs.find(t => t.id === state.activeTabId)
    if (activeTab) {
      dispatch({
        type: 'UPDATE_TAB_CONTENT',
        payload: { id: activeTab.id, content: activeTab.content + '\n' + code },
      })
    }
  }

  const manager = getLLMManager()
  const activeProvider = manager.getActiveProvider()
  const activeConfig = manager.getConfig()
  const activeModel = activeConfig.modelId

  // Format message content (handle code blocks)
  const formatContent = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g)
    return parts.map((part, i) => {
      if (part.startsWith('```')) {
        const lines = part.split('\n')
        const lang = lines[0].replace('```', '').trim()
        const code = lines.slice(1, -1).join('\n')
        return (
          <div key={i} className="my-2 rounded-md overflow-hidden border border-[#30363d]">
            <div className="flex items-center justify-between px-3 py-1.5 bg-[#161b22] text-xs text-[#8b949e]">
              <span>{lang || 'code'}</span>
              <div className="flex items-center gap-2">
                <button onClick={() => navigator.clipboard.writeText(code)} className="hover:text-[#e6edf3]" title="Copy">📋</button>
                {state.tabs.length > 0 && (
                  <button onClick={() => handleInsertCode(code)} className="hover:text-[#e6edf3]" title="Insert">📥</button>
                )}
              </div>
            </div>
            <pre className="p-3 bg-[#0d1117] text-xs overflow-x-auto"><code>{code}</code></pre>
          </div>
        )
      }
      return (
        <span key={i}>
          {part.split(/(`[^`]+`)/g).map((segment, j) =>
            segment.startsWith('`') && segment.endsWith('`') ? (
              <code key={j} className="bg-[#30363d80] px-1 py-0.5 rounded text-[#58a6ff] text-xs">{segment.slice(1, -1)}</code>
            ) : <span key={j}>{segment}</span>
          )}
        </span>
      )
    })
  }

  return (
    <div className="w-96 flex flex-col border-l border-[#30363d] bg-[#0d1117] shrink-0">
      {/* Header */}
      <div className="panel-header shrink-0">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-[#58a6ff]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
            <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
          </svg>
          <div className="flex flex-col">
            <span className="panel-title">AI Chat</span>
            <span className="text-[10px] text-[#484f58]">
              {activeProvider?.name || 'No provider'} • {activeModel || 'No model'}
            </span>
          </div>
          {state.isStreaming && (
            <span className="text-xs text-[#3fb950] animate-pulse">●</span>
          )}
        </div>
        <button onClick={handleNewChat} className="btn-icon" title="New Chat">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div ref={messagesRef} className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {state.messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-[#484f58] text-xs gap-3">
            <svg className="w-12 h-12 opacity-30" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
            </svg>
            <p className="text-center">Ask AI anything about your code</p>
            <div className="text-center space-y-1">
              <p className="text-[10px]">
                Using: <span className="text-[#58a6ff]">{activeProvider?.name}</span>
              </p>
              <p className="text-[10px]">
                Model: <span className="text-[#58a6ff]">{activeModel || 'Not set'}</span>
              </p>
            </div>
            {!activeProvider?.apiKey && (
              <p className="text-[#d29922] text-center">
                ⚠️ Set API key in Settings first
              </p>
            )}
          </div>
        )}

        {state.messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[90%] rounded-lg px-3 py-2.5 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[#238636] text-white'
                  : msg.role === 'system'
                  ? 'bg-[#1c1e26] border border-[#d2992280] text-[#d29922]'
                  : 'bg-[#161b22] border border-[#30363d] text-[#e6edf3]'
              }`}
            >
              {msg.role === 'assistant' ? (
                <div className="whitespace-pre-wrap break-words">{formatContent(msg.content)}</div>
              ) : (
                <div className="whitespace-pre-wrap break-words">{msg.content}</div>
              )}
              {msg.codeContext && (
                <div className="mt-1.5 text-[10px] opacity-60">
                  📎 Code context attached
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-[#30363d] shrink-0">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={activeProvider?.apiKey ? `Ask ${activeProvider.name}...` : 'Set API key in Settings...'}
            disabled={!activeProvider?.apiKey}
            className="input-field resize-none text-sm h-16 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || state.isStreaming || !activeProvider?.apiKey}
            className="btn-primary self-end disabled:opacity-50 disabled:cursor-not-allowed text-sm py-2 px-3"
          >
            {state.isStreaming ? (
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" strokeDasharray="30 60" />
              </svg>
            ) : (
              'Send'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
