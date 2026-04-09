# 📚 学習管理・自動復習アプリ

Next.js (App Router) + TypeScript + Tailwind CSS で構築した、GitHub Pages 対応の学習管理アプリです。

## 機能

- **24時間バーティカルスケジュール** — 現在時刻オートスクロール、ルーティン📌表示
- **自動復習生成** — 学習完了時に「1日後・1週間後・1ヶ月後」の復習タスクを自動展開
- **重複防止ロジック** — 同じ内容の復習が重複しない
- **1日の5段階評価** — 😭😅😃😝🥳 でカレンダーに記録
- **試験日カウントダウン** — カレンダー画面で残り日数表示
- **月次・週次目標管理** — 期間切替時にアラート表示
- **PCCS 24色** — 日本色研配色体系の科目カラー
- **ブラウザ通知** — Notification API 対応
- **LocalStorage 永続化**

## セットアップ

```bash
npm install
npm run dev
```

## GitHub Pages デプロイ

1. `next.config.js` の `basePath` をリポジトリ名に変更

```js
basePath: process.env.NODE_ENV === 'production' ? '/YOUR-REPO-NAME' : '',
assetPrefix: process.env.NODE_ENV === 'production' ? '/YOUR-REPO-NAME/' : '',
```

2. GitHub リポジトリの **Settings > Pages** で Source を **GitHub Actions** に設定

3. `main` ブランチにプッシュすると自動デプロイ

## 技術スタック

| 項目 | 技術 |
|------|------|
| フレームワーク | Next.js 14 (App Router) |
| 言語 | TypeScript |
| スタイル | Tailwind CSS |
| 状態管理 | Zustand + LocalStorage |
| 日付処理 | date-fns |
| デプロイ | GitHub Actions → GitHub Pages |
