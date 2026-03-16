import { useState, useEffect, useCallback } from 'react'
import type { NewsFeed, AppSettings } from './types/news'
import { NewsList } from './components/NewsList'
import { Settings } from './components/Settings'
import { Header } from './components/Header'

type View = 'feed' | 'settings'

export default function App() {
  const [view, setView] = useState<View>('feed')
  const [feed, setFeed] = useState<NewsFeed | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [settings, setSettings] = useState<AppSettings | null>(null)

  useEffect(() => {
    window.electronAPI.getLatestFeed().then(setFeed)
    window.electronAPI.getSettings().then(setSettings)

    const unsub1 = window.electronAPI.onFetchStart(() => {
      setLoading(true)
      setError(null)
    })
    const unsub2 = window.electronAPI.onFetchComplete((_e, newFeed) => {
      setFeed(newFeed)
      setLoading(false)
    })
    const unsub3 = window.electronAPI.onFetchError((_e, err) => {
      setError(err)
      setLoading(false)
    })

    return () => { unsub1(); unsub2(); unsub3() }
  }, [])

  const handleFetch = useCallback(() => {
    window.electronAPI.fetchNews()
  }, [])

  const handleSaveSettings = useCallback(async (newSettings: Partial<AppSettings>) => {
    await window.electronAPI.saveSettings(newSettings)
    setSettings((prev) => prev ? { ...prev, ...newSettings } : null)
    setView('feed')
  }, [])

  return (
    <div className="app-shell">
      <Header
        view={view}
        onViewChange={setView}
        onFetch={handleFetch}
        loading={loading}
        lastFetched={feed?.fetchedAt}
      />
      <main className="app-content" style={{ padding: '16px 20px' }}>
        {view === 'feed' ? (
          <NewsList feed={feed} loading={loading} error={error} />
        ) : (
          <Settings settings={settings} onSave={handleSaveSettings} />
        )}
      </main>
    </div>
  )
}
