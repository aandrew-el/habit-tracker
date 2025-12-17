'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { AddHabitDialog } from '@/components/add-habit-dialog'
import { EditHabitDialog } from '@/components/edit-habit-dialog'
import { DeleteHabitDialog } from '@/components/delete-habit-dialog'
import { HabitCard } from '@/components/habit-card'
import { HabitCardSkeleton } from '@/components/loading-skeleton'
import { OnboardingModal } from '@/components/onboarding-modal'

interface Habit {
  id: string
  name: string
  description: string | null
  frequency: 'daily' | 'weekly'
  created_at: string
}

interface HabitCompletion {
  completed_at: string
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

  const fetchHabitsWithCompletions = async () => {
    try {
      const supabase = createClient()

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        throw new Error('You must be logged in')
      }

      // Fetch habits (include null archived as well as false)
      const { data: habitsData, error: fetchError } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .or('archived.eq.false,archived.is.null')
        .order('created_at', { ascending: false })

      console.log('Habits query result:', { habitsData, fetchError })

      if (fetchError) {
        throw fetchError
      }

      // Fetch completions for all habits
      const habitsWithCompletions: HabitWithCompletions[] = await Promise.all(
        (habitsData || []).map(async (habit) => {
          const { data: completionsData } = await supabase
            .from('habit_completions')
            .select('completed_at')
            .eq('habit_id', habit.id)
            .order('completed_at', { ascending: false })

          const completions = completionsData || []

          // Check if completed today
          const today = new Date().toISOString().split('T')[0]
          const isCompletedToday = completions.some(
            (c) => c.completed_at === today
          )

          return {
            ...habit,
            completions,
            isCompletedToday,
          }
        })
      )

      setHabits(habitsWithCompletions)
      console.log('Fetched habits:', habitsWithCompletions)
      console.log('Habits length:', habitsWithCompletions.length)
      setError(null)
    } catch (err) {
      console.error('Error fetching habits:', err)
      setError(err instanceof Error ? err.message : 'Failed to load habits')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchHabitsWithCompletions()

    // Set up real-time subscriptions
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
            fetchHabitsWithCompletions()
          }
        )
        .subscribe()

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
            fetchHabitsWithCompletions()
          }
        )
        .subscribe()

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

  const handleEdit = (habit: Habit) => {
    setSelectedHabit(habit)
    setIsEditDialogOpen(true)
  }

  const handleDelete = (habit: Habit) => {
    setSelectedHabit(habit)
    setIsDeleteDialogOpen(true)
  }

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
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              My Habits
            </h1>
            <p className="text-sm text-gray-600 mt-1">Track your daily progress</p>
          </div>
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40"
          >
            Add Habit
          </Button>
        </div>
        <div className="rounded-2xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-red-100/50 p-6 shadow-sm">
          <p className="font-semibold text-red-900 text-lg">Error loading habits</p>
          <p className="text-sm text-red-700 mt-1">{error}</p>
        </div>
        <AddHabitDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onHabitAdded={fetchHabitsWithCompletions}
        />
      </div>
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

      {console.log('Rendering. Current habits:', habits)}
      {console.log('Habits length:', habits.length)}
      {console.log('Should show empty state?:', habits.length === 0)}

      {habits.length === 0 ? (
        /* Empty State */
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
              Start building better habits! Click "Add Habit" to create your first habit.
            </p>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-200 hover:scale-105 active:scale-95 text-white"
            >
              Add Your First Habit
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
            visible: {
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
        >
          {habits.map((habit, index) => (
            <motion.div
              key={habit.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              transition={{ duration: 0.5 }}
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
        onHabitAdded={fetchHabitsWithCompletions}
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
