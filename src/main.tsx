import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

interface RootErrorBoundaryState {
  error: Error | null
}

class RootErrorBoundary extends React.Component<React.PropsWithChildren, RootErrorBoundaryState> {
  state: RootErrorBoundaryState = {
    error: null,
  }

  static getDerivedStateFromError(error: Error): RootErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error) {
    console.error('[Renderer] Unhandled error', error)
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          background: 'var(--bg-primary)',
          color: 'var(--text-primary)',
        }}>
          <div style={{
            width: '100%',
            maxWidth: '640px',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            background: 'var(--bg-card)',
            padding: '20px',
          }}>
            <h1 style={{ fontSize: '18px', marginBottom: '12px' }}>画面の初期化に失敗しました</h1>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '12px' }}>
              ビルド済みアプリの起動時エラーです。設定保存データか build 出力の不整合の可能性があります。
            </p>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '12px', color: 'var(--error)' }}>
              {this.state.error.message}
            </pre>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </React.StrictMode>,
)
