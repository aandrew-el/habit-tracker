'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { AchievementsShowcase } from '@/components/achievements-showcase'
import { checkAchievements, checkEarlyBird, checkNightOwl, checkComebackKid } from '@/lib/achievements'
import { calculateCurrentStreak, calculateLongestStreak } from '@/lib/streak-calculator'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Trophy } from 'lucide-react'
import { AuthPrompt } from '@/components/auth-prompt'

interface Habit {
  id: string
  category: string
  archived: boolean
}

interface Completion {
  habit_id: string
  completed_at: string
}

export default function AchievementsPage() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [completions, setCompletions] = useState<Completion[]>([])
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const supabase = createClient()

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        // User is not authenticated - handle gracefully
        setIsAuthenticated(false)
        setHabits([])
        setCompletions([])
        setLoading(false)
        return
      }

      setIsAuthenticated(true)

      // Fetch all habits
      const { data: habitsData, error: habitsError } = await supabase
        .from('habits')
        .select('id, category, archived')
        .eq('user_id', user.id)

      if (habitsError) {
        toast.error('Failed to load habits')
        setLoading(false)
        return
      }

      // Fetch all completions
      const { data: completionsData, error: completionsError } = await supabase
        .from('habit_completions')
        .select('habit_id, completed_at')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })

      if (completionsError) {
        toast.error('Failed to load completions')
        setLoading(false)
        return
      }

      setHabits(habitsData || [])
      setCompletions(completionsData || [])
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  // Calculate stats
  const completionDates = completions.map((c) => new Date(c.completed_at))
  const maxStreak = calculateLongestStreak(completionDates)
  const totalCompletions = completions.length
  const habitCount = habits.filter((h) => !h.archived).length
  const uniqueCategories = new Set(habits.filter((h) => !h.archived).map((h) => h.category))
  const categoryCount = uniqueCategories.size

  // Check for special achievements
  const hasEarlyBird = checkEarlyBird(completions)
  const hasNightOwl = checkNightOwl(completions)

  // Check for Comeback Kid across all habits
  const hasComebackKid = habits.some((habit) => {
    const habitCompletions = completions.filter((c) => c.habit_id === habit.id)
    return checkComebackKid(habitCompletions)
  })

  const stats = {
    maxStreak,
    totalCompletions,
    habitCount,
    categoryCount,
    hasEarlyBird,
    hasNightOwl,
    hasComebackKid,
  }

  // Check which achievements are unlocked
  const unlockedAchievements = checkAchievements(stats)
  const unlockedIds = unlockedAchievements.map((a) => a.id)

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <motion.div
        className="space-y-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Achievements
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Unlock achievements as you build habits</p>
        </motion.div>
        <AuthPrompt
          title="Earn Achievements"
          description="Sign in to start earning achievements and tracking your milestones"
          icon={<Trophy className="h-10 w-10 text-white" />}
        />
      </motion.div>
    )
  }

  return (
    <div>
      <AchievementsShowcase unlockedAchievementIds={unlockedIds} stats={stats} />
    </div>
  )
}
