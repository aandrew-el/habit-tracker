import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createServerClient as createSSRClient } from '@supabase/ssr'
import {
  generateInsight,
  calculateDataHash,
  INSIGHT_EXPIRY,
  RATE_LIMIT_HOURS,
} from '@/lib/openai'
import { CORRELATIONS_PROMPT } from '@/lib/ai-prompts'
import {
  formatHabitDataForAI,
  formatDataAsPrompt,
  hasEnoughDataForInsights,
  type HabitData,
  type CompletionData,
} from '@/lib/ai-data-formatter'

export interface HabitPairCorrelation {
  habit1: string
  habit2: string
  correlation: number
  insight: string
}

export interface MoodCorrelation {
  habit: string
  moodImpact: 'positive' | 'negative' | 'neutral'
  insight: string
}

export interface Correlations {
  habitPairs: HabitPairCorrelation[]
  moodCorrelations: MoodCorrelation[]
  trendAnalysis: string
}

export interface CorrelationsResponse {
  correlations: Correlations
  cached: boolean
  expiresAt: string
  generatedAt: string
}

export async function POST(request: NextRequest) {
  try {
    // Check for force refresh
    const { forceRefresh } = await request.json().catch(() => ({ forceRefresh: false }))

    // Get user from session
    const cookieStore = await cookies()
    const supabase = createSSRClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use service role for database operations
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Fetch user's habits and completions
    const [habitsResult, completionsResult] = await Promise.all([
      adminClient
        .from('habits')
        .select('id, name, category, frequency, created_at')
        .eq('user_id', user.id)
        .eq('archived', false),
      adminClient
        .from('habit_completions')
        .select('habit_id, completed_at, notes, mood')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(500),
    ])

    if (habitsResult.error || completionsResult.error) {
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
    }

    const habits = habitsResult.data as HabitData[]
    const completions = completionsResult.data as CompletionData[]

    // Check if user has enough data
    const dataCheck = hasEnoughDataForInsights(habits, completions)
    if (!dataCheck.hasEnough) {
      return NextResponse.json({
        error: 'insufficient_data',
        message: dataCheck.message,
        daysNeeded: dataCheck.daysNeeded,
      }, { status: 400 })
    }

    // Calculate data hash to detect changes
    const dataHash = calculateDataHash({ habits, completions: completions.slice(0, 50) })

    // Check for cached insight
    const { data: cachedInsight } = await adminClient
      .from('ai_insights')
      .select('content, generated_at, expires_at, data_hash')
      .eq('user_id', user.id)
      .eq('insight_type', 'correlations')
      .single()

    const now = new Date()

    // Return cached if valid and not force refresh
    if (cachedInsight && !forceRefresh) {
      const expiresAt = new Date(cachedInsight.expires_at)
      const generatedAt = new Date(cachedInsight.generated_at)

      if (expiresAt > now && cachedInsight.data_hash === dataHash) {
        return NextResponse.json({
          correlations: cachedInsight.content as Correlations,
          cached: true,
          expiresAt: cachedInsight.expires_at,
          generatedAt: cachedInsight.generated_at,
        })
      }

      // Check rate limit for regeneration
      const hoursSinceGeneration = (now.getTime() - generatedAt.getTime()) / (1000 * 60 * 60)
      if (forceRefresh && hoursSinceGeneration < RATE_LIMIT_HOURS) {
        return NextResponse.json({
          error: 'rate_limited',
          message: `Please wait ${Math.ceil(RATE_LIMIT_HOURS - hoursSinceGeneration)} hours before regenerating`,
          retryAfter: new Date(generatedAt.getTime() + RATE_LIMIT_HOURS * 60 * 60 * 1000).toISOString(),
        }, { status: 429 })
      }
    }

    // Format data for AI
    const formattedData = formatHabitDataForAI(habits, completions)
    const prompt = formatDataAsPrompt(formattedData)

    // Generate insight with OpenAI
    const { data: correlations, tokensUsed } = await generateInsight<Correlations>(
      CORRELATIONS_PROMPT,
      prompt
    )

    // Calculate expiry
    const expiresAt = new Date(now.getTime() + INSIGHT_EXPIRY.correlations)

    // Save to database
    await adminClient
      .from('ai_insights')
      .upsert({
        user_id: user.id,
        insight_type: 'correlations',
        content: correlations,
        generated_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        data_hash: dataHash,
        tokens_used: tokensUsed,
      }, {
        onConflict: 'user_id,insight_type',
      })

    return NextResponse.json({
      correlations,
      cached: false,
      expiresAt: expiresAt.toISOString(),
      generatedAt: now.toISOString(),
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes('OPENAI_API_KEY')) {
      return NextResponse.json({ error: 'AI service not configured' }, { status: 503 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
