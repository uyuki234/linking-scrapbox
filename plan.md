# 実装計画: linking-scrapbox

## 技術スタック

- **言語**: TypeScript (Node.js)
- **AIクライアント**: `@anthropic-ai/sdk`
- **CLIパース**: `commander`
- **ユーザー対話**: `readline` (標準ライブラリ、インタラクティブなキー入力)
- **ツリー表示**: 自前実装（依存を減らすため）

---

## ファイル構成

```
linking-scrapbox/
├── src/
│   ├── index.ts               # エントリーポイント
│   ├── cli.ts                 # メインフロー制御（ステップ順次実行）
│   ├── types.ts               # 全体で使う型定義
│   │
│   ├── io/
│   │   ├── loader.ts          # 入力ファイル読み込み
│   │   └── writer.ts          # 出力ファイル書き込み（output.json, tree.json）
│   │
│   ├── ai/
│   │   ├── client.ts          # Anthropic SDK ラッパー（レート制限・バッチ処理）
│   │   ├── prompts.ts         # プロンプトテンプレート定義
│   │   ├── treeProposer.ts    # 分野ツリー提案ロジック
│   │   ├── pageLinker.ts      # ページ紐づけ候補提案ロジック
│   │   └── parentProposer.ts  # 上位分野提案ロジック
│   │
│   ├── ui/
│   │   ├── treeDisplay.ts     # ツリーをASCIIアートで表示
│   │   ├── interaction.ts     # キー入力待ち受け [y][e][r][s][q]
│   │   └── editor.ts          # $EDITOR 起動・一時ファイル管理
│   │
│   ├── tree.ts                # ツリーデータ構造の操作（変換・マージ・追加）
│   └── output.ts              # output.json の組み立て（リンク行挿入ロジック）
│
├── package.json
├── tsconfig.json
└── README.md
```

---

## 各ファイルの責務

### `src/index.ts`
- `commander` で CLI オプションをパース（`--input`, `--output`, `--format`, `--tree-in`, `--tree-out`）
- 必須オプションの検証
- `cli.ts` の `run()` を呼ぶだけ

### `src/cli.ts`
- フロー全体のオーケストレーション（ステップ1〜5を順に実行）
- 各ステップ間のデータ受け渡し
- `--tree-out` が指定されていれば途中経過を保存

### `src/types.ts`
```ts
// Scrapboxページ
type ScrapboxPage = { title: string; lines: string[]; [key: string]: unknown }
type ScrapboxExport = { pages: ScrapboxPage[] }

// ツリー（再帰的オブジェクト）
type DomainTree = { [domain: string]: DomainTree }

// ページ紐づけ結果
type DomainAssignment = { domain: string; pages: string[] }

// 上位分野提案
type ParentProposal = { children: string[]; parentName: string; grandParent?: string }

// CLI設定
type Config = {
  inputPath: string
  outputPath: string
  formatPath?: string
  treeInPath?: string
  treeOutPath?: string
}
```

### `src/io/loader.ts`
- `loadExport(path)`: export.json を読んで `ScrapboxExport` を返す
- `loadRules(path)`: rules.md/txt を読んで文字列を返す
- `loadTree(path)`: tree.json を読んで `DomainTree` を返す

### `src/io/writer.ts`
- `writeOutput(path, data)`: output.json を書き出す
- `writeTree(path, tree)`: tree.json を書き出す

### `src/ai/client.ts`
- Anthropic クライアントの初期化（`ANTHROPIC_API_KEY` から）
- `callAI(prompt)`: APIを呼び出してテキストを返す
- バッチ処理対応: ページリストを5〜10件ずつに分割して呼び出す
- レート制限エラー時のリトライ（exponential backoff）

### `src/ai/prompts.ts`
- 各AIタスク向けのプロンプトテンプレートを定数として定義
  - `buildTreePrompt(pages, existingTree?, rules?)`: 分野ツリー提案用
  - `buildLinkPrompt(domain, pages, rules?)`: ページ紐づけ候補提案用
  - `buildParentPrompt(domains, existingTree, rules?)`: 上位分野提案用

