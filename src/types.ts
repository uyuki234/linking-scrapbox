export type ScrapboxPage = { title: string; lines: string[] }
export type ScrapboxExport = { pages: ScrapboxPage[] }
export type DomainTree = { [domain: string]: DomainTree }
export type DomainAssignment = { domain: string; pages: string[] }
export type ParentProposal = { children: string[]; parentName: string; grandParent?: string }
export type Config = {
  inputPath: string
  outputPath: string
  formatPath?: string
  treeInPath?: string
  treeOutPath?: string
}
