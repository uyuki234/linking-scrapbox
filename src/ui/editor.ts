import { writeFileSync, readFileSync, unlinkSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { spawnSync } from 'child_process'

export function openInEditor(content: string, ext = 'txt'): Promise<string> {
  const tmpPath = join(tmpdir(), `linking-scrapbox-${Date.now()}.${ext}`)
  writeFileSync(tmpPath, content, 'utf-8')

  const editor = process.env['EDITOR'] ?? 'vi'
  try {
    const result = spawnSync(editor, [tmpPath], { shell: true, stdio: 'inherit' })
    if (result.error) throw result.error
    return Promise.resolve(readFileSync(tmpPath, 'utf-8'))
  } finally {
    try {
      unlinkSync(tmpPath)
    } catch {
      // ignore cleanup errors
    }
  }
}
