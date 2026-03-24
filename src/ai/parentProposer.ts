import { callAI } from './client.js'
import { buildParentPrompt } from './prompts.js'
import { stripCodeBlock } from './utils.js'
import { flattenDomains } from '../tree.js'
import type { DomainTree, ParentProposal } from '../types.js'

export async function proposeParents(
  tree: DomainTree,
  rules?: string,
): Promise<ParentProposal[]> {
  const domains = flattenDomains(tree)
  const { system, user } = buildParentPrompt(domains, tree, rules)
  const raw = await callAI(system, user)
  const stripped = stripCodeBlock(raw)
  try {
    return JSON.parse(stripped) as ParentProposal[]
  } catch {
    throw new Error(`Failed to parse parent proposals JSON: ${raw}`)
  }
}
