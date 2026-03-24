import { readFileSync } from 'fs'
import type { ScrapboxExport, DomainTree } from '../types.js'

export function loadExport(path: string): ScrapboxExport {
  const raw = readFileSync(path, 'utf-8')
  const data = JSON.parse(raw) as ScrapboxExport
  // Scrapbox の lines は {text: string} 形式の場合があるので正規化
  data.pages = data.pages
    .map((page) => ({
      ...page,
      lines: page.lines.map((line) =>
        typeof line === 'string' ? line : (line as { text: string }).text,
      ),
    }))
    .filter((page) => !page.title.endsWith('.icon'))
  return data
}

export function loadRules(path: string): string {
  return readFileSync(path, 'utf-8')
}

export function loadTree(path: string): DomainTree {
  const raw = readFileSync(path, 'utf-8')
  return JSON.parse(raw) as DomainTree
}
