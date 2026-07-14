import { useState } from 'react'

const CodeEditor = () => {
  const [code] = useState(`// 欢迎使用 Claude Studio
// 在这里编写你的代码，Claude 会帮助你

function fibonacci(n: number): number {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// 调用函数
const result = fibonacci(10);
console.log(\`斐波那契数列第10项: \${result}\`);
`)

  const [activeFile, setActiveFile] = useState('main.ts')

  const files = [
    { name: 'main.ts', language: 'typescript' },
    { name: 'index.html', language: 'html' },
    { name: 'styles.css', language: 'css' },
  ]

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <div className="panel-header">
        <div className="flex items-center gap-2">
          {files.map((file) => (
            <button
              key={file.name}
              onClick={() => setActiveFile(file.name)}
              className={`px-3 py-1.5 text-sm rounded-t-md transition-colors ${
                activeFile === file.name
                  ? 'bg-[#0d1117] text-[#e6edf3] border-b-2 border-[#58a6ff]'
                  : 'text-[#8b949e] hover:text-[#e6edf3]'
              }`}
            >
              {file.name}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-icon" title="保存">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
              <path d="M17 21v-8H7v8M7 3v5h8" />
            </svg>
          </button>
          <button className="btn-icon" title="格式化">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10H7M21 6H3M21 14H3M21 18H7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-[#0d1117] p-4">
        <pre className="font-mono text-sm leading-relaxed">
          <code>{code}</code>
        </pre>
      </div>

      <div className="flex items-center justify-between px-4 py-1.5 bg-[#161b22] border-t border-[#30363d] text-xs text-[#484f58]">
        <span>TypeScript</span>
        <span>UTF-8</span>
        <span>LF</span>
      </div>
    </div>
  )
}

export default CodeEditor
