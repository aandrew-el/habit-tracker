'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ACHIEVEMENTS, RARITY_CONFIG, type Achievement, getAchievementProgress } from '@/lib/achievements'
import { Award, Lock, TrophyIcon, Sparkles } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'

interface AchievementsShowcaseProps {
  unlockedAchievementIds: string[]
  stats: {
    maxStreak: number
    totalCompletions: number
    habitCount: number
    categoryCount: number
  }
}

export function AchievementsShowcase({ unlockedAchievementIds, stats }: AchievementsShowcaseProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'streak' | 'consistency' | 'milestone' | 'special'>('all')

  // Get progress for all achievements
  const achievementProgress = getAchievementProgress(stats)

  const unlockedAchievements = ACHIEVEMENTS.filter((a) => unlockedAchievementIds.includes(a.id))
  const lockedAchievementsProgress = achievementProgress.filter((ap) => !ap.isUnlocked)

  const filteredUnlocked = selectedCategory === 'all'
    ? unlockedAchievements
    : unlockedAchievements.filter((a) => a.category === selectedCategory)

  const filteredLockedProgress = selectedCategory === 'all'
    ? lockedAchievementsProgress
    : lockedAchievementsProgress.filter((ap) => ap.achievement.category === selectedCategory)

  const completionPercentage = Math.round((unlockedAchievements.length / ACHIEVEMENTS.length) * 100)

  const rarityCount = {
    common: unlockedAchievements.filter((a) => a.rarity === 'common').length,
    rare: unlockedAchievements.filter((a) => a.rarity === 'rare').length,
    epic: unlockedAchievements.filter((a) => a.rarity === 'epic').length,
    legendary: unlockedAchievements.filter((a) => a.rarity === 'legendary').length,
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border-2 border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-950/40 dark:via-yellow-950/40 dark:to-orange-950/40 p-6 shadow-xl shadow-amber-500/10"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-700 to-orange-600 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent flex items-center gap-2">
              <TrophyIcon className="h-7 w-7 text-amber-600 dark:text-amber-400" />
              Achievements
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {unlockedAchievements.length} of {ACHIEVEMENTS.length} unlocked ({completionPercentage}%)
            </p>
          </div>
          <div className="flex gap-2">
            <div className="text-center px-4 py-2 rounded-xl bg-white/50 dark:bg-gray-900/50 border border-amber-300 dark:border-amber-700">
              <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">{stats.maxStreak}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Max Streak</div>
            </div>
            <div className="text-center px-4 py-2 rounded-xl bg-white/50 dark:bg-gray-900/50 border border-amber-300 dark:border-amber-700">
              <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">{stats.totalCompletions}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Completions</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative h-4 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 rounded-full"
          />
        </div>

        {/* Rarity Breakdown */}
        <div className="flex flex-wrap gap-3 mt-4">
          <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
            Common: {rarityCount.common}
          </Badge>
          <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-100">
            Rare: {rarityCount.rare}
          </Badge>
          <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900/40 text-purple-900 dark:text-purple-100">
            Epic: {rarityCount.epic}
          </Badge>
          <Badge variant="secondary" className="bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-100">
            Legendary: {rarityCount.legendary}
          </Badge>
        </div>
      </motion.div>

      {/* Category Tabs */}
      <Tabs defaultValue="all" className="w-full" onValueChange={(value) => setSelectedCategory(value as 'all' | 'streak' | 'consistency' | 'milestone' | 'special')}>
        <TabsList className="flex flex-wrap justify-center gap-1 h-auto p-1 sm:grid sm:grid-cols-5 sm:gap-0">
          <TabsTrigger value="all" className="text-xs sm:text-sm px-3 py-1.5">All</TabsTrigger>
          <TabsTrigger value="streak" className="text-xs sm:text-sm px-3 py-1.5">Streaks</TabsTrigger>
          <TabsTrigger value="consistency" className="text-xs sm:text-sm px-3 py-1.5">Consistency</TabsTrigger>
          <TabsTrigger value="milestone" className="text-xs sm:text-sm px-3 py-1.5">Milestones</TabsTrigger>
          <TabsTrigger value="special" className="text-xs sm:text-sm px-3 py-1.5">Special</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="space-y-6 mt-6">
          {/* Unlocked Achievements */}
          {filteredUnlocked.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                Unlocked ({filteredUnlocked.length})
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredUnlocked.map((achievement, index) => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    isUnlocked={true}
                    index={index}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Locked Achievements */}
          {filteredLockedProgress.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Lock className="h-5 w-5 text-gray-400" />
                Locked ({filteredLockedProgress.length})
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredLockedProgress.map((progress, index) => (
                  <AchievementCard
                    key={progress.achievement.id}
                    achievement={progress.achievement}
                    isUnlocked={false}
                    index={index}
                    progress={progress}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredUnlocked.length === 0 && filteredLockedProgress.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                No achievements in this category yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Keep building your habits to unlock achievements!
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface AchievementCardProps {
  achievement: Achievement
  isUnlocked: boolean
  index: number
  progress?: {
    currentProgress: number
    progressPercentage: number
  }
}

function AchievementCard({ achievement, isUnlocked, index, progress }: AchievementCardProps) {
  const rarityConfig = RARITY_CONFIG[achievement.rarity]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      whileHover={isUnlocked ? { y: -4, scale: 1.02 } : {}}
    >
      <Card
        className={`relative overflow-hidden border-2 ${
          isUnlocked
            ? `${rarityConfig.bg} ${rarityConfig.border} shadow-lg ${rarityConfig.glow}`
            : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 opacity-60'
        } transition-all`}
      >
        {/* Rarity Badge */}
        <div className="absolute top-2 right-2">
          <Badge
            variant="secondary"
            className={`text-xs font-bold uppercase ${
              isUnlocked ? rarityConfig.text : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {achievement.rarity}
          </Badge>
        </div>

        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div
              className={`text-5xl ${
                isUnlocked ? '' : 'grayscale opacity-40'
              }`}
            >
              {isUnlocked ? achievement.icon : '🔒'}
            </div>

            {/* Title & Description */}
            <div className="flex-1">
              <CardTitle className={`text-lg ${isUnlocked ? rarityConfig.text : 'text-gray-600 dark:text-gray-400'}`}>
                {achievement.title}
              </CardTitle>
              <CardDescription className={`text-sm mt-1 ${isUnlocked ? '' : 'text-gray-500 dark:text-gray-500'}`}>
                {achievement.description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Requirement */}
          <div className="flex items-center gap-2 text-sm mb-3">
            <Award className={`h-4 w-4 ${isUnlocked ? rarityConfig.text : 'text-gray-400'}`} />
            <span className={isUnlocked ? rarityConfig.text : 'text-gray-500 dark:text-gray-400'}>
              {achievement.category === 'streak' && `${achievement.requirement}-day streak`}
              {achievement.category === 'consistency' && `${achievement.requirement} days perfect`}
              {achievement.category === 'milestone' && `${achievement.requirement} ${achievement.id.includes('habit') ? 'habits' : 'completions'}`}
              {achievement.category === 'special' && 'Complete the challenge'}
            </span>
          </div>

          {/* Progress Bar for Locked Achievements */}
          {!isUnlocked && progress && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-400 font-semibold">
                  Progress: {progress.currentProgress} / {achievement.requirement}
                </span>
                <span className="text-gray-500 dark:text-gray-500 font-bold">
                  {progress.progressPercentage}%
                </span>
              </div>
              <Progress value={progress.progressPercentage} className="h-2" />
            </div>
          )}
        </CardContent>

        {/* Shine effect for unlocked achievements */}
        {isUnlocked && (
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
        )}
      </Card>
    </motion.div>
  )
}
