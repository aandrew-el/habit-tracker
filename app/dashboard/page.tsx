'use client'

import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { AddHabitDialog } from '@/components/add-habit-dialog'
import { EditHabitDialog } from '@/components/edit-habit-dialog'
import { DeleteHabitDialog } from '@/components/delete-habit-dialog'
import { HabitCard } from '@/components/habit-card'
import { HabitCardSkeleton } from '@/components/loading-skeleton'
import { OnboardingModal } from '@/components/onboarding-modal'
import { NetworkError } from '@/components/network-error'
import { RecentAchievements } from '@/components/recent-achievements'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Target, Crosshair } from 'lucide-react'
import { AuthPrompt } from '@/components/auth-prompt'
import { checkAchievements, checkEarlyBird, checkNightOwl, checkComebackKid, type Achievement } from '@/lib/achievements'
import { calculateCurrentStreak, calculateLongestStreak } from '@/lib/streak-calculator'

interface Habit {
  id: string
  name: string
  description: string | null
  frequency: 'daily' | 'weekly'
  category?: string
  archived?: boolean
  created_at: string
}

interface HabitCompletion {
  completed_at: string
  notes?: string | null
}

interface HabitWithCompletions extends Habit {
  completions: HabitCompletion[]
  isCompletedToday: boolean
}

