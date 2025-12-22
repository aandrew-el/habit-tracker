'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Sparkles } from 'lucide-react'

export function AIInsightsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Weekly Summary Skeleton */}
      <Card className="border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <motion.div
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Sparkles className="h-6 w-6 text-white" />
            </motion.div>
            <div className="space-y-2 flex-1">
              <motion.div
                className="h-6 w-48 rounded-lg bg-purple-200 dark:bg-purple-800"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }}
              />
              <motion.div
                className="h-4 w-32 rounded-lg bg-purple-100 dark:bg-purple-900"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <motion.div
            className="h-20 w-full rounded-xl bg-white/50 dark:bg-gray-800/50"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {[0.4, 0.5].map((delay, i) => (
              <motion.div
                key={i}
                className="h-16 rounded-xl bg-white/50 dark:bg-gray-800/50"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay }}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Two Column Grid Skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Correlations Skeleton */}
        <Card className="border-2 border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <motion.div
                className="h-8 w-8 rounded-lg bg-blue-200 dark:bg-blue-800"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <motion.div
                className="h-5 w-32 rounded-lg bg-blue-100 dark:bg-blue-900"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {[0.2, 0.3, 0.4].map((delay, i) => (
              <motion.div
                key={i}
                className="h-14 rounded-xl bg-gray-100 dark:bg-gray-800"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay }}
              />
            ))}
          </CardContent>
        </Card>

        {/* Recommendations Skeleton */}
        <Card className="border-2 border-green-200 dark:border-green-800">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <motion.div
                className="h-8 w-8 rounded-lg bg-green-200 dark:bg-green-800"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <motion.div
                className="h-5 w-40 rounded-lg bg-green-100 dark:bg-green-900"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {[0.2, 0.3, 0.4].map((delay, i) => (
              <motion.div
                key={i}
                className="h-14 rounded-xl bg-gray-100 dark:bg-gray-800"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay }}
              />
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Loading Text */}
      <motion.p
        className="text-center text-sm text-gray-500 dark:text-gray-400"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        Analyzing your habits with AI...
      </motion.p>
    </div>
  )
}
