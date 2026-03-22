import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: process.env['GEMINI_API_KEY'] })

export async function callAI(systemPrompt: string, userPrompt: string): Promise<string> {
  const delays = [1000, 2000, 4000]
  let lastError: unknown

  for (let attempt = 0; attempt <= delays.length; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        config: { systemInstruction: systemPrompt },
        contents: userPrompt,
      })
      const text = response.text
      if (!text) throw new Error('Empty response from Gemini')
      return text
    } catch (err) {
      lastError = err
      const isRateLimit =
        err instanceof Error && (err.message.includes('429') || err.message.includes('RESOURCE_EXHAUSTED'))
      if (!isRateLimit || attempt >= delays.length) throw err
      await new Promise((r) => setTimeout(r, delays[attempt]))
    }
  }

  throw lastError
}
