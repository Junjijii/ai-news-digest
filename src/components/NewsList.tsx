import type { CSSProperties } from 'react'
import type { NewsFeed } from '../types/news'
import { NewsCard } from './NewsCard'

interface NewsListProps {
  feed: NewsFeed | null
  loading: boolean
  error: string | null
}

export function NewsList({ feed, loading, error }: NewsListProps) {
  if (loading) {
    return (
      <div style={styles.center}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>AIニュースを取得・分析中...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={styles.center}>
        <p style={styles.errorText}>{error}</p>
      </div>
    )
  }

  if (!feed || feed.items.length === 0) {
    return (
      <div style={styles.center}>
        <p style={styles.emptyText}>ニュースがありません</p>
        <p style={styles.emptyHint}>「今すぐ取得」ボタンを押すか、設定画面でAPIキーを入力してください</p>
      </div>
    )
  }

  return (
    <div>
      <div style={styles.summary}>
        <h2 style={styles.summaryTitle}>{feed.date} のまとめ</h2>
        <p style={styles.summaryText}>{feed.summary}</p>
      </div>
      <div style={styles.list}>
        {feed.items.map((item) => (
          <NewsCard
            key={item.id}
            item={item}
          />
        ))}
      </div>
    </div>
  )
}

const styles: Record<string, CSSProperties> = {
  center: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '60vh',
    gap: '12px',
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid var(--border)',
    borderTop: '3px solid var(--accent)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    color: 'var(--text-secondary)',
    fontSize: '14px',
  },
  errorText: {
    color: 'var(--error)',
    fontSize: '14px',
  },
  emptyText: {
    color: 'var(--text-secondary)',
    fontSize: '16px',
  },
  emptyHint: {
    color: 'var(--text-secondary)',
    fontSize: '13px',
    opacity: 0.7,
  },
  summary: {
    padding: '16px',
    background: 'var(--bg-secondary)',
    borderRadius: '10px',
    border: '1px solid var(--border)',
    marginBottom: '16px',
  },
  summaryTitle: {
    fontSize: '15px',
    fontWeight: 600,
    marginBottom: '8px',
    color: 'var(--accent)',
  },
  summaryText: {
    fontSize: '14px',
    lineHeight: 1.7,
    color: 'var(--text-primary)',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
}
