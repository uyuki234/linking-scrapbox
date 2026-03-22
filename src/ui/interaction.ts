export function askUser(prompt: string, choices: string[]): Promise<string> {
  return new Promise((resolve) => {
    process.stdout.write(prompt + ' ')

    const { stdin } = process
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
