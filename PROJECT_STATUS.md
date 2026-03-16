# プロジェクトステータス

<!-- このファイルは全AIツール共通の情報共有ファイルです -->
<!-- Claude Code / Codex / ChatGPT 誰が読んでも現状がわかるように書く -->
<!-- 作業のたびに更新すること -->

## 概要
毎朝6時にXのAIインフルエンサー・研究者のツイートを自動収集し、Claude APIで日本語要約して一覧表示するElectronデスクトップアプリ。

## 技術スタック
- **UI**: Electron + React + Vite + TypeScript
- **データ取得**: RSSHub経由でXアカウントのツイートをRSS取得（X API不要・無料）
- **要約**: Claude API Sonnet 4（Anthropic SDK、月約220円）
- **スケジュール**: node-cron（毎朝6時デフォルト）
- **設定保存**: electron-store

## 現在のバージョン / 状態
v1.0.0 開発中 - ビルド済みアプリの画面が白くなる問題あり

## 協業ステータス
- lead: Claude Code
- executor: Codex
- phase: implementation
- handoff_ready: true
- next_owner: Codex
- final_owner: Claude Code
- updated_at: 2026-03-16

## 直近の変更（最新を上に追記）
| 日付 | 変更内容 | 担当 |
|------|---------|------|
| 2026-03-16 | XのAIインフルエンサー投稿をRSSHub経由で収集する方式に変更。カテゴリタグ・出典・まとめセクション削除。リンクをChromeで開くようにshell.openExternal使用。24時間以内フィルタ追加 | Claude Code |
| 2026-03-16 | X API廃止→無料RSSフィード方式に切替。設定画面からX Bearer Token欄を削除 | Claude Code |
| 2026-03-16 | アプリアイコン作成・electron-builder でDMG/zip生成成功 | Claude Code |
| 2026-03-16 | uuid同梱修正、スクロール不能修正 | Codex |
| 2026-03-15 | 全ファイル初期実装 | Claude Code |

## 次にやること（Codex向け）
- [ ] **最優先: ビルド済み.appで画面が白くなる問題を修正** — `npm run electron:dev` では正常表示されるが、`npm run electron:build` → `/Applications` インストール後に白画面になる。原因: ビルド時に古い dist ファイルが残り、asar内のJSファイル名とindex.htmlの参照が不一致になっている可能性。`rm -rf dist dist-electron release` してからビルドすると直ることもあるが再発する
- [ ] RSSHubからXツイートが実際に取得できるか検証。取れない場合は代替手段を検討
- [ ] 設定画面にフォローするXアカウント一覧の表示・カスタマイズ機能追加（将来）

## 現在の問題
1. **白画面問題**: ビルド済み.appをインストールして起動すると白画面。devモードでは正常。distの古いファイルがasar内に混入している可能性
2. **RSSHub不安定**: XのツイートをRSSHub経由で取得する方式だが、RSSHubのX対応が不安定な可能性あり。未検証

## 引き継ぎメモ
- from: Claude Code
- to: Codex
- branch: main
- commit: 77e521d
- summary: 白画面問題の修正が最優先。`rm -rf dist dist-electron release && npm run electron:build` でクリーンビルドして `/Applications` に再インストールで確認。devモード(`npm run electron:dev`)では正常に動くことは確認済み。electron-builder.ymlのfilesセクションか、vite.config.tsのビルド設定を見直す必要あり。
- tests:
  - `npx tsc --noEmit` ✅
  - `npm run electron:dev` ✅（正常表示）
  - `npm run electron:build` ✅（ビルド自体は成功するが、生成された.appが白画面）

## ファイル構成
```
ai-news-digest/
├── electron/
│   ├── main.ts              # Electronメインプロセス（ウィンドウ、トレイ、IPC、shell.openExternal）
│   ├── preload.ts            # contextBridge によるAPI公開（openExternal含む）
│   ├── types/node-cron.d.ts  # node-cron型宣言
│   └── services/
│       ├── news-fetcher.ts   # RSSHub経由でXツイート取得 + フォールバックRSS
│       ├── summarizer.ts     # Claude API Sonnet 4で日本語要約
│       ├── scheduler.ts      # node-cronで定時実行
│       └── settings-store.ts # electron-storeで設定永続化
├── src/
│   ├── main.tsx              # Reactエントリ
│   ├── App.tsx               # メインコンポーネント（フィード/設定切替）
│   ├── index.css             # グローバルCSS（ダークテーマ、スピナー、hover）
│   ├── global.d.ts           # ElectronAPI型定義
│   ├── types/news.ts         # 型定義（AppSettings: anthropicApiKeyのみ）
│   └── components/
│       ├── Header.tsx        # ヘッダー（タブ、取得ボタン）
│       ├── NewsList.tsx      # ニュース一覧（まとめセクション無し）
│       ├── NewsCard.tsx      # ニュースカード（要約+時間のみ、クリックでChrome）
│       └── Settings.tsx      # 設定画面（Anthropic APIキー、スケジュール、取得件数）
├── build/
│   ├── icon.icns             # macOSアプリアイコン
│   ├── icon.png              # 1024x1024 PNG
│   └── icon.iconset/         # 全サイズアイコンセット
├── scripts/generate-icon.py  # アイコン生成スクリプト
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── electron-builder.yml
```

## テスト方法
```bash
npm run electron:dev    # 開発モード（これは正常動作する）
```

## ビルド・デプロイ方法
```bash
rm -rf dist dist-electron release   # 古いファイル削除（重要！）
npm run electron:build              # macOS用DMG生成
# /Applications に手動コピーまたは DMG からインストール
```
