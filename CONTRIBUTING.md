# Contributing to linking-scrapbox

コントリビューションを歓迎します！バグ報告・機能提案・PRなど、どんな形でも構いません。

## 開発環境のセットアップ

```bash
git clone https://github.com/uyuki234/linking-scrapbox
cd linking-scrapbox
npm install
npm run build
```

`.env` を作成してAPIキーを設定してください（[README](./README.md) を参照）。

## 開発の進め方

1. `main` から作業ブランチを切る
   ```bash
   git checkout -b feat/your-feature
   ```

2. 変更を加えてビルドが通ることを確認する
   ```bash
   npm run build
   ```

3. PRを作成する（`main` ブランチへ）

## ブランチ命名規則

| プレフィックス | 用途 |
|---|---|
| `feat/` | 新機能 |
| `fix/` | バグ修正 |
| `refactor/` | リファクタリング |
| `docs/` | ドキュメント |
| `chore/` | 設定・ツール類 |

## PRのガイドライン

- 1つのPRは1つのテーマに絞る
- ビルドエラーがないことを確認してから出す
- 変更の意図を説明するコメントをPR本文に書く

## Issue の報告

バグ報告・機能提案はそれぞれのテンプレートを使ってください。
