# linking-scrapbox

ScrapboxのエクスポートJSONを入力として、AIが各ページの関連分野を分析し、間接リンクを挿入したJSONを出力するCLIツール。

**ユーザーが主体**で、AIは候補の提案に徹します。すべての提案はユーザーが確認・承認・編集してから反映されます。

## 概念

ページ同士を直接繋げず、「分野ページ」を経由した間接リンク構造にします。

```
58ハッカソン  →  [ハッカソン] [個人開発]  （ページ末尾に挿入）
```

## セットアップ

```bash
git clone https://github.com/uyuki234/linking-scrapbox
cd linking-scrapbox
npm install
npm run build
```

`.env` ファイルを作成してAPIキーを設定します。

### Groq を使う場合（推奨・完全無料）

APIキーは https://console.groq.com で取得できます。

```env
AI_PROVIDER=groq
GROQ_API_KEY=gsk_...
GROQ_MODEL=llama-3.3-70b-versatile
```

### Gemini を使う場合（無料枠あり）

APIキーは https://aistudio.google.com で取得できます。

```env
AI_PROVIDER=gemini
GEMINI_API_KEY=AIza...
GEMINI_MODEL=gemini-2.5-flash-lite
```

## 使い方

Scrapboxの設定 → エクスポート → JSON でエクスポートファイルを取得し、`data/` に置きます。

```bash
npm start -- --input data/{あなたのプロジェクト名}.json --output data/output.json
```

出力された `data/output.json` を Scrapbox にインポートします。

### オプション

| オプション | 説明 |
|---|---|
| `--input <path>` | Scrapboxエクスポートファイル（必須） |
| `--output <path>` | 出力ファイル（必須） |
| `--format <path>` | AIへの指示ファイル（任意、未指定時は `docs/config.md` を自動読み込み） |
| `--tree-in <path>` | 前回保存したツリーを再利用（任意） |
| `--tree-out <path>` | 今回のツリーを保存（任意） |

## 操作方法

### 分野ツリーの確認

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
| `y` | 承認して次へ |
| `e` | `$EDITOR` で直接編集 |
| `r` | AIに再提案を依頼 |

### ページ紐づけの確認

```
=== ページ紐づけ (3/18): ハッカソン ===
紐づけ候補: [58ハッカソン] [ハッカソンの開発手法]

[y]全採用  [e]編集  [s]スキップ  [q]終了・保存 >
```

| キー | 操作 |
|---|---|
| `y` | 全候補を採用 |
| `e` | `$EDITOR` で手動編集（1行1ページ） |
| `s` | この分野をスキップ |
| `q` | 途中終了して結果を保存 |

## 出力形式

既存ページの末尾に分野リンク行が追加されます。

```json
{
  "pages": [
    {
      "title": "58ハッカソン",
      "lines": [
        "...既存の内容...",
        "[ハッカソン] [個人開発]"
      ]
    }
  ]
}
```

## 注意事項

- `data/` ディレクトリは `.gitignore` で除外されています。個人データはここに置いてください
- `.env` も `.gitignore` で除外されています。APIキーをコミットしないよう注意してください
