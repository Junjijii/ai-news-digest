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
v1.0.0 開発中 - 白画面問題は修正済み、RSSHub の公開 X ルートは未実用

## 協業ステータス
- lead: Claude Code
- executor: Codex
- phase: review
- handoff_ready: false
- next_owner: Claude Code
- final_owner: Claude Code
- updated_at: 2026-03-16

## 直近の変更（最新を上に追記）
| 日付 | 変更内容 | 担当 |
|------|---------|------|
| 2026-03-16 | 白画面対策として build を毎回クリーン化し、renderer 資産名を安定化。起動時 feed を sanitize し、ErrorBoundary を追加。`npm run electron:build` 後の packaged app 起動を確認 | Codex |
| 2026-03-16 | RSSHub 公開インスタンスの X route を実測検証。`rsshub.app` は `302 -> google.com/404`、`rsshub.rssforever.com` は `503`、`rsshub-instance.zeabur.app` は `404`。取得ロジックを probe ベースにして、失敗時は即フォールバック RSS へ切替。壊れた handle 群も整理 | Codex |
| 2026-03-16 | XのAIインフルエンサー投稿をRSSHub経由で収集する方式に変更。カテゴリタグ・出典・まとめセクション削除。リンクをChromeで開くようにshell.openExternal使用。24時間以内フィルタ追加 | Claude Code |
| 2026-03-16 | X API廃止→無料RSSフィード方式に切替。設定画面からX Bearer Token欄を削除 | Claude Code |
| 2026-03-16 | アプリアイコン作成・electron-builder でDMG/zip生成成功 | Claude Code |
| 2026-03-16 | uuid同梱修正、スクロール不能修正 | Codex |
| 2026-03-15 | 全ファイル初期実装 | Claude Code |

## 次にやること（Codex向け）
- [x] **最優先: ビルド済み.appで画面が白くなる問題を修正** — `build` / `electron:build` にクリーン手順を組み込み、renderer 資産名を固定化。packaged app 起動確認済み
- [x] RSSHubからXツイートが実際に取得できるか検証。公開インスタンスでは現状失敗することを確認し、probe 後にフォールバック RSS へ切替
- [ ] 自前 RSSHub（Twitter ログイン設定あり）を使うか、別の X 取得手段へ切り替えるかを決める
- [ ] 設定画面にフォローするXアカウント一覧の表示・カスタマイズ機能追加（将来）

## 現在の問題
1. **RSSHub公開インスタンスで X route が実用不可**: `twitter/user/:handle` に対して `302/503/404` を確認。現状のアプリはテックメディア RSS が主系になる
2. **packaged app の実機 GUI 目視は未取得**: clean build 後にターミナル起動で main process 正常起動は確認したが、最終的な Finder 経由の目視確認は未実施

## 引き継ぎメモ
- from: Codex
- to: Claude Code
- branch: main
- commit: この更新を含む最新の main を参照
- summary: 白画面対策は、`build` / `electron:build` に `clean` を組み込み、renderer の出力を `assets/app.js` / `assets/index.css` に固定し、起動時に保存済み feed を sanitize、renderer に ErrorBoundary を追加して実施。`npm run electron:build` 後の packaged app はターミナル起動で白画面由来の即死を再現せず起動。RSSHub は公開インスタンスの `twitter/user/:handle` が `302/503/404` で失敗するため、事前 probe で判定してダメなら即フォールバック RSS へ回すように変更。次は X 取得手段を自前 RSSHub か別経路へ設計し直す段階。
- tests:
  - `npx tsc --noEmit` ✅
  - `npm run electron:build` ✅（クリーンビルド + DMG/zip 生成）
  - `ELECTRON_ENABLE_LOGGING=1 "release/mac-arm64/AI News Digest.app/Contents/MacOS/AI News Digest"` ✅（main process 起動確認）
  - `curl -L --max-time 20 -A 'AI-News-Digest/1.0' -I https://rsshub.app/twitter/user/sama` → `302`
  - `curl -L --max-time 20 -A 'AI-News-Digest/1.0' -I https://rsshub.rssforever.com/twitter/user/sama` → `503`
  - `curl -L --max-time 20 -A 'AI-News-Digest/1.0' -I https://rsshub-instance.zeabur.app/twitter/user/sama` → `404`

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
