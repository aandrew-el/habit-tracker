import OpenAI from 'openai'

// OpenAI client for AI insights
// Uses GPT-4o-mini for cost efficiency (~$0.001 per generation)
let openaiClient: OpenAI | null = null

export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      throw new Error('Missing OPENAI_API_KEY environment variable')
    }

    openaiClient = new OpenAI({
      apiKey,
    })
  }

  return openaiClient
}

// Model configuration
export const AI_MODEL = 'gpt-4o-mini'

// Token limits for cost control
export const MAX_INPUT_TOKENS = 2000
export const MAX_OUTPUT_TOKENS = 1000

// Rate limiting configuration
export const RATE_LIMIT_HOURS = 6 // Hours between regenerations

// Insight expiry times
export const INSIGHT_EXPIRY = {
  weekly_summary: 24 * 60 * 60 * 1000, // 24 hours
  correlations: 24 * 60 * 60 * 1000, // 24 hours
  recommendations: 24 * 60 * 60 * 1000, // 24 hours
} as const

export type InsightType = keyof typeof INSIGHT_EXPIRY

// Generate completion with structured JSON output
export async function generateInsight<T>(
  systemPrompt: string,
  userPrompt: string
): Promise<{ data: T; tokensUsed: number }> {
  const client = getOpenAIClient()

  const response = await client.chat.completions.create({
    model: AI_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: MAX_OUTPUT_TOKENS,
    temperature: 0.7,
    response_format: { type: 'json_object' },
  })

  const content = response.choices[0]?.message?.content
  if (!content) {
    throw new Error('No response from OpenAI')
  }

  const tokensUsed = response.usage?.total_tokens || 0

  try {
    const data = JSON.parse(content) as T
    return { data, tokensUsed }
  } catch {
    throw new Error('Failed to parse AI response as JSON')
  }
}

// Calculate data hash to detect when regeneration is needed
export function calculateDataHash(data: unknown): string {
  const str = JSON.stringify(data)
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return hash.toString(16)
}
