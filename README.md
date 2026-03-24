# linking-scrapbox

ScrapboxのエクスポートJSONを入力として、AIが各ページの関連分野を分析し、間接リンクを挿入したJSONを出力するCLIツールです。

**ユーザーが主体**で、AIは候補の提案に徹します。すべての提案はユーザーが確認・承認・編集してから反映されます。

ページ紐づけ処理はAIへのリクエストを一括にまとめているため、無料枠の範囲内での動作を想定しています。

## 仕組み

ページ同士を直接繋げず、「分野ページ」を経由した間接リンク構造を構築します。

```
WSL  →  [開発環境] [Windows] [Linux]  （ページ末尾に挿入）
```

間接リンク構造を導入することで、関連する分野のページへ効率的に移動できるようになります。

## 必要なもの

- Node.js 20 以上
- Groq または Gemini の APIキー（いずれも無料枠あり）

## セットアップ

```bash
git clone https://github.com/uyuki234/linking-scrapbox
cd linking-scrapbox
npm install
npm run build
```

プロジェクトルートに `.env` ファイルを作成し、APIキーを設定します。

### Groq を使用する場合（推奨）

APIキーは [console.groq.com](https://console.groq.com) で取得できます。無料枠のリクエスト上限が大きく、安定して動作します。

```env
AI_PROVIDER=groq
GROQ_API_KEY=gsk_...
GROQ_MODEL=llama-3.3-70b-versatile
```

### Gemini を使用する場合

APIキーは [aistudio.google.com](https://aistudio.google.com) で取得できます。課金設定のないプロジェクトで作成したキーを使用してください。

```env
AI_PROVIDER=gemini
GEMINI_API_KEY=AIza...
GEMINI_MODEL=gemini-2.5-flash-lite
```

## 使い方

Scrapbox の設定 → エクスポート → JSON でエクスポートファイルを取得し、`data/` ディレクトリに配置します。

```bash
npm start -- --input data/export.json --output data/output.json
```

処理が完了したら、出力された `data/output.json` を Scrapbox にインポートします。

### オプション

| オプション | 説明 |
|---|---|
| `--input <path>` | Scrapboxエクスポートファイル（必須） |
| `--output <path>` | 出力ファイル（必須） |
| `--format <path>` | AIへの指示ファイル（省略時は `docs/config.md` を自動読み込み） |
| `--tree-in <path>` | 前回保存したツリーファイルを読み込む（任意） |
| `--tree-out <path>` | 今回生成したツリーをファイルに保存する（任意） |

### AIへの指示をカスタマイズする

`docs/config.md` を編集することで、分野の粒度・言語・除外するページなどをAIに指示できます。`--format` で別のファイルを指定することも可能です。

## 操作方法

### ステップ1: 分野ツリーの確認

AIが全ページを分析し、分野の階層構造を提案します。

```
=== 分野ツリー提案 ===
技術
├── プログラミング言語
│   ├── Rust
│   └── Python
└── 機械学習

[y]承認  [e]編集  [r]再提案 >
```

| キー | 操作 |
|---|---|
| `y` | 承認して次のステップへ |
| `e` | `$EDITOR` でツリーを直接編集 |
| `r` | AIに再提案を依頼 |

### ステップ2: ページ紐づけの確認

各分野に対してAIが候補ページを提示します。分野ごとに採否を決定します。

```
=== ページ紐づけ (3/18): 開発環境 ===
紐づけ候補: [WSL] [Dockerの使い方] [Homebrewセットアップ]

[y]全採用  [e]編集  [s]スキップ  [q]終了・保存 >
```

| キー | 操作 |
|---|---|
| `y` | 全候補を採用 |
| `e` | `$EDITOR` で手動編集（1行1ページ） |
| `s` | この分野をスキップ |
| `q` | 途中で終了し、それまでの結果を保存 |

## 出力形式

既存ページの末尾に分野リンク行が追加されます。Scrapboxのインポート形式に準拠しています。

```json
{
  "pages": [
    {
      "title": "WSL",
      "lines": [
        "...既存の内容...",
        "[開発環境] [Windows] [Linux]"
      ]
    }
  ]
}
```

## セキュリティに関する注意

- `data/` ディレクトリは `.gitignore` に含まれています。個人データはこのディレクトリに配置してください
- `.env` も `.gitignore` に含まれています。APIキーをリポジトリにコミットしないよう注意してください

## Contributing

バグ報告・機能提案・PRを歓迎します。詳細は [CONTRIBUTING.md](./CONTRIBUTING.md) を参照してください。

## License

[MIT](./LICENSE)
