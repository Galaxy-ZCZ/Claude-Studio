interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

const Sidebar = ({ collapsed, onToggle }: SidebarProps) => {
  const menuItems = [
    { icon: '📁', label: '文件', active: true },
    { icon: '🔍', label: '搜索', active: false },
    { icon: '🔀', label: 'Git', active: false },
    { icon: '🐛', label: '调试', active: false },
    { icon: '📦', label: '扩展', active: false },
  ]

  return (
    <div className={`flex flex-col bg-[#161b22] border-r border-[#30363d] transition-all duration-200 ${collapsed ? 'w-12' : 'w-56'}`}>
      <div className="flex-1 py-2">
        {menuItems.map((item) => (
          <button
            key={item.label}
            className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-[#30363d] transition-colors ${
              item.active ? 'bg-[#30363d]' : ''
            }`}
          >
            <span className="text-base">{item.icon}</span>
            {!collapsed && <span className="text-sm">{item.label}</span>}
          </button>
        ))}
      </div>

      <div className="p-2 border-t border-[#30363d]">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center p-2 hover:bg-[#30363d] rounded transition-colors"
        >
          <svg
            className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default Sidebar
