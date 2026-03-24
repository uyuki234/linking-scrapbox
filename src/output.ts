import type { ScrapboxExport, ScrapboxPage, DomainAssignment } from './types.js'

function isLinkLine(line: string): boolean {
  const trimmed = line.trim()
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
    // 末尾の既存リンク行を上書き、なければ末尾に追加
    const lines = [...page.lines]
    if (lines.length > 0 && isLinkLine(lines[lines.length - 1])) {
      lines[lines.length - 1] = linkLine
    } else {
      lines.push(linkLine)
    }

    return { ...page, lines }
  })

  return { ...exportData, pages: [...updatedPages, ...newDomainPages] }
}
