import { ipcRenderer, contextBridge } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  minimize: () => ipcRenderer.send('minimize-window'),
  maximize: () => ipcRenderer.send('maximize-window'),
  close: () => ipcRenderer.send('close-window'),

  // File dialogs
  openFolderDialog: () => ipcRenderer.invoke('open-folder-dialog'),
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
  saveFileDialog: (defaultPath?: string) => ipcRenderer.invoke('save-file-dialog', defaultPath),

  // File operations
  readFile: (path: string) => ipcRenderer.invoke('read-file', path),
  writeFile: (path: string, content: string) => ipcRenderer.invoke('write-file', path, content),
  readDir: (path: string) => ipcRenderer.invoke('read-dir', path),
  createFile: (dir: string, name: string) => ipcRenderer.invoke('create-file', dir, name),
  createDir: (dir: string, name: string) => ipcRenderer.invoke('create-dir', dir, name),
  deleteFile: (path: string) => ipcRenderer.invoke('delete-file', path),
  renameFile: (oldPath: string, newName: string) => ipcRenderer.invoke('rename-file', oldPath, newName),
  fileExists: (path: string) => ipcRenderer.invoke('file-exists', path),

  // Git
  gitStatus: (repoPath: string) => ipcRenderer.invoke('git-status', repoPath),
  gitCommit: (repoPath: string, message: string) => ipcRenderer.invoke('git-commit', repoPath, message),
  gitDiff: (repoPath: string, file?: string) => ipcRenderer.invoke('git-diff', repoPath, file),
  gitStage: (repoPath: string, file: string) => ipcRenderer.invoke('git-stage', repoPath, file),
  gitUnstage: (repoPath: string, file: string) => ipcRenderer.invoke('git-unstage', repoPath, file),
  gitStageAll: (repoPath: string) => ipcRenderer.invoke('git-stage-all', repoPath),
  gitLog: (repoPath: string, count?: number) => ipcRenderer.invoke('git-log', repoPath, count),

  // Shell
  execCommand: (cmd: string, cwd: string) => ipcRenderer.invoke('exec-command', cmd, cwd),

  // External
  openExternal: (url: string) => ipcRenderer.send('open-external', url),
  openInExplorer: (path: string) => ipcRenderer.send('open-in-explorer', path),
})
