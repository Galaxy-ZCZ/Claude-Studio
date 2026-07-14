import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import { exec } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#0d1117',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

// ─── Window Controls ─────────────────────────────────
ipcMain.on('minimize-window', () => mainWindow?.minimize())
ipcMain.on('maximize-window', () => {
  if (mainWindow?.isMaximized()) mainWindow.unmaximize()
  else mainWindow?.maximize()
})
ipcMain.on('close-window', () => mainWindow?.close())

// ─── File Dialogs ────────────────────────────────────
ipcMain.handle('open-folder-dialog', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openDirectory'],
  })
  if (result.canceled) return null
  return result.filePaths[0]
})

ipcMain.handle('open-file-dialog', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openFile'],
    filters: [
      { name: 'All Files', extensions: ['*'] },
      { name: 'Code Files', extensions: ['ts', 'tsx', 'js', 'jsx', 'py', 'rs', 'go', 'java', 'c', 'cpp', 'cs'] },
    ],
  })
  if (result.canceled || !result.filePaths[0]) return null
  const filePath = result.filePaths[0]
  const content = await fs.promises.readFile(filePath, 'utf-8')
  return { path: filePath, content }
})

ipcMain.handle('save-file-dialog', async (_event, defaultPath?: string) => {
  const result = await dialog.showSaveDialog(mainWindow!, {
    defaultPath,
    filters: [{ name: 'All Files', extensions: ['*'] }],
  })
  if (result.canceled) return null
  return result.filePath
})

// ─── File Operations ─────────────────────────────────
ipcMain.handle('read-file', async (_event, filePath: string) => {
  return fs.promises.readFile(filePath, 'utf-8')
})

ipcMain.handle('write-file', async (_event, filePath: string, content: string) => {
  await fs.promises.writeFile(filePath, content, 'utf-8')
})

ipcMain.handle('read-dir', async (_event, dirPath: string) => {
  const entries = await fs.promises.readdir(dirPath, { withFileTypes: true })
  const nodes = entries
    .filter(e => {
      if (e.name.startsWith('.') && !['.env', '.gitignore', '.eslintrc.js', '.prettierrc'].includes(e.name)) return false
      if (['node_modules', '__pycache__', '.git', 'dist', 'build', '.next', '.vs', '.idea'].includes(e.name)) return false
      return true
    })
    .sort((a, b) => {
      if (a.isDirectory() && !b.isDirectory()) return -1
      if (!a.isDirectory() && b.isDirectory()) return 1
      return a.name.localeCompare(b.name)
    })
    .map(e => ({
      name: e.name,
      path: path.join(dirPath, e.name),
      isDirectory: e.isDirectory(),
    }))
  return nodes
})

ipcMain.handle('create-file', async (_event, dirPath: string, fileName: string) => {
  const filePath = path.join(dirPath, fileName)
  await fs.promises.writeFile(filePath, '', 'utf-8')
  return filePath
})

ipcMain.handle('create-dir', async (_event, dirPath: string, dirName: string) => {
  const newPath = path.join(dirPath, dirName)
  await fs.promises.mkdir(newPath, { recursive: true })
  return newPath
})

ipcMain.handle('delete-file', async (_event, filePath: string) => {
  const stat = await fs.promises.stat(filePath)
  if (stat.isDirectory()) {
    await fs.promises.rm(filePath, { recursive: true })
  } else {
    await fs.promises.unlink(filePath)
  }
})

ipcMain.handle('rename-file', async (_event, oldPath: string, newName: string) => {
  const dir = path.dirname(oldPath)
  const newPath = path.join(dir, newName)
  await fs.promises.rename(oldPath, newPath)
  return newPath
})

ipcMain.handle('file-exists', async (_event, filePath: string) => {
  try {
    await fs.promises.access(filePath)
    return true
  } catch {
    return false
  }
})

// ─── Git Operations ──────────────────────────────────
function execCmd(cmd: string, cwd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(cmd, { cwd, maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) reject(new Error(stderr || error.message))
      else resolve(stdout.trim())
    })
  })
}

ipcMain.handle('git-status', async (_event, repoPath: string) => {
  try {
    const branch = await execCmd('git rev-parse --abbrev-ref HEAD', repoPath)
    const statusRaw = await execCmd('git status --porcelain', repoPath)
    const aheadBehind = await execCmd(
      `git rev-list --left-right --count HEAD...@{upstream}`,
      repoPath
    ).catch(() => '0\t0')

    const [ahead, behind] = aheadBehind.split('\t').map(Number)
    const modified: string[] = []
    const staged: string[] = []
    const untracked: string[] = []

    for (const line of statusRaw.split('\n').filter(Boolean)) {
      const indexStatus = line[0]
      const workTreeStatus = line[1]
      const file = line.substring(3).trim()

      if (indexStatus === '?' && workTreeStatus === '?') {
        untracked.push(file)
      } else {
        if (indexStatus !== ' ' && indexStatus !== '?') staged.push(file)
        if (workTreeStatus !== ' ' && workTreeStatus !== '?') modified.push(file)
      }
    }

    return { branch, ahead, behind, modified, staged, untracked }
  } catch {
    return null
  }
})

ipcMain.handle('git-commit', async (_event, repoPath: string, message: string) => {
  return execCmd(`git commit -m "${message.replace(/"/g, '\\"')}"`, repoPath)
})

ipcMain.handle('git-diff', async (_event, repoPath: string, file?: string) => {
  const cmd = file ? `git diff "${file}"` : 'git diff'
  return execCmd(cmd, repoPath)
})

ipcMain.handle('git-stage', async (_event, repoPath: string, file: string) => {
  return execCmd(`git add "${file}"`, repoPath)
})

ipcMain.handle('git-unstage', async (_event, repoPath: string, file: string) => {
  return execCmd(`git reset HEAD "${file}"`, repoPath)
})

ipcMain.handle('git-stage-all', async (_event, repoPath: string) => {
  return execCmd('git add -A', repoPath)
})

ipcMain.handle('git-log', async (_event, repoPath: string, count: number) => {
  const raw = await execCmd(
    `git log --oneline -${count} --format="%h|%s|%an|%ar"`,
    repoPath
  )
  return raw.split('\n').filter(Boolean)
})

// ─── Shell Execution ─────────────────────────────────
ipcMain.handle('exec-command', async (_event, cmd: string, cwd: string) => {
  return execCmd(cmd, cwd)
})

// ─── Open in External ────────────────────────────────
ipcMain.on('open-external', (_event, url: string) => {
  shell.openExternal(url)
})

ipcMain.on('open-in-explorer', (_event, filePath: string) => {
  shell.showItemInFolder(filePath)
})
