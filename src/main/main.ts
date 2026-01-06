import {
  app,
  BrowserWindow,
  BrowserWindowConstructorOptions,
  screen,
} from 'electron'
import log from 'electron-log/main'
import started from 'electron-squirrel-startup'
import fs from 'node:fs'
import path from 'node:path'
import { updateElectronApp } from 'update-electron-app'
import './messages/messages'

log.initialize()

updateElectronApp({
  logger: {
    log: log.log,
    info: log.info,
    warn: log.warn,
    error: log.error,
  },
})

// Something something Windows. Not currently supported, will just leave it.
if (started) {
  app.quit()
}

// Database backup function
const createDailyBackup = () => {
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD format

  // Use userData directory for the database and backups in production, cwd in dev
  const isProd = app.isPackaged
  const baseDir = isProd ? app.getPath('userData') : process.cwd()
  const dbPath = path.join(baseDir, 'data.sqlite')
  const backupDir = path.join(baseDir, 'db_backups')
  const backupPath = path.join(backupDir, `data-backup-${today}.sqlite`)

  // Create backup directory if it doesn't exist
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true })
  }

  // Check if today's backup already exists
  if (fs.existsSync(backupPath)) {
    log.info(`Backup already exists for today: ${backupPath}`)
    return
  }

  // Check if database exists
  if (!fs.existsSync(dbPath)) {
    log.warn('Database file not found, skipping backup')
    return
  }

  try {
    // Create backup
    fs.copyFileSync(dbPath, backupPath)
    log.info(`Database backup created: ${backupPath}`)
  } catch (error) {
    log.error('Failed to create database backup:', error)
  }
}

const createWindow = () => {
  const displays = screen.getAllDisplays()

  const externalDisplay = displays.length > 1 ? displays[1] : null

  const windowOptions: BrowserWindowConstructorOptions = {
    width: 1200,
    height: 800,
    x: 0,
    y: 0,
    icon: path.join(__dirname, '../assets/icon.png'),

    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  }

  if (externalDisplay) {
    windowOptions.x = externalDisplay.bounds.x + 50
    windowOptions.y = externalDisplay.bounds.y + 50
  }

  const mainWindow = new BrowserWindow(windowOptions)

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    )
  }

  mainWindow.webContents.openDevTools()
}

app.on('ready', () => {
  createDailyBackup()
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
