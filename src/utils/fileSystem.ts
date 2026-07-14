import { FileNode } from '../store/AppContext'

// These will be populated by the Electron preload or fallback to fetch
const fs = window.require ? window.require('fs') : null
const path = window.require ? window.require('path') : null
const { ipcRenderer } = window.require ? window.require('electron') : { ipcRenderer: null }

const languageMap: Record<string, string> = {
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.py': 'python',
  '.rb': 'ruby',
  '.java': 'java',
  '.c': 'c',
  '.cpp': 'cpp',
  '.h': 'c',
  '.hpp': 'cpp',
  '.cs': 'csharp',
  '.go': 'go',
  '.rs': 'rust',
  '.php': 'php',
  '.swift': 'swift',
  '.kt': 'kotlin',
  '.scala': 'scala',
  '.html': 'html',
  '.htm': 'html',
  '.css': 'css',
  '.scss': 'scss',
  '.less': 'less',
  '.json': 'json',
  '.xml': 'xml',
  '.yaml': 'yaml',
  '.yml': 'yaml',
  '.toml': 'toml',
  '.md': 'markdown',
  '.sql': 'sql',
  '.sh': 'shell',
  '.bash': 'shell',
  '.ps1': 'powershell',
  '.bat': 'bat',
  '.cmd': 'bat',
  '.dockerfile': 'dockerfile',
  '.r': 'r',
  '.lua': 'lua',
  '.perl': 'perl',
  '.pl': 'perl',
  '.dart': 'dart',
  '.vue': 'vue',
  '.svelte': 'svelte',
  '.graphql': 'graphql',
  '.gql': 'graphql',
  '.tf': 'hcl',
  '.ini': 'ini',
  '.env': 'shell',
  '.gitignore': 'shell',
  '.txt': 'plaintext',
  '.log': 'plaintext',
  '.csv': 'plaintext',
}

export function getLanguage(filename: string): string {
  const ext = '.' + filename.split('.').pop()?.toLowerCase()
  return languageMap[ext] || 'plaintext'
}

export async function openFolderDialog(): Promise<string | null> {
  if (ipcRenderer) {
    return ipcRenderer.invoke('open-folder-dialog')
  }
  return null
}

export async function openFileDialog(): Promise<{ path: string; content: string } | null> {
  if (ipcRenderer) {
    return ipcRenderer.invoke('open-file-dialog')
  }
  return null
}

export async function saveFileDialog(): Promise<string | null> {
  if (ipcRenderer) {
    return ipcRenderer.invoke('save-file-dialog')
  }
  return null
}

export async function readFile(filePath: string): Promise<string> {
  if (fs) {
    return fs.promises.readFile(filePath, 'utf-8')
  }
  // Fallback for non-Electron (web) mode
  const resp = await fetch(`/api/file?path=${encodeURIComponent(filePath)}`)
  return resp.text()
}

export async function writeFile(filePath: string, content: string): Promise<void> {
  if (fs) {
    await fs.promises.writeFile(filePath, content, 'utf-8')
    return
  }
  await fetch(`/api/file?path=${encodeURIComponent(filePath)}`, {
    method: 'PUT',
    body: content,
  })
}

export async function readDir(dirPath: string): Promise<FileNode[]> {
  if (!fs || !path) return []

  const entries = await fs.promises.readdir(dirPath, { withFileTypes: true })
  const nodes: FileNode[] = []

  // Sort: directories first, then files, both alphabetically
  const sorted = entries.sort((a: any, b: any) => {
    if (a.isDirectory() && !b.isDirectory()) return -1
    if (!a.isDirectory() && b.isDirectory()) return 1
    return a.name.localeCompare(b.name)
  })

  for (const entry of sorted) {
    // Skip hidden files and common build directories
    if (entry.name.startsWith('.') && entry.name !== '.env' && entry.name !== '.gitignore') continue
    if (['node_modules', '__pycache__', '.git', 'dist', 'build', '.next', '.vs'].includes(entry.name)) continue

    const fullPath = path.join(dirPath, entry.name)
    const node: FileNode = {
      name: entry.name,
      path: fullPath,
      isDirectory: entry.isDirectory(),
    }

    if (entry.isDirectory()) {
      node.children = []
    }

    nodes.push(node)
  }

  return nodes
}

export async function loadChildren(dirPath: string): Promise<FileNode[]> {
  return readDir(dirPath)
}

export async function fileExists(filePath: string): Promise<boolean> {
  if (fs) {
    try {
      await fs.promises.access(filePath)
      return true
    } catch {
      return false
    }
  }
  return false
}

export async function createFile(dirPath: string, fileName: string): Promise<string> {
  if (!fs || !path) throw new Error('File system not available')
  const filePath = path.join(dirPath, fileName)
  await fs.promises.writeFile(filePath, '', 'utf-8')
  return filePath
}

export async function createDirectory(dirPath: string, dirName: string): Promise<string> {
  if (!fs || !path) throw new Error('File system not available')
  const newPath = path.join(dirPath, dirName)
  await fs.promises.mkdir(newPath, { recursive: true })
  return newPath
}

export async function deleteFile(filePath: string): Promise<void> {
  if (!fs) throw new Error('File system not available')
  const stat = await fs.promises.stat(filePath)
  if (stat.isDirectory()) {
    await fs.promises.rm(filePath, { recursive: true })
  } else {
    await fs.promises.unlink(filePath)
  }
}

export async function renameFile(oldPath: string, newName: string): Promise<string> {
  if (!fs || !path) throw new Error('File system not available')
  const dir = path.dirname(oldPath)
  const newPath = path.join(dir, newName)
  await fs.promises.rename(oldPath, newPath)
  return newPath
}

export function joinPath(...parts: string[]): string {
  if (path) return path.join(...parts)
  return parts.join('/')
}

export function basename(filePath: string): string {
  if (path) return path.basename(filePath)
  return filePath.split('/').pop() || filePath.split('\\').pop() || filePath
}

export function dirname(filePath: string): string {
  if (path) return path.dirname(filePath)
  const parts = filePath.split(/[/\\]/)
  parts.pop()
  return parts.join('/') || '.'
}

export function getExtLanguage(filename: string): string {
  return getLanguage(filename)
}
