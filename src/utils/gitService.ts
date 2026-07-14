import { GitStatus } from '../store/AppContext'

const { ipcRenderer } = window.require ? window.require('electron') : { ipcRenderer: null }

export async function getGitStatus(repoPath: string): Promise<GitStatus | null> {
  if (ipcRenderer) {
    return ipcRenderer.invoke('git-status', repoPath)
  }
  return null
}

export async function gitCommit(repoPath: string, message: string): Promise<string> {
  if (ipcRenderer) {
    return ipcRenderer.invoke('git-commit', repoPath, message)
  }
  return 'Git not available'
}

export async function gitDiff(repoPath: string, file?: string): Promise<string> {
  if (ipcRenderer) {
    return ipcRenderer.invoke('git-diff', repoPath, file)
  }
  return ''
}

export async function gitStage(repoPath: string, file: string): Promise<void> {
  if (ipcRenderer) {
    return ipcRenderer.invoke('git-stage', repoPath, file)
  }
}

export async function gitUnstage(repoPath: string, file: string): Promise<void> {
  if (ipcRenderer) {
    return ipcRenderer.invoke('git-unstage', repoPath, file)
  }
}

export async function gitStageAll(repoPath: string): Promise<void> {
  if (ipcRenderer) {
    return ipcRenderer.invoke('git-stage-all', repoPath)
  }
}

export async function gitLog(repoPath: string, count?: number): Promise<string[]> {
  if (ipcRenderer) {
    return ipcRenderer.invoke('git-log', repoPath, count || 20)
  }
  return []
}
