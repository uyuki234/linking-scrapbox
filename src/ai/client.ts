import { GoogleGenAI } from '@google/genai'
import Groq from 'groq-sdk'

const PROVIDER = process.env['AI_PROVIDER'] ?? 'gemini'
const GEMINI_MODEL = process.env['GEMINI_MODEL'] ?? 'gemini-2.5-flash-lite'
const GROQ_MODEL = process.env['GROQ_MODEL'] ?? 'llama-3.3-70b-versatile'

const geminiClient = PROVIDER === 'gemini'
  ? new GoogleGenAI({ apiKey: process.env['GEMINI_API_KEY'] })
  : null

const groqClient = PROVIDER === 'groq'
  ? new Groq({ apiKey: process.env['GROQ_API_KEY'] })
  : null

const MIN_INTERVAL_MS = PROVIDER === 'gemini' ? 6000 : 2000
let lastCallTime = 0

export async function callAI(systemPrompt: string, userPrompt: string): Promise<string> {
  const now = Date.now()
  const elapsed = now - lastCallTime
  if (elapsed < MIN_INTERVAL_MS) {
    await new Promise((r) => setTimeout(r, MIN_INTERVAL_MS - elapsed))
  }

  for (let attempt = 0; attempt < 4; attempt++) {
    lastCallTime = Date.now()
    try {
      if (PROVIDER === 'groq' && groqClient) {
        const response = await groqClient.chat.completions.create({
          model: GROQ_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
        })
        const text = response.choices[0]?.message.content
        if (!text) throw new Error('Empty response from Groq')
        return text
      } else if (geminiClient) {
        const response = await geminiClient.models.generateContent({
          model: GEMINI_MODEL,
          config: { systemInstruction: systemPrompt },
          contents: userPrompt,
        })
        const text = response.text
        if (!text) throw new Error('Empty response from Gemini')
        return text
      } else {
        throw new Error(`Unknown provider: ${PROVIDER}`)
      }
    } catch (err) {
      const isRateLimit =
        err instanceof Error && (err.message.includes('429') || err.message.includes('RESOURCE_EXHAUSTED') || err.message.includes('rate_limit'))
      if (!isRateLimit || attempt >= 3) throw err

      const match = err.message.match(/"retryDelay"\s*:\s*"(\d+)s"/)
      const waitMs = match ? parseInt(match[1]) * 1000 : Math.pow(2, attempt) * 10000
      console.error(`Rate limit hit. Waiting ${waitMs / 1000}s before retry...`)
      await new Promise((r) => setTimeout(r, waitMs))
    }
  }

  throw new Error('Unreachable')
}
