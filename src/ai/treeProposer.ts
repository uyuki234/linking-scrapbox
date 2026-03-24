import { callAI } from './client.js'
import { buildTreePrompt } from './prompts.js'
import { parseTreeJson } from '../tree.js'
import type { ScrapboxPage, DomainTree } from '../types.js'

export async function proposeTree(
  pages: ScrapboxPage[],
  existingTree?: DomainTree,
  rules?: string,
): Promise<DomainTree> {
  const { system, user } = buildTreePrompt(pages, existingTree, rules)

  for (let attempt = 0; attempt <= 2; attempt++) {
    const raw = await callAI(system, user)
    try {
      return parseTreeJson(raw)
    } catch {
      if (attempt >= 2) throw new Error(`Failed to parse tree JSON after 3 attempts: ${raw}`)
    }
  }

  throw new Error('Unreachable')
}
