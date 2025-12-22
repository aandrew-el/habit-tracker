'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { AchievementsShowcase } from '@/components/achievements-showcase'
import { checkAchievements, checkEarlyBird, checkNightOwl, checkComebackKid } from '@/lib/achievements'
import { calculateCurrentStreak, calculateLongestStreak } from '@/lib/streak-calculator'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

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
        toast.error('You must be logged in to view achievements')
        setLoading(false)
        return
      }

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

  return (
    <div>
      <AchievementsShowcase unlockedAchievementIds={unlockedIds} stats={stats} />
    </div>
  )
}