export default function DashboardPage() {
  const [habits, setHabits] = useState<HabitWithCompletions[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [frequencyFilter, setFrequencyFilter] = useState<'all' | 'daily' | 'weekly'>('all')
  const [previousAchievements, setPreviousAchievements] = useState<Achievement[]>([])
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([])
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  // Debounce search query for performance
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 300)

  // Ref to track when optimistic updates occur (for debouncing real-time subscription)
  const lastOptimisticUpdate = useRef<number>(0)

  // Enable keyboard shortcuts
  useKeyboardShortcuts({
    onAddHabit: () => setIsAddDialogOpen(true),
  })

  // Get celebrated achievements from localStorage
  const getCelebratedAchievements = (): string[] => {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem('celebratedAchievements')
    return stored ? JSON.parse(stored) : []
  }

  // Save celebrated achievements to localStorage
  const saveCelebratedAchievements = (achievementIds: string[]) => {
    if (typeof window === 'undefined') return
    localStorage.setItem('celebratedAchievements', JSON.stringify(achievementIds))
  }

  // Celebrate achievement unlocks
  const celebrateAchievement = (achievement: Achievement) => {
    // Show toast notification
    toast.success(
      `${achievement.icon} Achievement Unlocked: ${achievement.title}!`,
      {
        description: achievement.description,
        duration: 5000,
      }
    )

    // Trigger confetti based on rarity
    switch (achievement.rarity) {
      case 'common':
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#9ca3af', '#6b7280', '#4b5563'],
        })
        break
      case 'rare':
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#3b82f6', '#60a5fa', '#93c5fd'],
        })
        break
      case 'epic':
        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.5 },
          colors: ['#a855f7', '#c084fc', '#e9d5ff'],
          ticks: 200,
        })
        break
      case 'legendary':
        // Massive celebration for legendary achievements
        const duration = 3000
        const animationEnd = Date.now() + duration
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

        const interval = setInterval(() => {
          const timeLeft = animationEnd - Date.now()
          if (timeLeft <= 0) return clearInterval(interval)

          const particleCount = 50 * (timeLeft / duration)
          confetti({
            ...defaults,
            particleCount,
            origin: { x: Math.random(), y: Math.random() - 0.2 },
            colors: ['#f59e0b', '#fbbf24', '#fcd34d', '#fde68a'],
          })
        }, 250)
        break
    }
  }

  const fetchHabitsWithCompletions = async () => {
    try {
      const supabase = createClient()

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        // User is not authenticated - show empty state with auth prompt
        setIsAuthenticated(false)
        setHabits([])
        setIsLoading(false)
        return
      }

      setIsAuthenticated(true)

      // Fetch all habits for this user
      const { data: habitsData, error: fetchError} = await supabase
        .from('habits')
        .select('id, name, description, frequency, category, created_at, archived')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      if (!habitsData || habitsData.length === 0) {
        // Don't clear state if we just did an optimistic update (within 2 seconds)
        const timeSinceOptimistic = Date.now() - lastOptimisticUpdate.current

        if (timeSinceOptimistic >= 2000 || lastOptimisticUpdate.current === 0) {
          // Safe to clear - either no recent optimistic update, or initial load
          setHabits([])
        }
        // Otherwise preserve optimistic update in state
        setError(null)
        setIsLoading(false)
        return
      }

      // Fetch completions for all habits
      const habitsWithCompletions: HabitWithCompletions[] = await Promise.all(
        habitsData.map(async (habit) => {
          const { data: completionsData } = await supabase
            .from('habit_completions')
            .select('completed_at, notes')
            .eq('habit_id', habit.id)
            .order('completed_at', { ascending: false })

          const completions = completionsData || []

          // Check if completed today
          const today = new Date().toISOString().split('T')[0]
          const isCompletedToday = completions.some(
            (c) => c.completed_at === today
          )

          return {
            id: habit.id,
            name: habit.name,
            description: habit.description,
            frequency: habit.frequency,
            category: habit.category,
            created_at: habit.created_at,
            completions,
            isCompletedToday,
          }
        })
      )

      setHabits(habitsWithCompletions)
      setError(null)

      // Check for achievement unlocks
      if (habitsWithCompletions.length > 0) {
        // Calculate stats for achievement checking
        const allCompletionDates = habitsWithCompletions.flatMap((h) =>
          h.completions.map((c) => new Date(c.completed_at))
        )

        const maxStreak = Math.max(
          ...habitsWithCompletions.map((h) =>
            calculateCurrentStreak(h.completions.map((c) => new Date(c.completed_at)))
          ),
          0
        )

        const longestStreak = Math.max(
          ...habitsWithCompletions.map((h) =>
            calculateLongestStreak(h.completions.map((c) => new Date(c.completed_at)))
          ),
          0
        )

        const totalCompletions = allCompletionDates.length
        const habitCount = habitsWithCompletions.length

        // Get unique categories
        const uniqueCategories = new Set(
          habitsWithCompletions
            .map((h) => h.category)
            .filter((c): c is string => c !== undefined && c !== null)
        )
        const categoryCount = uniqueCategories.size

        // Check for special achievements across all habits
        const allCompletions = habitsWithCompletions.flatMap((h) => h.completions)
        const hasEarlyBird = checkEarlyBird(allCompletions)
        const hasNightOwl = checkNightOwl(allCompletions)
        const hasComebackKid = habitsWithCompletions.some((h) => checkComebackKid(h.completions))

        // Check which achievements are currently unlocked
        const currentAchievements = checkAchievements({
          maxStreak,
          totalCompletions,
          habitCount,
          categoryCount,
          hasEarlyBird,
          hasNightOwl,
          hasComebackKid,
        })

        // Get list of achievements we've already celebrated
        const celebratedIds = getCelebratedAchievements()

        // Find truly new achievements (unlocked but not yet celebrated)
        const newAchievements = currentAchievements.filter(
          (achievement) => !celebratedIds.includes(achievement.id)
        )

        // Celebrate each new achievement
        if (newAchievements.length > 0) {
          newAchievements.forEach((achievement) => {
            celebrateAchievement(achievement)
          })

          // Save updated list of celebrated achievements
          const updatedCelebratedIds = [
            ...celebratedIds,
            ...newAchievements.map((a) => a.id),
          ]
          saveCelebratedAchievements(updatedCelebratedIds)
        }

        // Update previous achievements for next check
        setPreviousAchievements(currentAchievements)

        // Update recent achievements display (show unlocked achievements sorted by rarity)
        const sortedByRarity = [...currentAchievements].sort((a, b) => {
          const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 }
          return rarityOrder[a.rarity] - rarityOrder[b.rarity]
        })
        setRecentAchievements(sortedByRarity)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load habits')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchHabitsWithCompletions()

    // Set up real-time subscriptions for habits table
    const supabase = createClient()

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return

      // Subscribe to habits table changes
      const habitsChannel = supabase
        .channel('habits-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'habits',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            // Check if we're within the debounce window (2 seconds)
            const timeSinceOptimistic = Date.now() - lastOptimisticUpdate.current
            if (timeSinceOptimistic < 2000) {
              return
            }

            fetchHabitsWithCompletions()
          }
        )
        .subscribe((status) => {
          if (status === 'CHANNEL_ERROR') {
            toast.error('Real-time sync lost. Refresh to reconnect.')
          }
        })

      // Subscribe to completions table changes
      const completionsChannel = supabase
        .channel('completions-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'habit_completions',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            // Completions don't need debounce (no optimistic updates for them)
            fetchHabitsWithCompletions()
          }
        )
        .subscribe((status) => {
          if (status === 'CHANNEL_ERROR') {
            toast.error('Real-time sync lost. Refresh to reconnect.')
          }
        })

      // Cleanup function
      return () => {
        supabase.removeChannel(habitsChannel)
        supabase.removeChannel(completionsChannel)
      }
    })
  }, [])

  // Check if user should see onboarding
  useEffect(() => {
    // Only run after habits are loaded
    if (isLoading) return

    // Check localStorage for onboarding status
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding')
    
    // Show onboarding only for truly new users
    // Check if they have NEVER created a habit (not just deleted all of them)
    const checkIfNewUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      // Check if user has EVER created a habit (including archived/deleted ones)
      const { count } = await supabase
        .from('habits')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      return count === 0
    }

    if (!hasSeenOnboarding && habits.length === 0) {
      checkIfNewUser().then(isNewUser => {
        if (isNewUser) {
          setShowOnboarding(true)
        }
      })
    }
  }, [isLoading, habits.length])

  const handleOnboardingClose = () => {
    setShowOnboarding(false)
    localStorage.setItem('hasSeenOnboarding', 'true')
  }

  // Handle optimistic UI update when a habit is added
  const handleHabitAdded = (newHabit: Habit) => {
    // Create habit with completion data structure
    // Spread all fields from newHabit to include category, archived, etc.
    const habitWithCompletions: HabitWithCompletions = {
      ...newHabit,  // Include all fields from the inserted habit (id, name, description, frequency, category, archived, created_at)
      completions: [],
      isCompletedToday: false,
    }

    // Optimistically add to state (prepend to beginning since ordered by created_at desc)
    setHabits(prev => [habitWithCompletions, ...prev])

    // Set debounce flag to prevent real-time subscription from overwriting optimistic update
    lastOptimisticUpdate.current = Date.now()
  }

  const handleEdit = (habit: Habit) => {
    setSelectedHabit(habit)
    setIsEditDialogOpen(true)
  }

  const handleDelete = (habit: Habit) => {
    setSelectedHabit(habit)
    setIsDeleteDialogOpen(true)
  }

  // Filter habits based on search query and frequency filter
  const filteredHabits = habits.filter((habit) => {
    // Filter by search query (case-insensitive, matches name)
    const matchesSearch = habit.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
    
    // Filter by frequency
    const matchesFrequency = 
      frequencyFilter === 'all' || 
      habit.frequency === frequencyFilter
    
    return matchesSearch && matchesFrequency
  })

  if (isLoading) {
    return (
      <motion.div 
        className="space-y-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              My Habits
            </h1>
            <p className="text-sm text-gray-600 mt-1">Track your daily progress</p>
          </div>
          <Button disabled className="rounded-xl shadow-lg">
            Add Habit
          </Button>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <HabitCardSkeleton key={i} />
          ))}
        </div>
      </motion.div>
    )
  }

  if (error) {
    return (
      <NetworkError
        message={error}
        onRetry={() => {
          setError(null)
          setIsLoading(true)
          fetchHabitsWithCompletions()
        }}
      />
    )
  }

  return (
    <motion.div 
      className="space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            My Habits
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {habits.length === 0 
              ? 'Start building better habits today' 
              : `Tracking ${habits.length} habit${habits.length === 1 ? '' : 's'}`
            }
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-200 hover:scale-105 active:scale-95 text-white"
          >
            Add Habit
          </Button>
        </motion.div>
      </div>

      {/* Search and Filter Bar */}
      {habits.length > 0 && (
        <motion.div
          className="rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-lg"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
              <Input
                type="text"
                placeholder="Search habits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900 transition-all"
              />
            </div>

            {/* Frequency Filter */}
            <Select
              value={frequencyFilter}
              onValueChange={(value) => setFrequencyFilter(value as 'all' | 'daily' | 'weekly')}
            >
              <SelectTrigger className="h-11 w-full sm:w-[180px] rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900">
                <SelectValue placeholder="Filter by frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Habits</SelectItem>
                <SelectItem value="daily">Daily Only</SelectItem>
                <SelectItem value="weekly">Weekly Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters Summary */}
          {(debouncedSearchQuery || frequencyFilter !== 'all') && (
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span>Showing {filteredHabits.length} of {habits.length} habits</span>
              {debouncedSearchQuery && (
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg">
                  Search: &quot;{debouncedSearchQuery}&quot;
                </span>
              )}
              {frequencyFilter !== 'all' && (
                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg">
                  {frequencyFilter === 'daily' ? 'Daily' : 'Weekly'}
                </span>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* Recent Achievements */}
      {recentAchievements.length > 0 && (
        <RecentAchievements achievements={recentAchievements} />
      )}

      {!isAuthenticated && habits.length === 0 ? (
        /* Unauthenticated Empty State */
        <AuthPrompt
          title="Track Your Habits"
          description="Sign in to start building better habits and track your progress"
          icon={<span className="text-4xl">🎯</span>}
        />
      ) : habits.length === 0 ? (
        /* Authenticated Empty State */
        <motion.div
          className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 py-24 shadow-sm"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="text-center max-w-md">
            <motion.div
              className="mb-6 text-7xl"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              🎯
            </motion.div>
            <h2 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">
              No habits yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
              Start building better habits! Click &quot;Add Habit&quot; to create your first habit.
            </p>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-200 hover:scale-105 active:scale-95 text-white"
            >
              Add Your First Habit
            </Button>
          </div>
        </motion.div>
      ) : filteredHabits.length === 0 ? (
        /* No Search Results Empty State */
        <motion.div 
          className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 py-16 shadow-sm"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="text-center max-w-md">
            <div className="mb-4 text-6xl">
              🔍
            </div>
            <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
              No habits match your search
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Try adjusting your search or filters to find what you&apos;re looking for.
            </p>
            <Button
              onClick={() => {
                setSearchQuery('')
                setFrequencyFilter('all')
              }}
              variant="outline"
              className="rounded-xl border-2 font-semibold"
            >
              Clear Filters
            </Button>
          </div>
        </motion.div>
      ) : (
        /* Habits Grid with Stagger Animation */
        <motion.div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
        >
          {filteredHabits.map((habit, index) => (
            <motion.div
              key={habit.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <HabitCard
                habit={habit}
                completions={habit.completions}
                isCompletedToday={habit.isCompletedToday}
                onEdit={() => handleEdit(habit)}
                onDelete={() => handleDelete(habit)}
                onCheckOff={fetchHabitsWithCompletions}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      <AddHabitDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onHabitAdded={handleHabitAdded}
      />

      <EditHabitDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onHabitUpdated={fetchHabitsWithCompletions}
        habit={selectedHabit}
      />

      <DeleteHabitDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onHabitDeleted={fetchHabitsWithCompletions}
        habitId={selectedHabit?.id || null}
        habitName={selectedHabit?.name || null}
      />

      <OnboardingModal
        isOpen={showOnboarding}
        onClose={handleOnboardingClose}
      />
    </motion.div>
  )
}
