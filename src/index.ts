import { Command } from 'commander'
import { run } from './cli.js'

const program = new Command()
program
  .name('linking-scrapbox')
  .requiredOption('--input <path>', 'Scrapboxエクスポートファイル')
  .requiredOption('--output <path>', '出力ファイル')
  .option('--format <path>', 'フォーマットルールファイル')
  .option('--tree-in <path>', 'ツリーファイル読み込み')
  .option('--tree-out <path>', 'ツリーファイル保存')
  .parseAsync()

const opts = program.opts()
run({
  inputPath: opts['input'] as string,
  outputPath: opts['output'] as string,
  formatPath: opts['format'] as string | undefined,
  treeInPath: opts['treeIn'] as string | undefined,
  treeOutPath: opts['treeOut'] as string | undefined,
}).catch(console.error)
