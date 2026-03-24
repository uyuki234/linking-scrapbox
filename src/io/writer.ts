import { writeFileSync } from 'fs'
import type { ScrapboxExport, DomainTree } from '../types.js'

export function writeOutput(path: string, data: ScrapboxExport): void {
  writeFileSync(path, JSON.stringify(data, null, 2), 'utf-8')
}

export function writeTree(path: string, tree: DomainTree): void {
  writeFileSync(path, JSON.stringify(tree, null, 2), 'utf-8')
}
