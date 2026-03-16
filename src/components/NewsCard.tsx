import type { CSSProperties } from 'react'
import type { NewsItem } from '../types/news'

interface NewsCardProps {
  item: NewsItem
}

export function NewsCard({ item }: NewsCardProps) {
  const openUrl = () => {
    window.electronAPI.openExternal(item.url)
  }

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime()
    const hours = Math.floor(diff / 3600000)
    if (hours < 1) return `${Math.floor(diff / 60000)}分前`
    if (hours < 24) return `${hours}時間前`
    return `${Math.floor(hours / 24)}日前`
  }

  return (
    <div className="news-card" style={styles.card} onClick={openUrl}>
      <p style={styles.summary}>{item.summary}</p>
      <span style={styles.time}>{timeAgo(item.postedAt)}</span>
    </div>
  )
}

const styles: Record<string, CSSProperties> = {
  card: {
    padding: '14px 16px',
    background: 'var(--bg-card)',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  summary: {
    fontSize: '14px',
    lineHeight: 1.6,
    color: 'var(--text-primary)',
    marginBottom: '6px',
  },
  time: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
  },
}
