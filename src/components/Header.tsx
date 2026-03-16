import type { CSSProperties } from 'react'

interface HeaderProps {
  view: 'feed' | 'settings'
  onViewChange: (view: 'feed' | 'settings') => void
  onFetch: () => void
  loading: boolean
  lastFetched?: string
}

export function Header({ view, onViewChange, onFetch, loading, lastFetched }: HeaderProps) {
  const formatTime = (iso: string) => {
    const d = new Date(iso)
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }

  return (
    <header className="app-header" style={styles.header}>
      <div style={styles.titleArea}>
        <h1 style={styles.title}>AI News Digest</h1>
        {lastFetched && (
          <span style={styles.lastFetched}>最終取得: {formatTime(lastFetched)}</span>
        )}
      </div>
      <div style={styles.actions}>
        <button
          style={{ ...styles.btn, ...(loading ? styles.btnDisabled : {}) }}
          onClick={onFetch}
          disabled={loading}
        >
          {loading ? '取得中...' : '今すぐ取得'}
        </button>
        <button
          style={{ ...styles.tabBtn, ...(view === 'feed' ? styles.tabActive : {}) }}
          onClick={() => onViewChange('feed')}
        >
          ニュース
        </button>
        <button
          style={{ ...styles.tabBtn, ...(view === 'settings' ? styles.tabActive : {}) }}
          onClick={() => onViewChange('settings')}
        >
          設定
        </button>
      </div>
    </header>
  )
}

const styles: Record<string, CSSProperties> = {
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 20px',
    paddingTop: '40px',
    borderBottom: '1px solid var(--border)',
    background: 'var(--bg-secondary)',
  },
  titleArea: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '12px',
  },
  title: {
    fontSize: '18px',
    fontWeight: 700,
    color: 'var(--accent)',
  },
  lastFetched: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
  },
  actions: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  btn: {
    padding: '6px 14px',
    borderRadius: '6px',
    border: 'none',
    background: 'var(--accent)',
    color: '#fff',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  btnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  tabBtn: {
    padding: '6px 12px',
    borderRadius: '6px',
    border: '1px solid var(--border)',
    background: 'transparent',
    color: 'var(--text-secondary)',
    fontSize: '13px',
    cursor: 'pointer',
  },
  tabActive: {
    background: 'var(--bg-card)',
    color: 'var(--text-primary)',
    borderColor: 'var(--accent)',
  },
}
