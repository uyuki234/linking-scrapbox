import { readFileSync } from 'fs'
import type { ScrapboxExport, DomainTree } from '../types.js'

export function loadExport(path: string): ScrapboxExport {
  const raw = readFileSync(path, 'utf-8')
  return JSON.parse(raw) as ScrapboxExport
}

export function loadRules(path: string): string {
  return readFileSync(path, 'utf-8')
}

export function loadTree(path: string): DomainTree {
  const raw = readFileSync(path, 'utf-8')
  return JSON.parse(raw) as DomainTree
}
