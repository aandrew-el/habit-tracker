'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { DayDetailDialog } from '@/components/day-detail-dialog'
import { CalendarSkeleton } from '@/components/loading-skeleton'
import { NetworkError } from '@/components/network-error'
import {
  generateCalendarGrid,
  formatMonthYear,
  getMonthDateRange,
  toISODateString,
  type CalendarDay,
} from '@/lib/calendar-utils'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { HabitHeatmap } from '@/components/habit-heatmap'

interface Habit {
  id: string
  name: string
}

interface Completion {
  habit_id: string
  completed_at: string
}

interface DayCompletionData {
  completedHabitIds: string[]
  completionPercentage: number
}

export default function CalendarPage() {
  const today = new Date()
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [habits, setHabits] = useState<Habit[]>([])
  const [completions, setCompletions] = useState<Completion[]>([])
  const [yearCompletions, setYearCompletions] = useState<Completion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Generate calendar grid
  const calendarDays = generateCalendarGrid(currentYear, currentMonth)

  // Create a map of date -> completion data for efficient lookups
  const completionsByDate = new Map<string, DayCompletionData>()

  completions.forEach((completion) => {
    const dateKey = completion.completed_at
    if (!completionsByDate.has(dateKey)) {
      completionsByDate.set(dateKey, {
        completedHabitIds: [],
        completionPercentage: 0,
      })
    }
    completionsByDate.get(dateKey)!.completedHabitIds.push(completion.habit_id)
  })

  // Calculate completion percentages
  completionsByDate.forEach((data) => {
    data.completionPercentage =
      habits.length > 0 ? (data.completedHabitIds.length / habits.length) * 100 : 0
  })

  const fetchData = async () => {
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

      // Fetch all habits
      const { data: habitsData, error: habitsError } = await supabase
        .from('habits')
        .select('id, name')
        .eq('user_id', user.id)
        .eq('archived', false)

      if (habitsError) {
        throw habitsError
      }

      setHabits(habitsData || [])

      // Fetch completions for the current month
      const dateRange = getMonthDateRange(currentYear, currentMonth)
      const { data: completionsData, error: completionsError } = await supabase
        .from('habit_completions')
        .select('habit_id, completed_at')
        .eq('user_id', user.id)
        .gte('completed_at', dateRange.start)
        .lte('completed_at', dateRange.end)

      if (completionsError) {
        throw completionsError
      }

      setCompletions(completionsData || [])

      // Fetch completions for the entire year (for heatmap)
      const oneYearAgo = new Date()
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
      const yearStart = oneYearAgo.toISOString().split('T')[0]
      const yearEnd = new Date().toISOString().split('T')[0]

      const { data: yearCompletionsData, error: yearCompletionsError } = await supabase
        .from('habit_completions')
        .select('habit_id, completed_at')
        .eq('user_id', user.id)
        .gte('completed_at', yearStart)
        .lte('completed_at', yearEnd)

      if (yearCompletionsError) {
        throw yearCompletionsError
      }

      setYearCompletions(yearCompletionsData || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  const handleToday = () => {
    const now = new Date()
    setCurrentYear(now.getFullYear())
    setCurrentMonth(now.getMonth())
  }

  const handleDayClick = (day: CalendarDay) => {
    if (!day.isFuture && day.isCurrentMonth) {
      setSelectedDate(day.date)
      setIsDialogOpen(true)
    }
  }

  const getDayClassName = (day: CalendarDay) => {
    const baseClasses =
      'relative aspect-square flex flex-col items-center justify-center rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105'

    if (!day.isCurrentMonth) {
      return `${baseClasses} text-gray-300 cursor-default opacity-40`
    }

    if (day.isFuture) {
      return `${baseClasses} bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50`
    }

    const dateKey = toISODateString(day.date)
    const completionData = completionsByDate.get(dateKey)
    const percentage = completionData?.completionPercentage || 0

    let colorClasses = 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'

    if (percentage === 100) {
      colorClasses =
        'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 text-green-900 dark:text-green-300 border-2 border-green-400 dark:border-green-600 shadow-sm shadow-green-100 dark:shadow-green-900/20 hover:shadow-lg hover:shadow-green-200/50 dark:hover:shadow-green-800/30 hover:border-green-500 dark:hover:border-green-500'
    } else if (percentage > 0) {
      colorClasses =
        'bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30 text-amber-900 dark:text-amber-300 border-2 border-amber-400 dark:border-amber-600 shadow-sm shadow-amber-100 dark:shadow-amber-900/20 hover:shadow-lg hover:shadow-amber-200/50 dark:hover:shadow-amber-800/30 hover:border-amber-500 dark:hover:border-amber-500'
    }

    const todayClasses = day.isToday
      ? 'ring-2 ring-blue-500 ring-offset-2'
      : ''

    return `${baseClasses} ${colorClasses} ${todayClasses} cursor-pointer active:scale-95`
  }

  const getDayIndicator = (day: CalendarDay) => {
    if (!day.isCurrentMonth || day.isFuture) return null

    const dateKey = toISODateString(day.date)
    const completionData = completionsByDate.get(dateKey)
    const percentage = completionData?.completionPercentage || 0

    if (percentage === 0) return null

    return (
      <div className={`absolute bottom-1 flex gap-0.5`}>
        {percentage === 100 ? (
          <div className="h-1.5 w-1.5 rounded-full bg-green-600" />
        ) : (
          <div className="h-1.5 w-1.5 rounded-full bg-amber-600" />
        )}
      </div>
    )
  }

  // Effect to fetch data when month changes
  useEffect(() => {
    setIsLoading(true)
    fetchData()
  }, [currentYear, currentMonth])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setCurrentMonth((month) => {
          if (month === 0) {
            setCurrentYear((year) => year - 1)
            return 11
          }
          return month - 1
        })
      } else if (e.key === 'ArrowRight') {
        setCurrentMonth((month) => {
          if (month === 11) {
            setCurrentYear((year) => year + 1)
            return 0
          }
          return month + 1
        })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (isLoading) {
    return <CalendarSkeleton />
  }

  if (error) {
    return (
      <NetworkError
        message={error}
        onRetry={() => {
          setError(null)
          setIsLoading(true)
          fetchData()
        }}
      />
    )
  }

  if (habits.length === 0) {
    return (
      <motion.div 
        className="space-y-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          Calendar
        </h1>
        <motion.div 
          className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 py-24 shadow-sm"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="text-center">
            <motion.div 
              className="mb-6 text-7xl"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              📅
            </motion.div>
            <h2 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">No habits to track</h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-md">
              Add habits from your dashboard to see your progress on the calendar!
            </p>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  const selectedDayData = selectedDate
    ? completionsByDate.get(toISODateString(selectedDate))
    : null

  return (
    <motion.div 
      className="space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Calendar
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Track your habit completion history</p>
        </div>
      </motion.div>

      {/* GitHub-Style Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <HabitHeatmap completions={yearCompletions} totalHabits={habits.length} />
      </motion.div>

      {/* Navigation */}
      <motion.div 
        className="flex items-center justify-between rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-6 shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <motion.div whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            size="default"
            onClick={handlePreviousMonth}
            aria-label="Previous month"
            className="h-11 w-11 rounded-xl border-2 p-0 hover:bg-blue-50 hover:border-blue-300 transition-all"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </Button>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div 
            key={`${currentYear}-${currentMonth}`}
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatMonthYear(currentYear, currentMonth)}
            </h2>
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleToday}
                className="rounded-lg border-2 font-semibold hover:bg-blue-50 hover:border-blue-300 transition-all"
              >
                Today
              </Button>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        <motion.div whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            size="default"
            onClick={handleNextMonth}
            aria-label="Next month"
            className="h-11 w-11 rounded-xl border-2 p-0 hover:bg-blue-50 hover:border-blue-300 transition-all"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </Button>
        </motion.div>
      </motion.div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-6 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 text-sm shadow-sm">
        <div className="flex items-center gap-2 font-medium">
          <div className="h-8 w-8 rounded-lg border-2 border-green-400 dark:border-green-600 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 shadow-sm" />
          <span className="text-gray-700 dark:text-gray-300">All completed</span>
        </div>
        <div className="flex items-center gap-2 font-medium">
          <div className="h-8 w-8 rounded-lg border-2 border-amber-400 dark:border-amber-600 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30 shadow-sm" />
          <span className="text-gray-700 dark:text-gray-300">Partially completed</span>
        </div>
        <div className="flex items-center gap-2 font-medium">
          <div className="h-8 w-8 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm" />
          <span className="text-gray-700 dark:text-gray-300">Not completed</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <motion.div
        className="overflow-hidden rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-6 shadow-lg max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        {/* Day names header */}
        <div className="mb-4 grid grid-cols-7 gap-3">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
            <motion.div
              key={day}
              className="text-center text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
            >
              {day}
            </motion.div>
          ))}
        </div>

        {/* Calendar days */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={`${currentYear}-${currentMonth}`}
            className="grid grid-cols-7 gap-3"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.01
                }
              },
              exit: { opacity: 0 }
            }}
          >
            {calendarDays.map((day, index) => (
              <motion.button
                key={index}
                onClick={() => handleDayClick(day)}
                disabled={day.isFuture || !day.isCurrentMonth}
                className={getDayClassName(day)}
                aria-label={`${day.date.toLocaleDateString()}`}
                variants={{
                  hidden: { opacity: 0, scale: 0.8 },
                  visible: { opacity: 1, scale: 1 }
                }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10">{day.dayOfMonth}</span>
                {getDayIndicator(day)}
              </motion.button>
            ))}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Day Detail Dialog */}
      <DayDetailDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        date={selectedDate}
        habits={habits}
        completedHabitIds={selectedDayData?.completedHabitIds || []}
      />
    </motion.div>
  )
}

