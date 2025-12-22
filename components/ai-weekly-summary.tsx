'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Trophy, Target, Lightbulb, TrendingUp, TrendingDown } from 'lucide-react'
import type { WeeklySummary } from '@/app/api/ai/weekly-summary/route'

interface AIWeeklySummaryProps {
  summary: WeeklySummary
  cached: boolean
  generatedAt: string | null
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'from-green-500 to-emerald-600'
  if (score >= 60) return 'from-blue-500 to-indigo-600'
  if (score >= 40) return 'from-yellow-500 to-orange-600'
  return 'from-red-500 to-pink-600'
}

function getScoreIcon(score: number) {
  if (score >= 70) return TrendingUp
  if (score >= 40) return Target
  return TrendingDown
}

export function AIWeeklySummary({ summary, cached, generatedAt }: AIWeeklySummaryProps) {
  const ScoreIcon = getScoreIcon(summary.overallScore)
  const scoreColor = getScoreColor(summary.overallScore)

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-indigo-900/20 shadow-xl overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg shadow-purple-500/30"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Sparkles className="h-6 w-6 text-white" />
              </motion.div>
              <div>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                  AI Weekly Summary
                </CardTitle>
                <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                  {cached ? 'Cached' : 'Fresh'} analysis
                  {generatedAt && ` from ${formatDate(generatedAt)}`}
                </CardDescription>
              </div>
            </div>

            {/* Score Badge */}
            <motion.div
              className={`flex items-center gap-2 rounded-xl bg-gradient-to-r ${scoreColor} px-4 py-2 shadow-lg`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
            >
              <ScoreIcon className="h-5 w-5 text-white" />
              <span className="text-2xl font-bold text-white">{summary.overallScore}</span>
            </motion.div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Headline */}
          <motion.div
            className="rounded-xl bg-white/60 dark:bg-gray-800/60 p-4 backdrop-blur-sm"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {summary.headline}
            </h3>
          </motion.div>

          {/* Wins and Improvements Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Wins */}
            <motion.div
              className="rounded-xl border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="h-5 w-5 text-green-600 dark:text-green-400" />
                <h4 className="font-semibold text-green-800 dark:text-green-300">Wins</h4>
              </div>
              <ul className="space-y-2">
                {summary.wins.map((win, i) => (
                  <motion.li
                    key={i}
                    className="flex items-start gap-2 text-sm text-green-700 dark:text-green-400"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                  >
                    <span className="text-green-500 mt-0.5">+</span>
                    <span>{win}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Improvements */}
            <motion.div
              className="rounded-xl border-2 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <h4 className="font-semibold text-amber-800 dark:text-amber-300">Growth Areas</h4>
              </div>
              <ul className="space-y-2">
                {summary.improvements.map((improvement, i) => (
                  <motion.li
                    key={i}
                    className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-400"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                  >
                    <span className="text-amber-500 mt-0.5">~</span>
                    <span>{improvement}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Advice */}
          <motion.div
            className="rounded-xl border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 shadow-lg shadow-blue-500/30">
                <Lightbulb className="h-4 w-4 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">
                  Tip for Next Week
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  {summary.advice}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Cached indicator */}
          {cached && (
            <div className="flex justify-center">
              <Badge variant="secondary" className="text-xs">
                Using cached analysis
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
