import { callAI } from './client.js'
import { buildLinkPrompt } from './prompts.js'
import type { ScrapboxPage } from '../types.js'

const BATCH_SIZE = 10

export async function proposeLinks(
  domain: string,
  allPages: ScrapboxPage[],
  rules?: string,
): Promise<string[]> {
  const pages = allPages.filter((p) => p.title !== domain)
  const results: string[] = []

  for (let i = 0; i < pages.length; i += BATCH_SIZE) {
    const batch = pages.slice(i, i + BATCH_SIZE)
    const { system, user } = buildLinkPrompt(domain, batch, rules)
    const raw = await callAI(system, user)
    try {
      const parsed = JSON.parse(raw) as { pages: string[] }
      results.push(...parsed.pages)
    } catch {
      // skip malformed batch response
    }
  }

  return [...new Set(results)]
}
