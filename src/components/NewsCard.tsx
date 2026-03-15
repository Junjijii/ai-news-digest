import type { CSSProperties } from 'react'
import type { NewsItem } from '../types/news'

interface NewsCardProps {
  item: NewsItem
  categoryColor: string
}

export function NewsCard({ item, categoryColor }: NewsCardProps) {
  const openUrl = () => {
    window.open(item.url, '_blank')
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
      <div style={styles.header}>
        <span style={{ ...styles.category, background: categoryColor + '22', color: categoryColor }}>
          {item.category}
        </span>
        <span style={styles.time}>{timeAgo(item.postedAt)}</span>
      </div>
      <p style={styles.summary}>{item.summary}</p>
      <div style={styles.footer}>
        <span style={styles.author}>{item.author}</span>
      </div>
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
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  category: {
    fontSize: '11px',
    fontWeight: 600,
    padding: '2px 8px',
    borderRadius: '4px',
  },
  time: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
  },
  summary: {
    fontSize: '14px',
    lineHeight: 1.6,
    color: 'var(--text-primary)',
    marginBottom: '10px',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  author: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
  },
  metrics: {
    display: 'flex',
    gap: '12px',
  },
  metric: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
  },
}
