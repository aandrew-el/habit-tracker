'use client'

import { motion } from 'framer-motion'
import { Trophy, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RARITY_CONFIG, type Achievement } from '@/lib/achievements'
import Link from 'next/link'

interface RecentAchievementsProps {
  achievements: Achievement[]
}

export function RecentAchievements({ achievements }: RecentAchievementsProps) {
  // Show only the most recent 3 achievements
  const recentAchievements = achievements.slice(0, 3)

  if (recentAchievements.length === 0) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="border-2 border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-950/40 dark:via-yellow-950/40 dark:to-orange-950/40 shadow-xl shadow-amber-500/10">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-amber-700 to-orange-600 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent">
                Recent Achievements
              </CardTitle>
            </div>
            <Link href="/dashboard/achievements">
              <Button
                variant="ghost"
                size="sm"
                className="text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/30"
              >
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentAchievements.map((achievement, index) => {
            const rarityConfig = RARITY_CONFIG[achievement.rarity]

            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div
                  className={`relative overflow-hidden rounded-xl border-2 ${rarityConfig.bg} ${rarityConfig.border} p-4 shadow-md ${rarityConfig.glow}`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="text-4xl flex-shrink-0">{achievement.icon}</div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className={`font-bold text-base ${rarityConfig.text}`}>
                          {achievement.title}
                        </h3>
                        <Badge
                          variant="secondary"
                          className={`text-xs font-bold uppercase ${rarityConfig.text} flex-shrink-0`}
                        >
                          {achievement.rarity}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {achievement.description}
                      </p>
                    </div>
                  </div>

                  {/* Shine effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3,
                      ease: 'linear',
                    }}
                  />
                </div>
              </motion.div>
            )
          })}
        </CardContent>
      </Card>
    </motion.div>
  )
}
