import * as readline from 'readline'
import { loadExport, loadRules, loadTree } from './io/loader.js'
import { writeOutput, writeTree } from './io/writer.js'
import { proposeTree } from './ai/treeProposer.js'
import { proposeAllLinks } from './ai/pageLinker.js'
import { proposeParents } from './ai/parentProposer.js'
import { renderTree } from './ui/treeDisplay.js'
import { askUser } from './ui/interaction.js'
import { openInEditor } from './ui/editor.js'
import { flattenDomains, parseTreeJson } from './tree.js'
import { buildOutput } from './output.js'
import type { Config, DomainTree, DomainAssignment, ScrapboxPage } from './types.js'

export async function run(config: Config): Promise<void> {
  // Step 1: Load files
  const exportData = loadExport(config.inputPath)
  const rules = config.formatPath ? loadRules(config.formatPath) : undefined
  let tree: DomainTree = config.treeInPath ? loadTree(config.treeInPath) : {}

  const pages = exportData.pages

  // Step 2: Domain tree proposal loop
  if (!config.treeInPath) {
    tree = await proposeTree(pages, undefined, rules)
  }

  let treeApproved = false
  while (!treeApproved) {
    console.log('\n=== 分野ツリー提案 ===')
    console.log(renderTree(tree))
    console.log()

    const choice = await askUser('[y]承認  [e]編集  [r]再提案 >', ['y', 'e', 'r'])

    if (choice === 'y') {
      treeApproved = true
    } else if (choice === 'e') {
      const edited = await openInEditor(JSON.stringify(tree, null, 2), 'json')
      try {
        tree = parseTreeJson(edited)
      } catch (err) {
        console.error('JSONのパースに失敗しました:', err)
      }
    } else if (choice === 'r') {
      tree = await proposeTree(pages, tree, rules)
    }
  }

  // Step 3: Page linking loop
  const assignments: DomainAssignment[] = []
  const domains = flattenDomains(tree)
  let quit = false

  console.log('\nページ紐づけをAIが一括分析中...')
  const proposals = await proposeAllLinks(domains, pages, rules)

  for (let i = 0; i < proposals.length && !quit; i++) {
    const proposal = proposals[i]
    const domain = proposal.domain
    console.log(`\n=== ページ紐づけ (${i + 1}/${proposals.length}): ${domain} ===`)

    let candidates = proposal.pages

    let linkApproved = false
    while (!linkApproved) {
      console.log(`紐づけ候補: ${candidates.map((t) => `[${t}]`).join(' ')}`)
      console.log()

      const choice = await askUser('[y]全採用  [e]編集  [s]スキップ  [q]終了・保存 >', [
        'y',
        'e',
        's',
        'q',
      ])

      if (choice === 'y') {
        assignments.push({ domain, pages: candidates })
        linkApproved = true
      } else if (choice === 'e') {
        const edited = await openInEditor(candidates.join('\n'), 'txt')
        candidates = edited
          .split('\n')
          .map((l) => l.trim())
          .filter(Boolean)
      } else if (choice === 's') {
        linkApproved = true
      } else if (choice === 'q') {
        quit = true
        linkApproved = true
      }
    }
  }

  // Step 4: Parent proposal loop
  const newDomainPages: ScrapboxPage[] = []

  if (!quit) {
    let proposals = await proposeParents(tree, rules)

    for (const proposal of proposals) {
      const childrenStr = proposal.children.map((c) => `[${c}]`).join(' ')
      console.log(`\n${childrenStr} → [${proposal.parentName}]`)
      if (proposal.grandParent) console.log(`  上位: [${proposal.grandParent}]`)
      console.log()

      const choice = await askUser('[y]作成  [n]スキップ  [e]名前変更 >', ['y', 'n', 'e'])

      if (choice === 'y') {
        newDomainPages.push({
          title: proposal.parentName,
          lines: [proposal.parentName, proposal.children.map((c) => `[${c}]`).join(' ')],
        })
      } else if (choice === 'e') {
        const newName = await askUserInput(`新しい名前を入力 [現在: ${proposal.parentName}]: `)
        const name = newName.trim() || proposal.parentName
        newDomainPages.push({
          title: name,
          lines: [name, proposal.children.map((c) => `[${c}]`).join(' ')],
        })
      }
    }
  }

  // Step 5: Write output
  const output = buildOutput(exportData, assignments, newDomainPages)
  writeOutput(config.outputPath, output)
  console.log(`\n出力完了: ${config.outputPath}`)

  // Step 6: Write tree if requested
  if (config.treeOutPath) {
    writeTree(config.treeOutPath, tree)
    console.log(`ツリー保存: ${config.treeOutPath}`)
  }
}

function askUserInput(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    rl.question(prompt, (answer) => {
      rl.close()
      resolve(answer)
    })
  })
}
