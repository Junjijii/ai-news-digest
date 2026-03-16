interface ElectronAPI {
  openExternal: (url: string) => Promise<void>
  getSettings: () => Promise<import('./types/news').AppSettings>
  saveSettings: (settings: Partial<import('./types/news').AppSettings>) => Promise<boolean>
  getLatestFeed: () => Promise<import('./types/news').NewsFeed | null>
  fetchNews: () => Promise<void>
  onFetchStart: (callback: () => void) => () => void
  onFetchComplete: (callback: (event: any, feed: import('./types/news').NewsFeed) => void) => () => void
  onFetchError: (callback: (event: any, error: string) => void) => () => void
}

interface Window {
  electronAPI: ElectronAPI
}
