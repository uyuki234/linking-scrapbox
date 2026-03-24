import type { ScrapboxExport, ScrapboxPage, DomainAssignment } from './types.js'

export function detectLinkLine(lines: string[]): boolean {
  if (lines.length === 0) return false
  const first = lines[0]
  if (!first) return false
  const trimmed = first.trim()
  if (trimmed === '') return false
  return /^(\[[^\]]+\]\s*)+$/.test(trimmed)
}

export function buildOutput(
  exportData: ScrapboxExport,
  assignments: DomainAssignment[],
  newDomainPages: ScrapboxPage[],
): ScrapboxExport {
  const pageToDomainsMap = new Map<string, Set<string>>()

  for (const assignment of assignments) {
    for (const pageTitle of assignment.pages) {
      const existing = pageToDomainsMap.get(pageTitle) ?? new Set<string>()
      existing.add(assignment.domain)
      pageToDomainsMap.set(pageTitle, existing)
    }
  }

  const updatedPages = exportData.pages.map((page) => {
    const domainSet = pageToDomainsMap.get(page.title)
    if (!domainSet || domainSet.size === 0) return page

    const lines = [...page.lines]

    if (detectLinkLine(lines)) {
      // Parse existing bracket links and merge with new domains
      const existingLinks = (lines[0] ?? '')
        .trim()
        .match(/\[([^\]]+)\]/g)
        ?.map((m) => m.slice(1, -1)) ?? []
      const mergedDomains = Array.from(new Set([...existingLinks, ...domainSet])).sort((a, b) => a.localeCompare(b))
      lines[0] = mergedDomains.map((d) => `[${d}]`).join(' ')
    } else {
      const domains = Array.from(domainSet).sort((a, b) => a.localeCompare(b))
      lines.unshift(domains.map((d) => `[${d}]`).join(' '))
    }

    return { ...page, lines }
  })

  const existingTitles = new Set(updatedPages.map((page) => page.title))
  const filteredNewDomainPages = newDomainPages.filter(
    (page) => !existingTitles.has(page.title),
  )

  return { ...exportData, pages: [...updatedPages, ...filteredNewDomainPages] }
}
