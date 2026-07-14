/// <reference types="vite/client" />

interface ElectronAPI {
  // Window controls
  minimize: () => void
  maximize: () => void
  close: () => void

  // File dialogs
  openFolderDialog: () => Promise<string | null>
  openFileDialog: () => Promise<{ path: string; content: string } | null>
  saveFileDialog: (defaultPath?: string) => Promise<string | null>

  // File operations
  readFile: (path: string) => Promise<string>
  writeFile: (path: string, content: string) => Promise<void>
  readDir: (path: string) => Promise<Array<{ name: string; path: string; isDirectory: boolean }>>
  createFile: (dir: string, name: string) => Promise<string>
  createDir: (dir: string, name: string) => Promise<string>
  deleteFile: (path: string) => Promise<void>
  renameFile: (oldPath: string, newName: string) => Promise<string>
  fileExists: (path: string) => Promise<boolean>

  // Git
  gitStatus: (repoPath: string) => Promise<{
    branch: string
    ahead: number
    behind: number
    modified: string[]
    staged: string[]
    untracked: string[]
  } | null>
  gitCommit: (repoPath: string, message: string) => Promise<string>
  gitDiff: (repoPath: string, file?: string) => Promise<string>
  gitStage: (repoPath: string, file: string) => Promise<void>
  gitUnstage: (repoPath: string, file: string) => Promise<void>
  gitStageAll: (repoPath: string) => Promise<void>
  gitLog: (repoPath: string, count?: number) => Promise<string[]>

  // Shell
  execCommand: (cmd: string, cwd: string) => Promise<string>

  // External
  openExternal: (url: string) => void
  openInExplorer: (path: string) => void
}

interface Window {
  electronAPI?: ElectronAPI
  require?: (module: string) => any
  monaco?: any
}
