import { callAI } from './client.js'
import { buildAllLinksPrompt } from './prompts.js'
import type { ScrapboxPage, DomainAssignment } from '../types.js'

export async function proposeAllLinks(
  domains: string[],
  allPages: ScrapboxPage[],
  rules?: string,
): Promise<DomainAssignment[]> {
  const { system, user } = buildAllLinksPrompt(domains, allPages, rules)
  const raw = await callAI(system, user)

  const stripped = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  let parsed: Record<string, string[]>
  try {
    parsed = JSON.parse(stripped) as Record<string, string[]>
  } catch {
    throw new Error(`Failed to parse page link JSON: ${raw}`)
  }

  return domains.map((domain) => ({
    domain,
    pages: (parsed[domain] ?? []).filter((t) => t !== domain),
  }))
}
