import type { ScrapboxPage, DomainTree } from '../types.js'

export function buildTreePrompt(
  pages: ScrapboxPage[],
  existingTree?: DomainTree,
  rules?: string,
): { system: string; user: string } {
  const system = [
    'あなたはScrapboxのページを分野ごとに分類するアシスタントです。',
    'ユーザーからページタイトルの一覧を受け取り、分野ツリーをJSON形式で返してください。',
    '形式: {"分野A": {"サブ分野A1": {}, "サブ分野A2": {}}, "分野B": {}}',
    'JSONのみを返してください。説明文やコードブロック記号は不要です。',
    existingTree ? `既存のツリー構造を参考にしてください: ${JSON.stringify(existingTree)}` : '',
    rules ? `フォーマットルール:\n${rules}` : '',
  ]
    .filter(Boolean)
    .join('\n')

  const titles = pages.map((p) => p.title).join('\n')
  const user = `以下のページタイトル一覧を分類して、分野ツリーをJSONで返してください:\n\n${titles}`

  return { system, user }
}

export function buildAllLinksPrompt(
  domains: string[],
  pages: ScrapboxPage[],
  rules?: string,
): { system: string; user: string } {
  const system = [
    'あなたはScrapboxのページを分野に紐づけるアシスタントです。',
    '分野リストとページタイトルの一覧を受け取り、各分野に属するページをJSON形式で返してください。',
    '形式: {"分野A": ["タイトル1", "タイトル2"], "分野B": ["タイトル3"]}',
    '1つのページが複数の分野に属しても構いません。属さない分野は空配列にしてください。',
    'JSONのみを返してください。説明文やコードブロック記号は不要です。',
    rules ? `フォーマットルール:\n${rules}` : '',
  ]
    .filter(Boolean)
    .join('\n')

  const domainList = domains.join('\n')
  const titleList = pages.map((p) => p.title).join('\n')
  const user = `【分野リスト】\n${domainList}\n\n【ページタイトル一覧】\n${titleList}\n\n各分野に属するページをJSONで返してください。`

  return { system, user }
}

export function buildParentPrompt(
  domains: string[],
  existingTree: DomainTree,
  rules?: string,
): { system: string; user: string } {
  const system = [
    'あなたはScrapboxの分野を整理するアシスタントです。',
    '分野リストを受け取り、関連する分野をまとめる上位分野を提案してください。',
    '形式: [{"children": ["分野1", "分野2"], "parentName": "上位分野名", "grandParent": "さらに上の分野名（省略可）"}]',
    'JSONのみを返してください。説明文やコードブロック記号は不要です。',
    `既存のツリー構造を参考にしてください: ${JSON.stringify(existingTree)}`,
    rules ? `フォーマットルール:\n${rules}` : '',
  ]
    .filter(Boolean)
    .join('\n')

  const user = `以下の分野リストをまとめる上位分野をJSONで提案してください:\n\n${domains.join('\n')}`

  return { system, user }
}
