'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Link2, Heart, TrendingUp, Smile, Frown, Meh } from 'lucide-react'
import type { Correlations } from '@/app/api/ai/correlations/route'

interface AICorrelationsProps {
  correlations: Correlations
  cached: boolean
}

function getMoodIcon(impact: 'positive' | 'negative' | 'neutral') {
  switch (impact) {
    case 'positive':
      return Smile
    case 'negative':
      return Frown
    default:
      return Meh
  }
}

function getMoodColor(impact: 'positive' | 'negative' | 'neutral') {
  switch (impact) {
    case 'positive':
      return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30'
    case 'negative':
      return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30'
    default:
      return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800'
  }
}

function getCorrelationStrength(correlation: number): { label: string; color: string } {
  if (correlation >= 0.8) return { label: 'Very Strong', color: 'bg-purple-500' }
  if (correlation >= 0.6) return { label: 'Strong', color: 'bg-blue-500' }
  return { label: 'Moderate', color: 'bg-gray-400' }
}

export function AICorrelations({ correlations, cached }: AICorrelationsProps) {
  const hasHabitPairs = correlations.habitPairs.length > 0
  const hasMoodCorrelations = correlations.moodCorrelations.length > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card className="border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30">
              <Link2 className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                Correlations
              </CardTitle>
              <CardDescription className="text-xs">
                Patterns in your habits
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Habit Pairs */}
          {hasHabitPairs && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Habit Connections
              </h4>
              {correlations.habitPairs.map((pair, i) => {
                const strength = getCorrelationStrength(pair.correlation)
                return (
                  <motion.div
                    key={i}
                    className="rounded-xl bg-white dark:bg-gray-800 p-3 shadow-sm"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs font-medium">
                        {pair.habit1}
                      </Badge>
                      <Link2 className="h-3 w-3 text-gray-400" />
                      <Badge variant="secondary" className="text-xs font-medium">
                        {pair.habit2}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {pair.insight}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700">
                        <motion.div
                          className={`h-full rounded-full ${strength.color}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${pair.correlation * 100}%` }}
                          transition={{ delay: 0.5, duration: 0.5 }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {Math.round(pair.correlation * 100)}%
                      </span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}

          {/* Mood Correlations */}
          {hasMoodCorrelations && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Heart className="h-3 w-3" />
                Mood Impact
              </h4>
              {correlations.moodCorrelations.map((mood, i) => {
                const MoodIcon = getMoodIcon(mood.moodImpact)
                const moodColor = getMoodColor(mood.moodImpact)
                return (
                  <motion.div
                    key={i}
                    className="rounded-xl bg-white dark:bg-gray-800 p-3 shadow-sm"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`p-1 rounded-md ${moodColor}`}>
                        <MoodIcon className="h-3 w-3" />
                      </div>
                      <Badge variant="secondary" className="text-xs font-medium">
                        {mood.habit}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {mood.insight}
                    </p>
                  </motion.div>
                )
              })}
            </div>
          )}

          {/* Trend Analysis */}
          <motion.div
            className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/30 p-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <h4 className="text-xs font-semibold text-blue-800 dark:text-blue-300">
                Trend Analysis
              </h4>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              {correlations.trendAnalysis}
            </p>
          </motion.div>

          {/* Empty state */}
          {!hasHabitPairs && !hasMoodCorrelations && (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No strong correlations detected yet. Keep tracking!
              </p>
            </div>
          )}

          {/* Cached indicator */}
          {cached && (
            <div className="flex justify-center pt-2">
              <Badge variant="secondary" className="text-xs">
                Cached
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
