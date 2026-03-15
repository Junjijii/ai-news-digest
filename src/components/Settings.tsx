import { useState, useEffect } from 'react'
import type { CSSProperties } from 'react'
import type { AppSettings } from '../types/news'

interface SettingsProps {
  settings: AppSettings | null
  onSave: (settings: Partial<AppSettings>) => void
}

export function Settings({ settings, onSave }: SettingsProps) {
  const [form, setForm] = useState<AppSettings>({
    xBearerToken: '',
    anthropicApiKey: '',
    scheduleHour: 6,
    scheduleMinute: 0,
    searchQueries: [],
    maxResults: 50,
    language: 'all',
  })

  useEffect(() => {
    if (settings) setForm(settings)
  }, [settings])

  const update = (key: keyof AppSettings, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>API設定</h2>

      <label style={styles.label}>X (Twitter) Bearer Token</label>
      <input
        style={styles.input}
        type="password"
        value={form.xBearerToken}
        onChange={(e) => update('xBearerToken', e.target.value)}
        placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxx"
      />
      <p style={styles.hint}>developer.x.com でプロジェクトを作成し Bearer Token を取得してください</p>

      <label style={styles.label}>Anthropic API Key</label>
      <input
        style={styles.input}
        type="password"
        value={form.anthropicApiKey}
        onChange={(e) => update('anthropicApiKey', e.target.value)}
        placeholder="sk-ant-..."
      />

      <h2 style={{ ...styles.heading, marginTop: '24px' }}>スケジュール設定</h2>

      <div style={styles.row}>
        <div>
          <label style={styles.label}>取得時刻（時）</label>
          <input
            style={{ ...styles.input, width: '80px' }}
            type="number"
            min={0}
            max={23}
            value={form.scheduleHour}
            onChange={(e) => update('scheduleHour', parseInt(e.target.value) || 0)}
          />
        </div>
        <div>
          <label style={styles.label}>（分）</label>
          <input
            style={{ ...styles.input, width: '80px' }}
            type="number"
            min={0}
            max={59}
            value={form.scheduleMinute}
            onChange={(e) => update('scheduleMinute', parseInt(e.target.value) || 0)}
          />
        </div>
      </div>

      <h2 style={{ ...styles.heading, marginTop: '24px' }}>検索設定</h2>

      <label style={styles.label}>取得件数上限</label>
      <input
        style={{ ...styles.input, width: '100px' }}
        type="number"
        min={10}
        max={200}
        value={form.maxResults}
        onChange={(e) => update('maxResults', parseInt(e.target.value) || 50)}
      />

      <label style={styles.label}>言語フィルタ</label>
      <select
        style={styles.input}
        value={form.language}
        onChange={(e) => update('language', e.target.value)}
      >
        <option value="all">すべて</option>
        <option value="ja">日本語のみ</option>
        <option value="en">英語のみ</option>
      </select>

      <label style={styles.label}>検索クエリ（1行に1つ）</label>
      <textarea
        style={{ ...styles.input, height: '120px', resize: 'vertical' }}
        value={form.searchQueries.join('\n')}
        onChange={(e) => update('searchQueries', e.target.value.split('\n').filter(Boolean))}
      />

      <button style={styles.saveBtn} onClick={() => onSave(form)}>
        保存
      </button>
    </div>
  )
}

const styles: Record<string, CSSProperties> = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
  },
  heading: {
    fontSize: '15px',
    fontWeight: 600,
    color: 'var(--accent)',
    marginBottom: '12px',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    color: 'var(--text-secondary)',
    marginBottom: '4px',
    marginTop: '12px',
  },
  input: {
    width: '100%',
    padding: '8px 12px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    color: 'var(--text-primary)',
    fontSize: '14px',
    fontFamily: 'inherit',
    outline: 'none',
  },
  hint: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    marginTop: '4px',
    opacity: 0.7,
  },
  row: {
    display: 'flex',
    gap: '16px',
  },
  saveBtn: {
    marginTop: '24px',
    padding: '10px 32px',
    background: 'var(--accent)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    width: '100%',
  },
}
