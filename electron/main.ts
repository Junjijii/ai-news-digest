import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } from 'electron'
import path from 'path'
import { XApiService } from './services/x-api'
import { Summarizer } from './services/summarizer'
import { Scheduler } from './services/scheduler'
import { SettingsStore } from './services/settings-store'

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
const settingsStore = new SettingsStore()
let scheduler: Scheduler | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    minWidth: 600,
    minHeight: 500,
    title: 'AI News Digest',
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('close', (e) => {
    if (tray) {
      e.preventDefault()
      mainWindow?.hide()
    }
  })
}

function createTray() {
  const icon = nativeImage.createFromDataURL(
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAbwAAAG8B8aLcQwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAADPSURBVDiNpZMxDoJAEEX/LhRcAK9gYWlnYecR7D2EpfECdN7AijvYeQlLL2DjEWgsjIWzZllYxEmm2Z3/3+zMDvwbmqoBdIEz0AXawAdqAVSAHnAAJlFSGmAfW4qATgfSqlQVYAxMYotGKlYA40gFXAPBHzEBXmxBF0CbxClfAHsaGb2ArX8fqOGeaCsKSxEfIZmSJvBpMKjE0AEGwJBo4wKY2w6oi+oD+BNAx3z6BJZK8Ae62xyKwNqBqX7sHGRrz2H1CqBy0T+a74BPa80W7YAAAAASUVORK5CYII='
  )
  tray = new Tray(icon)
  tray.setToolTip('AI News Digest')
  const contextMenu = Menu.buildFromTemplate([
    { label: 'ウィンドウを表示', click: () => mainWindow?.show() },
    { label: '今すぐ取得', click: () => fetchNews() },
    { type: 'separator' },
    { label: '終了', click: () => { tray = null; app.quit() } },
  ])
  tray.setContextMenu(contextMenu)
  tray.on('click', () => mainWindow?.show())
}

async function fetchNews() {
  const settings = settingsStore.getAll()
  if (!settings.xBearerToken || !settings.anthropicApiKey) {
    mainWindow?.webContents.send('fetch-error', 'APIキーが設定されていません。設定画面からキーを入力してください。')
    return
  }

  mainWindow?.webContents.send('fetch-start')

  try {
    const xApi = new XApiService(settings.xBearerToken)
    const summarizer = new Summarizer(settings.anthropicApiKey)

    const tweets = await xApi.searchAINews(settings.searchQueries, settings.maxResults, settings.language)
    const feed = await summarizer.summarizeFeed(tweets)

    settingsStore.saveLatestFeed(feed)
    mainWindow?.webContents.send('fetch-complete', feed)
  } catch (error: any) {
    mainWindow?.webContents.send('fetch-error', error.message || '取得に失敗しました')
  }
}

// IPC handlers
ipcMain.handle('get-settings', () => settingsStore.getAll())
ipcMain.handle('save-settings', (_event, settings) => {
  settingsStore.saveSettings(settings)
  setupScheduler()
  return true
})
ipcMain.handle('get-latest-feed', () => settingsStore.getLatestFeed())
ipcMain.handle('fetch-news', () => fetchNews())

function setupScheduler() {
  const settings = settingsStore.getAll()
  if (scheduler) scheduler.stop()
  scheduler = new Scheduler(settings.scheduleHour, settings.scheduleMinute, fetchNews)
  scheduler.start()
}

app.whenReady().then(() => {
  createWindow()
  createTray()
  setupScheduler()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
  else mainWindow?.show()
})
