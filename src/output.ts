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
  const pageToDomainsMap = new Map<string, string[]>()

  for (const assignment of assignments) {
    for (const pageTitle of assignment.pages) {
      const existing = pageToDomainsMap.get(pageTitle) ?? []
      existing.push(assignment.domain)
      pageToDomainsMap.set(pageTitle, existing)
    }
  }

  const updatedPages = exportData.pages.map((page) => {
    const domains = pageToDomainsMap.get(page.title)
    if (!domains || domains.length === 0) return page

    const linkLine = domains.map((d) => `[${d}]`).join(' ')
    const lines = [...page.lines]

    if (detectLinkLine(lines)) {
      lines[0] = linkLine
    } else {
      lines.unshift(linkLine)
    }

    return { ...page, lines }
  })

  return { ...exportData, pages: [...updatedPages, ...newDomainPages] }
}
