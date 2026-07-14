const StatusBar = () => {
  return (
    <div className="h-6 flex items-center justify-between px-4 bg-[#161b22] border-t border-[#30363d] text-xs text-[#484f58]">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#238636]" />
          <span>已连接</span>
        </div>
        <span>main</span>
        <span>✓ 0</span>
        <span>⚠ 0</span>
      </div>

      <div className="flex items-center gap-4">
        <span>Ln 1, Col 1</span>
        <span>Spaces: 2</span>
        <span>UTF-8</span>
        <span>TypeScript</span>
        <span>Claude Ready</span>
      </div>
    </div>
  )
}

export default StatusBar
