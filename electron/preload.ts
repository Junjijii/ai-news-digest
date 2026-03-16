import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings: any) => ipcRenderer.invoke('save-settings', settings),
  getLatestFeed: () => ipcRenderer.invoke('get-latest-feed'),
  fetchNews: () => ipcRenderer.invoke('fetch-news'),
  onFetchStart: (callback: () => void) => {
    ipcRenderer.on('fetch-start', callback)
    return () => ipcRenderer.removeListener('fetch-start', callback)
  },
  onFetchComplete: (callback: (_event: any, feed: any) => void) => {
    ipcRenderer.on('fetch-complete', callback)
    return () => ipcRenderer.removeListener('fetch-complete', callback)
  },
  onFetchError: (callback: (_event: any, error: string) => void) => {
    ipcRenderer.on('fetch-error', callback)
    return () => ipcRenderer.removeListener('fetch-error', callback)
  },
})
