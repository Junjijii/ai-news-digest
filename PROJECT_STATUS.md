# プロジェクトステータス

<!-- このファイルは全AIツール共通の情報共有ファイルです -->
<!-- Claude Code / Codex / ChatGPT 誰が読んでも現状がわかるように書く -->
<!-- 作業のたびに更新すること -->

## 概要
毎朝6時にX(Twitter)のAI関連ツイートを自動収集し、Claude APIで要約・カテゴリ分けして一覧表示するElectronデスクトップアプリ。

## 技術スタック
- **UI**: Electron + React + Vite + TypeScript
- **データ取得**: X API v2 (Recent Search)
- **要約**: Claude API (Anthropic SDK)
- **スケジュール**: node-cron（毎朝6時デフォルト）
- **設定保存**: electron-store

## 現在のバージョン / 状態
v1.0.0 開発中 - 配布 `.app` の起動不全が継続、Claude Code へ引き継ぎ

## 協業ステータス
- lead: Claude Code
- executor: Codex
- phase: handoff
- handoff_ready: false
- next_owner: Claude Code
- final_owner: Claude Code
- updated_at: 2026-03-16

## 直近の変更（最新を上に追記）
| 日付 | 変更内容 | 担当 |
|------|---------|------|
| 2026-03-16 | 配布 `.app` で `node-cron` の依存 `uuid` が欠落していたため、`electron-builder.yml` に `node_modules/uuid/**/*` を追加。再ビルドし、デスクトップの `AI News Digest.app` を差し替え | Codex |
| 2026-03-16 | スクロール不能を修正。ドラッグ領域をヘッダーに限定し、メイン領域に `min-height: 0` と `overflow-y: auto` を適用してスクロール復旧を確認 | Codex |
| 2026-03-15 | Issue #1 #2 #3 対応。Vite/Electron 起動経路修正、`node-cron` 型追加、スピナー追加、カード hover と入力 focus 改善、`npm run build` 成功確認 | Codex |
| 2026-03-15 | 全ファイル初期実装（Electron main/preload, React UI, X API, Summarizer, Scheduler, Settings） | Claude Code |

## 次にやること
- [x] `npm run electron:dev` でビルド・起動確認（Issue #1）
- [x] TypeScript/ビルドエラーの修正と Electron main の ESM/CJS 起動エラー解消
- [x] CSSスピナーアニメーション追加（Issue #2）
- [x] NewsCard hover / 設定 input focus 改善（Issue #3）
- [ ] ダークモード hover/transition 改善（Issue #4）

## 現在の問題
- ユーザー報告ベースで、デスクトップに配置した `AI News Digest.app` が依然として起動しない
- 直前の実行時エラーは `Cannot find module 'uuid'` だったため `electron-builder.yml` に `node_modules/uuid/**/*` を追加し、再ビルドとデスクトップ差し替えまで実施
- 差し替え後の `.app` には `app.asar` 内の `node_modules/uuid` を確認済みだが、ユーザー環境ではなお起動しない
- 未確認事項: 最新の起動失敗時のエラーダイアログ/クラッシュログ/コンソール出力

## 引き継ぎメモ
- from: Codex
- to: Claude Code
- branch: main
- commit: この更新を含む最新の main を参照
- summary: 配布 `.app` の初回クラッシュ原因だった `Cannot find module 'uuid'` はパッケージ設定を修正し、再ビルド済み。`app.asar` 内に `node_modules/uuid` が入っていることも確認したが、ユーザーからは「起動せず」と追加報告あり。次は実機で最新クラッシュ内容を採取し、Gatekeeper/署名/別依存/起動直後例外のどれかを切り分けてほしい。
- tests:
  - `npx tsc --noEmit` ✅
  - `npx vite build` ✅
  - `npm run electron:dev` ✅（Electron process 起動確認）
  - `npm run electron:build` ✅
  - `npx asar list "release/mac-arm64/AI News Digest.app/Contents/Resources/app.asar" | rg "node_modules/(node-cron|uuid)"` ✅

## ファイル構成
```
ai-news-digest/
├── electron/
│   ├── main.ts              # Electronメインプロセス（ウィンドウ、トレイ、IPC）
│   ├── preload.ts            # contextBridge によるAPI公開
│   └── services/
│       ├── x-api.ts          # X API v2 Recent Search クライアント
│       ├── summarizer.ts     # Claude APIで要約・カテゴリ分け
│       ├── scheduler.ts      # node-cronで定時実行
│       └── settings-store.ts # electron-storeで設定永続化
├── src/
│   ├── main.tsx              # Reactエントリ
│   ├── App.tsx               # メインコンポーネント（フィード/設定切替）
│   ├── index.css             # グローバルCSS（ダークテーマ）
│   ├── global.d.ts           # ElectronAPI型定義
│   ├── types/news.ts         # 型定義
│   └── components/
│       ├── Header.tsx        # ヘッダー（タブ、取得ボタン）
│       ├── NewsList.tsx      # ニュース一覧
│       ├── NewsCard.tsx      # ニュースカード
│       └── Settings.tsx      # 設定画面
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── electron-builder.yml
```

## テスト方法
```bash
npm run electron:dev
```

## デプロイ / リリース方法
```bash
npm run electron:build  # macOS用DMG生成
```
