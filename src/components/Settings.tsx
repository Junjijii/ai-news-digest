import { useState, useEffect } from 'react'
import type { CSSProperties } from 'react'
import type { AppSettings } from '../types/news'

interface SettingsProps {
  settings: AppSettings | null
  onSave: (settings: Partial<AppSettings>) => void
}

export function Settings({ settings, onSave }: SettingsProps) {
  const [form, setForm] = useState<AppSettings>({
    anthropicApiKey: '',
    scheduleHour: 6,
    scheduleMinute: 0,
    maxResults: 30,
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

      <label style={styles.label}>Anthropic API Key</label>
      <input
        className="form-control"
        style={styles.input}
        type="password"
        value={form.anthropicApiKey}
        onChange={(e) => update('anthropicApiKey', e.target.value)}
        placeholder="sk-ant-..."
      />
      <p style={styles.hint}>console.anthropic.com → API Keys → Create Key で取得</p>

      <h2 style={{ ...styles.heading, marginTop: '24px' }}>スケジュール設定</h2>

      <div style={styles.row}>
        <div>
          <label style={styles.label}>取得時刻（時）</label>
          <input
            className="form-control"
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
            className="form-control"
            style={{ ...styles.input, width: '80px' }}
            type="number"
            min={0}
            max={59}
            value={form.scheduleMinute}
            onChange={(e) => update('scheduleMinute', parseInt(e.target.value) || 0)}
          />
        </div>
      </div>

      <h2 style={{ ...styles.heading, marginTop: '24px' }}>取得設定</h2>

      <label style={styles.label}>取得件数上限</label>
      <input
        className="form-control"
        style={{ ...styles.input, width: '100px' }}
        type="number"
        min={5}
        max={100}
        value={form.maxResults}
        onChange={(e) => update('maxResults', parseInt(e.target.value) || 30)}
      />

      <p style={styles.hint}>MIT Tech Review, VentureBeat, The Verge, Ars Technica, TechCrunch のAIニュースを自動収集します</p>

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
