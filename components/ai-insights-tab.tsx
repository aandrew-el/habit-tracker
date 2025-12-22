'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { RefreshCw, Sparkles, Lock, AlertCircle } from 'lucide-react'
import { useAIInsights } from '@/hooks/use-ai-insights'
import { AIInsightsSkeleton } from '@/components/ai-insights-skeleton'
import { AIWeeklySummary } from '@/components/ai-weekly-summary'
import { AICorrelations } from '@/components/ai-correlations'
import { AIRecommendations } from '@/components/ai-recommendations'

export function AIInsightsTab() {
  const {
    weeklySummary,
    correlations,
    recommendations,
    isLoading,
    isRegenerating,
    error,
    insufficientData,
    regenerateInsights,
    rateLimitedUntil,
  } = useAIInsights()

  // Calculate time until rate limit expires
  const getTimeUntilRefresh = () => {
    if (!rateLimitedUntil) return null
    const now = new Date()
    if (rateLimitedUntil <= now) return null

    const diffMs = rateLimitedUntil.getTime() - now.getTime()
    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const timeUntilRefresh = getTimeUntilRefresh()
  const isRateLimited = !!timeUntilRefresh

  // Loading state
  if (isLoading) {
    return <AIInsightsSkeleton />
  }

  // Insufficient data state
  if (insufficientData) {
    const progress = insufficientData.daysNeeded
      ? ((7 - insufficientData.daysNeeded) / 7) * 100
      : 0

    return (
      <motion.div
        className="flex flex-col items-center justify-center py-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 mb-6">
          <Lock className="h-10 w-10 text-purple-500 dark:text-purple-400" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Unlock AI Insights
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-6">
          {insufficientData.message}
        </p>

        {insufficientData.daysNeeded && (
          <div className="w-full max-w-xs">
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
              <span>Progress</span>
              <span>{7 - insufficientData.daysNeeded} / 7 days</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>
        )}

        <div className="mt-8 flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400">
          <Sparkles className="h-4 w-4" />
          <span>AI-powered insights will analyze your habit patterns</span>
        </div>
      </motion.div>
    )
  }

  // Error state
  if (error && !weeklySummary.data && !correlations.data && !recommendations.data) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center py-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/30 mb-6">
          <AlertCircle className="h-10 w-10 text-red-500 dark:text-red-400" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Failed to Load Insights
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-6">
          {error}
        </p>
        <Button onClick={regenerateInsights} disabled={isRegenerating}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRegenerating ? 'animate-spin' : ''}`} />
          Try Again
        </Button>
      </motion.div>
    )
  }

  // Main content
  return (
    <div className="space-y-6">
      {/* Weekly Summary */}
      {weeklySummary.data && (
        <AIWeeklySummary
          summary={weeklySummary.data}
          cached={weeklySummary.cached}
          generatedAt={weeklySummary.generatedAt}
        />
      )}

      {/* Two Column Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Correlations */}
        {correlations.data && (
          <AICorrelations
            correlations={correlations.data}
            cached={correlations.cached}
          />
        )}

        {/* Recommendations */}
        {recommendations.data && (
          <AIRecommendations
            recommendations={recommendations.data}
            cached={recommendations.cached}
          />
        )}
      </div>

      {/* Regenerate Button */}
      <motion.div
        className="flex flex-col items-center gap-2 pt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Button
          onClick={regenerateInsights}
          disabled={isRegenerating || isRateLimited}
          variant="outline"
          className="rounded-xl border-2 border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/20"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRegenerating ? 'animate-spin' : ''}`} />
          {isRegenerating ? 'Regenerating...' : 'Regenerate Insights'}
        </Button>

        {isRateLimited && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Next refresh available in {timeUntilRefresh}
          </p>
        )}

        {!isRateLimited && weeklySummary.cached && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Using cached analysis. Regenerate for fresh insights.
          </p>
        )}
      </motion.div>
    </div>
  )
}
