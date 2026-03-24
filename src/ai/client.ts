import { GoogleGenAI } from '@google/genai'

const apiKey = process.env['GEMINI_API_KEY']

if (!apiKey) {
  throw new Error(
    'GEMINI_API_KEY is not set. Please provide a valid Gemini API key via your environment, ' +
      'for example by setting GEMINI_API_KEY in a .env file or using the --env-file option.',
  )
}

const ai = new GoogleGenAI({ apiKey })

export async function callAI(systemPrompt: string, userPrompt: string): Promise<string> {
  const delays = [1000, 2000, 4000]
  let lastError: unknown

  for (let attempt = 0; attempt <= delays.length; attempt++) {
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
      lastError = err
      const isRateLimit =
        err instanceof Error && (err.message.includes('429') || err.message.includes('RESOURCE_EXHAUSTED'))
      if (!isRateLimit || attempt >= delays.length) throw err
      await new Promise((r) => setTimeout(r, delays[attempt]))
    }
  }

  throw lastError
}
