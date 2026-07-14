# 贡献指南

感谢你对 Claude Studio 项目的关注！以下是参与贡献的指南。

## 开发环境设置

### 前置要求

- Node.js 18+ 
- npm 9+
- Git

### 克隆项目

```bash
git clone https://github.com/你的用户名/Claude-Studio.git
cd Claude-Studio
```

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run electron:dev
```

## 项目结构

```
Claude-Studio/
├── electron/              # Electron 主进程
│   ├── main/             # 主进程入口
│   │   └── index.ts      # 窗口创建、IPC 通信
│   └── preload/          # 预加载脚本
│       └── index.ts      # 安全的 API 暴露
├── src/                  # React 前端代码
│   ├── components/       # UI 组件
│   │   ├── TitleBar.tsx    # 标题栏
│   │   ├── Sidebar.tsx     # 侧边栏
│   │   ├── CodeEditor.tsx  # 代码编辑器
│   │   ├── ChatPanel.tsx   # AI 对话面板
│   │   ├── Terminal.tsx    # 终端
│   │   └── StatusBar.tsx   # 状态栏
│   ├── styles/          # 样式文件
│   │   └── index.css    # 全局样式 + Tailwind
│   ├── App.tsx          # 主应用组件
│   └── main.tsx         # React 入口
├── package.json         # 项目配置
├── vite.config.ts       # Vite 配置
├── tailwind.config.js   # Tailwind 配置
└── tsconfig.json        # TypeScript 配置
```

## 开发规范

### 代码风格

- 使用 TypeScript 严格模式
- 组件使用函数式组件 + Hooks
- 样式使用 Tailwind CSS
- 保持代码简洁，添加必要注释

### 提交规范

使用 Conventional Commits 规范：

```
feat: 添加新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
test: 测试相关
chore: 构建/工具链更新
```

### 分支管理

- `main` - 稳定版本
- `develop` - 开发分支
- `feature/*` - 功能分支
- `fix/*` - 修复分支

## 功能开发

### 添加新组件

1. 在 `src/components/` 创建新组件
2. 在 `App.tsx` 中引入使用
3. 添加必要的样式

### 连接 Claude API

1. 在 `src/utils/` 创建 API 工具函数
2. 在 `.env` 中配置 API Key
3. 在 ChatPanel 中集成调用

## 构建打包

### Windows

```bash
npm run electron:build
```

生成的安装包在 `release/` 目录。

### 其他平台

修改 `package.json` 中的 `build` 配置。

## 问题反馈

- 使用 GitHub Issues 提交问题
- 提供详细的复现步骤
- 附上错误截图或日志

## 联系方式

- Issues: 项目 Issues 页面
- Discussions: 项目讨论区

再次感谢你的贡献！🎉
