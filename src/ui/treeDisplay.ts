import type { DomainTree } from '../types.js'

export function renderTree(tree: DomainTree, prefix = '', isRoot = true): string {
  const entries = Object.entries(tree)
  const lines: string[] = []

  entries.forEach(([key, subtree], idx) => {
    const isLast = idx === entries.length - 1

    if (isRoot) {
      lines.push(key)
      const childPrefix = ''
      const childLines = renderTree(subtree, childPrefix, false)
      if (childLines) lines.push(childLines)
    } else {
      const connector = isLast ? '└── ' : '├── '
      lines.push(prefix + connector + key)
      const childPrefix = prefix + (isLast ? '    ' : '│   ')
      const childLines = renderTree(subtree, childPrefix, false)
      if (childLines) lines.push(childLines)
    }
  })

  return lines.join('\n')
}
