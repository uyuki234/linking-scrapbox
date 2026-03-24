import { readFileSync } from 'fs'
import type { ScrapboxExport, DomainTree } from '../types.js'

type ScrapboxLineRaw = string | { text: string }

interface ScrapboxPageRaw {
  lines: ScrapboxLineRaw[]
  [key: string]: unknown
}

interface ScrapboxExportRaw {
  pages: ScrapboxPageRaw[]
  [key: string]: unknown
}

function isScrapboxLineObject(value: unknown): value is { text: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'text' in value &&
    typeof (value as { text: unknown }).text === 'string'
  )
}

function normalizeScrapboxExport(input: unknown): ScrapboxExport {
  const raw = input as ScrapboxExportRaw

  if (!raw || !Array.isArray(raw.pages)) {
    throw new Error('Invalid Scrapbox export: "pages" must be an array')
  }

  const pages = raw.pages.map((page) => {
    const rawLines = Array.isArray(page.lines) ? page.lines : []

    const lines = rawLines.map((line) => {
      if (typeof line === 'string') {
        return line
      }
      if (isScrapboxLineObject(line)) {
        return line.text
      }
      return String((line as { text?: unknown }).text ?? '')
    })

    return {
      ...page,
      lines,
    }
  })

  return {
    ...(raw as unknown as Record<string, unknown>),
    pages,
  } as ScrapboxExport
}

export function loadExport(path: string): ScrapboxExport {
  const raw = readFileSync(path, 'utf-8')
  const parsed = JSON.parse(raw) as unknown
  return normalizeScrapboxExport(parsed)
}

export function loadRules(path: string): string {
  return readFileSync(path, 'utf-8')
}

export function loadTree(path: string): DomainTree {
  const raw = readFileSync(path, 'utf-8')
  return JSON.parse(raw) as DomainTree
}
