import { useState } from 'react'
import TitleBar from './components/TitleBar'
import Sidebar from './components/Sidebar'
import CodeEditor from './components/CodeEditor'
import ChatPanel from './components/ChatPanel'
import Terminal from './components/Terminal'
import StatusBar from './components/StatusBar'

function App() {
  const [activePanel, setActivePanel] = useState<'chat' | 'terminal'>('chat')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex flex-col h-screen bg-[#0d1117] text-white">
      <TitleBar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <div className="flex-1 flex flex-col">
          <div className="flex-1 flex overflow-hidden">
            <CodeEditor />
            <ChatPanel
              active={activePanel === 'chat'}
              onSwitch={() => setActivePanel('chat')}
            />
          </div>

          <Terminal
            active={activePanel === 'terminal'}
            onSwitch={() => setActivePanel('terminal')}
          />
        </div>
      </div>

      <StatusBar />
    </div>
  )
}

export default App
