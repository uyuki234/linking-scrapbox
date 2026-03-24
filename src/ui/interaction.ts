import * as readline from 'readline'

export function askUser(prompt: string, choices: string[]): Promise<string> {
  return new Promise((resolve) => {
    const { stdin } = process

    if (!stdin.isTTY) {
      // Fallback for non-TTY environments: use readline instead of raw mode
      const rl = readline.createInterface({
        input: stdin,
        output: process.stdout,
      })

      const ask = () => {
        rl.question(prompt + ' ', (answer: string) => {
          if (choices.includes(answer)) {
            rl.close()
            resolve(answer)
          } else {
            ask()
          }
        })
      }

      ask()
      return
    }

    process.stdout.write(prompt + ' ')

    const prevRaw = stdin.isRaw

    stdin.setRawMode(true)
    stdin.resume()
    stdin.setEncoding('utf-8')

    const onData = (key: string) => {
      if (choices.includes(key)) {
        process.stdout.write(key + '\n')
        stdin.setRawMode(prevRaw ?? false)
        stdin.pause()
        stdin.removeListener('data', onData)
        resolve(key)
      }
    }

    stdin.on('data', onData)
  })
}
