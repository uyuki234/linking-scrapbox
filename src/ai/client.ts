import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: process.env['GEMINI_API_KEY'] })

const MIN_INTERVAL_MS = 6000 // RPM 10 制限に対して余裕を持たせる
let lastCallTime = 0

export async function callAI(systemPrompt: string, userPrompt: string): Promise<string> {
  // 前回の呼び出しから MIN_INTERVAL_MS 経っていなければ待つ
  const now = Date.now()
  const elapsed = now - lastCallTime
  if (elapsed < MIN_INTERVAL_MS) {
    await new Promise((r) => setTimeout(r, MIN_INTERVAL_MS - elapsed))
  }

  for (let attempt = 0; attempt < 4; attempt++) {
    lastCallTime = Date.now()
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-lite',
        config: { systemInstruction: systemPrompt },
        contents: userPrompt,
      })
      const text = response.text
      if (!text) throw new Error('Empty response from Gemini')
      return text
    } catch (err) {
      const isRateLimit =
        err instanceof Error && (err.message.includes('429') || err.message.includes('RESOURCE_EXHAUSTED'))
      if (!isRateLimit || attempt >= 3) throw err

      // エラーメッセージから retryDelay を抽出、なければ指数バックオフ
      const match = err.message.match(/"retryDelay"\s*:\s*"(\d+)s"/)
      const waitMs = match ? parseInt(match[1]) * 1000 : Math.pow(2, attempt) * 10000
      console.error(`Rate limit hit. Waiting ${waitMs / 1000}s before retry...`)
      await new Promise((r) => setTimeout(r, waitMs))
    }
  }

  throw new Error('Unreachable')
}
