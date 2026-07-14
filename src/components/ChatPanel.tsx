import { useState } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ChatPanelProps {
  active: boolean
  onSwitch: () => void
}

const ChatPanel = ({ active, onSwitch }: ChatPanelProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '你好！我是 Claude，有什么可以帮助你的吗？'
    }
  ])
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (!input.trim()) return

    const userMessage: Message = { role: 'user', content: input }
    setMessages([...messages, userMessage])
    setInput('')

    // 模拟 Claude 响应
    setTimeout(() => {
      const assistantMessage: Message = {
        role: 'assistant',
        content: '我收到了你的消息。在完整版本中，这里会连接到 Claude API 来提供真正的 AI 辅助编程。'
      }
      setMessages(prev => [...prev, assistantMessage])
    }, 1000)
  }

  return (
    <div className={`w-96 flex flex-col border-l border-[#30363d] ${active ? 'flex' : 'hidden'}`}>
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-[#58a6ff]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
            <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
          </svg>
          <span className="panel-title">Claude Chat</span>
        </div>
        <button className="btn-icon" title="新对话">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-4 py-2.5 ${
                msg.role === 'user'
                  ? 'bg-[#238636] text-white'
                  : 'bg-[#161b22] border border-[#30363d]'
              }`}
            >
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                {msg.content}
              </pre>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-[#30363d]">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="输入你的问题..."
            className="input-field resize-none h-20"
          />
          <button onClick={handleSend} className="btn-primary self-end">
            发送
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatPanel
