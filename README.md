# Claude Studio

一个为 Claude Code 设计的可视化 GUI 桌面应用，参考 Codex 的设计风格。

## ✨ 特性

- 🎨 **现代化 UI** - 参考 Codex 的深色主题设计
- 💻 **代码编辑器** - 语法高亮、代码补全
- 🤖 **AI 对话** - 与 Claude 实时对话，获取编程帮助
- 🖥️ **集成终端** - 内置终端，无需切换窗口
- 📁 **文件管理** - 可视化文件浏览器
- ⚡ **高性能** - 基于 Electron，启动快速

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run electron:dev
```

### 构建应用

```bash
npm run electron:build
```

## 📁 项目结构

```
Claude-Studio/
├── electron/              # Electron 主进程
│   ├── main/             # 主进程代码
│   └── preload/          # 预加载脚本
├── src/                  # React 前端
│   ├── components/       # UI 组件
│   ├── styles/          # 样式文件
│   └── utils/           # 工具函数
├── package.json          # 项目配置
└── README.md            # 项目说明
```

## 🛠️ 技术栈

- **前端**: React 18 + TypeScript + Tailwind CSS
- **桌面框架**: Electron 28
- **构建工具**: Vite
- **包管理**: npm

## 📝 开发计划

- [ ] 集成 Claude API
- [ ] 完善代码编辑器 (Monaco Editor)
- [ ] 添加文件浏览器
- [ ] 支持多标签页
- [ ] 添加主题切换
- [ ] 支持插件扩展

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License
