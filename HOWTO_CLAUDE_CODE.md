# Claude Code バイブコーディング How-To

## インストール

```bash
npm install -g @anthropic-ai/claude-code
```

初回起動時にAnthropicアカウントへのログインが求められる。

```bash
claude
```

---

## 基本的な使い方

プロジェクトのディレクトリで起動するだけ。

```bash
cd my-project
claude
```

Claude Codeはそのディレクトリ以下のファイルをすべて読める状態になる。
あとは自然言語で話しかけるだけ。

```
> index.jsを作って。CLIツールで、--inputと--outputオプションを受け取るやつ
```

---

## CLAUDE.md が最重要

<invoke name="visualize:read_me">
プロジェクトルートに `CLAUDE.md` を置くと、**毎セッション自動で読み込まれる**。
ここに書いたことがClaudeの「前提知識」になる。

```md
# プロジェクト概要
ScrapboxエクスポートJSONを処理するCLIツール。

# 技術スタック
- Node.js (ESModules)
- Anthropic SDK (@anthropic-ai/sdk)
- inquirer でCLI対話

# コーディング規約
- async/await を使う（Promiseチェーンは使わない）
- エラーは必ずcatchして日本語メッセージで表示
- コメントは日本語で書く

# よく使うコマンド
- 実行: node index.js --input export.json --output output.json
- テスト: node test.js
```

**CLAUDE.mdに書くと良いもの**
- プロジェクトの目的・概要
- 技術スタック・使用ライブラリ
- コーディング規約・好みのスタイル
- よく使うコマンド（ビルド・テスト・実行）
- やってほしくないこと（「勝手にpackage.jsonを変えない」など）

---

## バイブコーディングのワークフロー

### 1. まず計画を立てさせる（重要）

いきなりコードを書かせるより、先に計画を確認する。

```
> REQUIREMENTS.mdを読んで、実装の計画をplan.mdに書いて。
  コードはまだ書かなくていい
```

計画を確認してからGoサインを出す。

```
> plan.mdの計画でOK。index.jsから実装を始めて
```

### 2. 小さく進める

一度に全部作らせると迷走しやすい。機能単位で進める。

```
> まずCLIオプションのパースだけ実装して
> 次にJSONの読み込みと基本的なデータ構造を作って
> ツリー表示の部分を実装して
```

### 3. 詰まったらコンテキストをリセット

長くなったセッションは `/clear` でリセット。
CLAUDE.mdがあれば前提知識は保たれる。

```
/clear
> index.jsのrunAnalysis関数にバグがある。修正して
```

### 4. 途中でファイルを確認させる

```
> 今のindex.jsの構造を説明して
> このコードで問題になりそうな点は？
```

---

## 便利なコマンド

| コマンド | 内容 |
|---|---|
| `/clear` | コンテキストをリセット |
| `/compact` | コンテキストを圧縮（長いセッション向け） |
| `Shift+Tab` 2回 | Planモード（計画だけ立ててコードを書かない） |
| `Esc Esc` | 直前の変更を巻き戻す |
| Ctrl+C | 処理を中断 |

---

## このプロジェクトでの推奨ワークフロー

### セットアップ

```bash
mkdir scrapbox-linker
cd scrapbox-linker
npm init -y
# REQUIREMENTS.md と CLAUDE.md をここに置く
claude
```

### CLAUDE.md のひな形

```md
# linking-scrapbox

## 概要
REQUIREMENTS.mdを参照。

## 技術スタック
- Node.js ESModules
- @anthropic-ai/sdk
- inquirer（CLI対話）

## コーディング規約
- async/await のみ使用
- エラーは日本語で表示
- コメントは日本語

## 実行コマンド
node index.js --input export.json --output output.json --tree-out tree.json

## 注意
- APIキーは .env の ANTHROPIC_API_KEY から読む
- 勝手にpackage.jsonのdependenciesを増やさない
```

### 最初のプロンプト

```
REQUIREMENTS.mdを読んで、このプロジェクトの実装計画をplan.mdに書いて。
ファイル構成と、各ファイルの責務も含めて。コードはまだ書かない。
```

計画を確認したら：

```
plan.mdの計画でOK。まずCLIのエントリーポイント（index.js）と、
JSONの読み書きをするモジュール（lib/io.js）から実装して
```

---

## よくあるトラブル

**Claudeが計画を無視して進みすぎる**
→ `Esc` で止めて「待って、まず〇〇を確認したい」と言う

**コードが複雑になりすぎた**
→ 「このファイルをリファクタリングして。関数は1つ20行以内に収めて」

**想定と違う実装をされた**
→ `Esc Esc` で巻き戻してから「〇〇ではなく〇〇の方法でやって」

**セッションが長くなってきた**
→ `/compact` でコンテキストを圧縮するか `/clear` でリセット