### `src/ai/treeProposer.ts`
- `proposeTree(pages, existingTree?, rules?)`: 全ページを分析して `DomainTree` を提案
- ページのタイトル+本文をAIに渡す（本文は先頭数行に絞る）

### `src/ai/pageLinker.ts`
- `proposeLinks(domain, allPages, rules?)`: 1分野に対してページ候補リストを返す
- バッチ処理でページを分割してAIに問い合わせ
- 自己参照（分野名 === ページタイトル）は除外

### `src/ai/parentProposer.ts`
- `proposeParents(tree, rules?)`: ツリーを見て上位分野候補を `ParentProposal[]` で返す

### `src/ui/treeDisplay.ts`
- `renderTree(tree)`: `DomainTree` を以下のようなASCIIで返す
  ```
  技術
  ├── プログラミング言語
  │   ├── Rust
  │   └── Python
  └── 機械学習
  ```

### `src/ui/interaction.ts`
- `askUser(prompt, choices)`: 1文字キー入力を待ち受け、選択肢に応じた値を返す
  - 例: `askUser("[y]承認  [e]編集  [r]再提案", ["y","e","r"])`
- rawモードで1キーで即反応（Enterが不要）

### `src/ui/editor.ts`
- `openInEditor(content, ext?)`: 一時ファイルを作成し `$EDITOR` で開いて編集後の内容を返す
- 環境変数 `EDITOR` が未設定なら `vi` にフォールバック

### `src/tree.ts`
- `flattenDomains(tree)`: ツリーを全分野のフラットなリストに変換
- `getParentOf(tree, domain)`: ある分野の親を返す
- `addNode(tree, parent, child)`: ツリーにノードを追加
- `parseTreeJson(json)`: JSON文字列を `DomainTree` にパース（バリデーション含む）

### `src/output.ts`
- `buildOutput(exportData, assignments, newDomainPages)`: output.json を組み立てる
  - 既存ページの先頭に分野リンク行を挿入（既存リンク行があれば上書き）
  - リンク行は `[分野A] [分野B]` の形式
  - 新規分野ページ（上位分野等）を追加
- `detectLinkLine(lines)`: 先頭行がリンク行かどうかを判定する

---

## 実装ステップ

### Phase 1: 土台
1. `package.json` / `tsconfig.json` セットアップ、依存インストール
2. `src/types.ts` 型定義
3. `src/io/loader.ts` + `src/io/writer.ts`
4. `src/index.ts` CLIパース

### Phase 2: UI層
5. `src/ui/treeDisplay.ts` ツリー表示
6. `src/ui/interaction.ts` キー入力
7. `src/ui/editor.ts` エディタ起動

### Phase 3: AI層
8. `src/ai/client.ts` APIラッパー
9. `src/ai/prompts.ts` プロンプト定義
10. `src/ai/treeProposer.ts`
11. `src/ai/pageLinker.ts`
12. `src/ai/parentProposer.ts`

### Phase 4: コアロジック
13. `src/tree.ts` ツリー操作
14. `src/output.ts` 出力組み立て

### Phase 5: 統合
15. `src/cli.ts` フロー制御
16. E2Eで動作確認（サンプルデータで全ステップ通す）

---

## 主要な設計上の判断

| 課題 | 判断 |
|------|------|
| ツリー編集のUI | `$EDITOR` で tree.json を直接編集させる（シンプル・柔軟） |
| AIレスポンス形式 | JSON形式で返させる（プロンプトで指定）、パース失敗時は再試行 |
| バッチサイズ | ページ紐づけは10件ずつ、ツリー提案は全タイトル一括（本文省略） |
| リンク行の検出 | 先頭行が `[...]` のみで構成される行をリンク行と見なす |
| 中断・再開 | `--tree-in` で承認済みツリーを渡すことでステップ3から再開できる |
| npx対応 | `package.json` の `bin` フィールドに `linking-scrapbox` を登録 |
