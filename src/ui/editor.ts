import { writeFileSync, readFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { spawnSync } from 'child_process'

export function openInEditor(content: string, ext = 'txt'): Promise<string> {
  const tmpPath = join(tmpdir(), `linking-scrapbox-${Date.now()}.${ext}`)
  writeFileSync(tmpPath, content, 'utf-8')

  const editor = process.env['EDITOR'] ?? 'vi'
  const result = spawnSync(editor, [tmpPath], { stdio: 'inherit' })

  if (result.error) throw result.error

  const edited = readFileSync(tmpPath, 'utf-8')
  return Promise.resolve(edited)
}
