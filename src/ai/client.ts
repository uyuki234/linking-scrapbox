import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env['ANTHROPIC_API_KEY'] })

export async function callAI(systemPrompt: string, userPrompt: string): Promise<string> {
  const delays = [1000, 2000, 4000]
  let lastError: unknown

  for (let attempt = 0; attempt <= delays.length; attempt++) {
    try {
      const response = await client.messages.create({
        model: 'claude-opus-4-5',
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      })
      const block = response.content[0]
      if (block.type !== 'text') throw new Error('Unexpected response type')
      return block.text
    } catch (err) {
      lastError = err
      const isRateLimit =
        err instanceof Anthropic.RateLimitError ||
        (err instanceof Anthropic.APIError && err.status === 429)
      if (!isRateLimit || attempt >= delays.length) throw err
      await new Promise((r) => setTimeout(r, delays[attempt]))
    }
  }

  throw lastError
}
