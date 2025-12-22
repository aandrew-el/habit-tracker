'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Lightbulb, Clock, Layers, AlertTriangle, Calendar } from 'lucide-react'
import type { Recommendations } from '@/app/api/ai/recommendations/route'

interface AIRecommendationsProps {
  recommendations: Recommendations
  cached: boolean
}

function getRiskColor(risk: 'low' | 'medium' | 'high') {
  switch (risk) {
    case 'high':
      return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
    case 'medium':
      return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
    default:
      return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'
  }
}

function getRiskBadgeColor(risk: 'low' | 'medium' | 'high') {
  switch (risk) {
    case 'high':
      return 'bg-red-500 text-white'
    case 'medium':
      return 'bg-amber-500 text-white'
    default:
      return 'bg-yellow-500 text-white'
  }
}

export function AIRecommendations({ recommendations, cached }: AIRecommendationsProps) {
  const hasOptimalTimes = recommendations.optimalTimes.length > 0
  const hasHabitStacking = recommendations.habitStacking.length > 0
  const hasAtRiskHabits = recommendations.atRiskHabits.length > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="border-2 border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/30">
              <Lightbulb className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                Recommendations
              </CardTitle>
              <CardDescription className="text-xs">
                Personalized suggestions
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* At Risk Habits - Show first if any */}
          {hasAtRiskHabits && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Needs Attention
              </h4>
              {recommendations.atRiskHabits.map((habit, i) => (
                <motion.div
                  key={i}
                  className={`rounded-xl p-3 border ${getRiskColor(habit.risk)}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={`text-xs ${getRiskBadgeColor(habit.risk)}`}>
                      {habit.risk} risk
                    </Badge>
                    <span className="font-medium text-sm">{habit.habit}</span>
                  </div>
                  <p className="text-xs mb-1 opacity-80">{habit.pattern}</p>
                  <p className="text-sm font-medium">{habit.suggestion}</p>
                </motion.div>
              ))}
            </div>
          )}

          {/* Optimal Times */}
          {hasOptimalTimes && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Best Days
              </h4>
              {recommendations.optimalTimes.map((time, i) => (
                <motion.div
                  key={i}
                  className="rounded-xl bg-white dark:bg-gray-800 p-3 shadow-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="text-xs font-medium">
                      {time.habit}
                    </Badge>
                    <span className="text-gray-400">+</span>
                    <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                      <Calendar className="h-3 w-3" />
                      <span className="text-xs font-semibold">{time.suggestedDay}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {time.reason}
                  </p>
                </motion.div>
              ))}
            </div>
          )}

          {/* Habit Stacking */}
          {hasHabitStacking && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Layers className="h-3 w-3" />
                Habit Stacking
              </h4>
              {recommendations.habitStacking.map((stack, i) => (
                <motion.div
                  key={i}
                  className="rounded-xl bg-white dark:bg-gray-800 p-3 shadow-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                >
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Badge variant="secondary" className="text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                      {stack.existingHabit}
                    </Badge>
                    <span className="text-gray-400 text-xs">then</span>
                    <Badge variant="secondary" className="text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                      {stack.suggestedHabit}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {stack.reason}
                  </p>
                </motion.div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!hasOptimalTimes && !hasHabitStacking && !hasAtRiskHabits && (
            <div className="text-center py-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30 mx-auto mb-3">
                <Lightbulb className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                You're doing great! No urgent recommendations right now.
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
