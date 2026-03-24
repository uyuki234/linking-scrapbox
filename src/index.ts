import { Command } from 'commander'
import { mkdirSync } from 'fs'
import { dirname } from 'path'
import { run } from './cli.js'

// APIキー検証
const provider = process.env['AI_PROVIDER'] ?? 'gemini'
if (provider === 'gemini' && !process.env['GEMINI_API_KEY']) {
  console.error('Error: GEMINI_API_KEY が .env に設定されていません')
  process.exit(1)
}
if (provider === 'groq' && !process.env['GROQ_API_KEY']) {
  console.error('Error: GROQ_API_KEY が .env に設定されていません')
  process.exit(1)
}

const program = new Command()
program
  .name('linking-scrapbox')
  .requiredOption('--input <path>', 'Scrapboxエクスポートファイル')
  .requiredOption('--output <path>', '出力ファイル')
  .option('--format <path>', 'AIへの指示ファイル（未指定時は docs/config.md を自動読み込み）')
  .option('--tree-in <path>', 'ツリーファイル読み込み')
  .option('--tree-out <path>', 'ツリーファイル保存')
  .parseAsync()

const opts = program.opts()
const outputPath = opts['output'] as string

// 出力先ディレクトリを自動作成
mkdirSync(dirname(outputPath), { recursive: true })

run({
  inputPath: opts['input'] as string,
  outputPath,
  formatPath: opts['format'] as string | undefined,
  treeInPath: opts['treeIn'] as string | undefined,
  treeOutPath: opts['treeOut'] as string | undefined,
}).catch(console.error)
