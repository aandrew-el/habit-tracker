'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import type { WeeklySummary } from '@/app/api/ai/weekly-summary/route'
import type { Correlations } from '@/app/api/ai/correlations/route'
import type { Recommendations } from '@/app/api/ai/recommendations/route'

interface InsightData<T> {
  data: T | null
  cached: boolean
  expiresAt: string | null
  generatedAt: string | null
}

interface UseAIInsightsReturn {
  weeklySummary: InsightData<WeeklySummary>
  correlations: InsightData<Correlations>
  recommendations: InsightData<Recommendations>
  isLoading: boolean
  isRegenerating: boolean
  error: string | null
  insufficientData: { message: string; daysNeeded?: number } | null
  fetchAllInsights: () => Promise<void>
  regenerateInsights: () => Promise<void>
  rateLimitedUntil: Date | null
}

async function fetchInsight<T>(
  endpoint: string,
  forceRefresh = false
): Promise<{
  data: T | null
  cached: boolean
  expiresAt: string | null
  generatedAt: string | null
  error?: string
  insufficientData?: { message: string; daysNeeded?: number }
  rateLimitedUntil?: string
}> {
  try {
    const response = await fetch(`/api/ai/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ forceRefresh }),
    })

    const result = await response.json()

    if (!response.ok) {
      if (response.status === 400 && result.error === 'insufficient_data') {
        return {
          data: null,
          cached: false,
          expiresAt: null,
          generatedAt: null,
          insufficientData: {
            message: result.message,
            daysNeeded: result.daysNeeded,
          },
        }
      }

      if (response.status === 429) {
        return {
          data: null,
          cached: false,
          expiresAt: null,
          generatedAt: null,
          rateLimitedUntil: result.retryAfter,
          error: result.message,
        }
      }

      return {
        data: null,
        cached: false,
        expiresAt: null,
        generatedAt: null,
        error: result.error || 'Failed to fetch insight',
      }
    }

    // Extract the data based on endpoint
    let data: T | null = null
    if (endpoint === 'weekly-summary') {
      data = result.summary
    } else if (endpoint === 'correlations') {
      data = result.correlations
    } else if (endpoint === 'recommendations') {
      data = result.recommendations
    }

    return {
      data,
      cached: result.cached,
      expiresAt: result.expiresAt,
      generatedAt: result.generatedAt,
    }
  } catch {
    return {
      data: null,
      cached: false,
      expiresAt: null,
      generatedAt: null,
      error: 'Network error',
    }
  }
}

export function useAIInsights(): UseAIInsightsReturn {
  const [weeklySummary, setWeeklySummary] = useState<InsightData<WeeklySummary>>({
    data: null,
    cached: false,
    expiresAt: null,
    generatedAt: null,
  })
  const [correlations, setCorrelations] = useState<InsightData<Correlations>>({
    data: null,
    cached: false,
    expiresAt: null,
    generatedAt: null,
  })
  const [recommendations, setRecommendations] = useState<InsightData<Recommendations>>({
    data: null,
    cached: false,
    expiresAt: null,
    generatedAt: null,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [insufficientData, setInsufficientData] = useState<{
    message: string
    daysNeeded?: number
  } | null>(null)
  const [rateLimitedUntil, setRateLimitedUntil] = useState<Date | null>(null)

  const fetchAllInsights = useCallback(async (forceRefresh = false) => {
    if (forceRefresh) {
      setIsRegenerating(true)
    } else {
      setIsLoading(true)
    }
    setError(null)

    try {
      // Fetch all insights in parallel
      const [summaryResult, correlationsResult, recommendationsResult] = await Promise.all([
        fetchInsight<WeeklySummary>('weekly-summary', forceRefresh),
        fetchInsight<Correlations>('correlations', forceRefresh),
        fetchInsight<Recommendations>('recommendations', forceRefresh),
      ])

      // Check for insufficient data (any endpoint will return this)
      if (summaryResult.insufficientData) {
        setInsufficientData(summaryResult.insufficientData)
        return
      }

      // Check for rate limiting
      if (summaryResult.rateLimitedUntil) {
        setRateLimitedUntil(new Date(summaryResult.rateLimitedUntil))
        if (forceRefresh) {
          toast.error(summaryResult.error || 'Rate limited. Please try again later.')
        }
        return
      }

      // Check for errors
      const errors = [
        summaryResult.error,
        correlationsResult.error,
        recommendationsResult.error,
      ].filter(Boolean)

      if (errors.length > 0) {
        setError(errors[0] || 'Failed to fetch insights')
        toast.error('Failed to generate some insights')
      }

      // Update state with results
      if (summaryResult.data) {
        setWeeklySummary({
          data: summaryResult.data,
          cached: summaryResult.cached,
          expiresAt: summaryResult.expiresAt,
          generatedAt: summaryResult.generatedAt,
        })
      }

      if (correlationsResult.data) {
        setCorrelations({
          data: correlationsResult.data,
          cached: correlationsResult.cached,
          expiresAt: correlationsResult.expiresAt,
          generatedAt: correlationsResult.generatedAt,
        })
      }

      if (recommendationsResult.data) {
        setRecommendations({
          data: recommendationsResult.data,
          cached: recommendationsResult.cached,
          expiresAt: recommendationsResult.expiresAt,
          generatedAt: recommendationsResult.generatedAt,
        })
      }

      // Show success toast on regeneration
      if (forceRefresh && !errors.length) {
        const wasCached = summaryResult.cached || correlationsResult.cached || recommendationsResult.cached
        if (!wasCached) {
          toast.success('AI insights regenerated!')
        }
      }
    } finally {
      setIsLoading(false)
      setIsRegenerating(false)
    }
  }, [])

  const regenerateInsights = useCallback(async () => {
    // Check rate limit
    if (rateLimitedUntil && rateLimitedUntil > new Date()) {
      const hoursLeft = Math.ceil((rateLimitedUntil.getTime() - Date.now()) / (1000 * 60 * 60))
      toast.error(`Please wait ${hoursLeft} hour${hoursLeft > 1 ? 's' : ''} before regenerating`)
      return
    }

    await fetchAllInsights(true)
  }, [fetchAllInsights, rateLimitedUntil])

  // Initial fetch on mount
  useEffect(() => {
    fetchAllInsights(false)
  }, [fetchAllInsights])

  return {
    weeklySummary,
    correlations,
    recommendations,
    isLoading,
    isRegenerating,
    error,
    insufficientData,
    fetchAllInsights: () => fetchAllInsights(false),
    regenerateInsights,
    rateLimitedUntil,
  }
}
