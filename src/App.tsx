import { useState, useEffect, useCallback } from 'react'
import type { NewsFeed, AppSettings } from './types/news'
import { NewsList } from './components/NewsList'
import { Settings } from './components/Settings'
import { Header } from './components/Header'

type View = 'feed' | 'settings'

function sanitizeFeed(value: unknown): NewsFeed | null {
  if (!value || typeof value !== 'object') return null

  const feed = value as Partial<NewsFeed> & { items?: unknown[] }
  if (!Array.isArray(feed.items)) return null

  const items = feed.items
    .filter((item) => !!item && typeof item === 'object')
    .map((item) => {
      const record = item as unknown as Record<string, unknown>

      return {
        id: typeof record.id === 'string' ? record.id : crypto.randomUUID(),
        author: typeof record.author === 'string' ? record.author : '',
        authorHandle: typeof record.authorHandle === 'string' ? record.authorHandle : '',
        text: typeof record.text === 'string' ? record.text : '',
        summary: typeof record.summary === 'string' ? record.summary : '',
        url: typeof record.url === 'string' ? record.url : '',
        postedAt: typeof record.postedAt === 'string' ? record.postedAt : new Date().toISOString(),
        likes: typeof record.likes === 'number' ? record.likes : 0,
        retweets: typeof record.retweets === 'number' ? record.retweets : 0,
        category: typeof record.category === 'string' ? record.category : 'その他',
      }
    })

  const fallbackDate = new Date().toISOString()

  return {
    date: typeof feed.date === 'string' ? feed.date : fallbackDate.split('T')[0],
    fetchedAt: typeof feed.fetchedAt === 'string' ? feed.fetchedAt : fallbackDate,
    items,
    summary: typeof feed.summary === 'string' ? feed.summary : '',
  }
}

export default function App() {
  const [view, setView] = useState<View>('feed')
  const [feed, setFeed] = useState<NewsFeed | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [settings, setSettings] = useState<AppSettings | null>(null)

  useEffect(() => {
    window.electronAPI.getLatestFeed()
      .then((savedFeed) => setFeed(sanitizeFeed(savedFeed)))
      .catch((err) => {
        console.error('[App] Failed to load latest feed', err)
        setError('保存済みニュースの読み込みに失敗しました')
      })

    window.electronAPI.getSettings()
      .then(setSettings)
      .catch((err) => {
        console.error('[App] Failed to load settings', err)
        setError('設定の読み込みに失敗しました')
      })

    const unsub1 = window.electronAPI.onFetchStart(() => {
      setLoading(true)
      setError(null)
    })
    const unsub2 = window.electronAPI.onFetchComplete((_e, newFeed) => {
      setFeed(sanitizeFeed(newFeed))
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
