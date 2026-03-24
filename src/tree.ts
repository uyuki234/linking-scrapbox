import type { DomainTree } from './types.js'
import { stripCodeBlock } from './ai/utils.js'

export function flattenDomains(tree: DomainTree): string[] {
  const result: string[] = []
  for (const [key, subtree] of Object.entries(tree)) {
    result.push(key)
    result.push(...flattenDomains(subtree))
  }
  return result
}

export function getParentOf(tree: DomainTree, domain: string, _parent?: string): string | undefined {
  for (const [key, subtree] of Object.entries(tree)) {
    if (key === domain) return _parent
    const found = getParentOf(subtree, domain, key)
    if (found !== undefined) return found
  }
  return undefined
}

export function parseTreeJson(json: string): DomainTree {
  let parsed: unknown
  try {
    parsed = JSON.parse(stripCodeBlock(json))
  } catch {
    throw new Error(`Invalid JSON: ${json}`)
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error(`Expected an object, got: ${typeof parsed}`)
  }

  validateDomainTree(parsed as Record<string, unknown>)
  return parsed as DomainTree
}

function validateDomainTree(obj: Record<string, unknown>): void {
  for (const [key, value] of Object.entries(obj)) {
    if (typeof key !== 'string') throw new Error(`Key must be a string: ${String(key)}`)
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      throw new Error(`Value for "${key}" must be an object`)
    }
    validateDomainTree(value as Record<string, unknown>)
  }
}
