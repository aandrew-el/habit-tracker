'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { calculateCurrentStreak, calculateLongestStreak } from '@/lib/streak-calculator'
import { CheckCircle2, Pencil, Trash2, Flame, Award } from 'lucide-react'
import { getCategoryConfig } from '@/lib/categories'
import { HabitDetailDialog } from '@/components/habit-detail-dialog'
import { HabitNoteDialog } from '@/components/habit-note-dialog'

interface HabitCardProps {
  habit: {
    id: string
    name: string
    description: string | null
    frequency: 'daily' | 'weekly'
    category?: string
  }
  completions: Array<{ completed_at: string }>
  isCompletedToday: boolean
  onEdit: () => void
  onDelete: () => void
  onCheckOff: () => void
}

export function HabitCard({
  habit,
  completions,
  isCompletedToday,
  onEdit,
  onDelete,
  onCheckOff,
}: HabitCardProps) {
  const [isCheckingOff, setIsCheckingOff] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false)
  const [completedAtForNote, setCompletedAtForNote] = useState<string>('')

  const completionDates = completions.map((c) => new Date(c.completed_at))
  const currentStreak = calculateCurrentStreak(completionDates)
  const longestStreak = calculateLongestStreak(completionDates)
  const categoryConfig = getCategoryConfig(habit.category || 'Personal')

  const celebrateMilestone = (streak: number) => {
    if (streak === 7) {
      // 7-day streak - small celebration
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#8b5cf6', '#ec4899']
      })
      toast.success('🎉 7-day streak! Keep it up!', {
        duration: 4000,
      })
    } else if (streak === 30) {
      // 30-day streak - bigger celebration
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#f59e0b', '#ef4444', '#eab308'],
        ticks: 300
      })
      toast.success('🔥 30-day streak! You\'re unstoppable!', {
        duration: 5000,
      })
    } else if (streak === 100) {
      // 100-day streak - MASSIVE celebration
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
          origin: { x: Math.random(), y: Math.random() - 0.2 }
        })
      }, 250)

      toast.success('🏆 100-DAY STREAK! You\'re a legend!', {
        duration: 6000,
      })
    }
  }

  const handleCheckOff = async () => {
    if (isCompletedToday || isCheckingOff) return

    setIsCheckingOff(true)

    try {
      const supabase = createClient()

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        toast.error('You must be logged in')
        throw new Error('You must be logged in')
      }

      // Get current timestamp (full date + time for special achievements)
      const now = new Date()
      const today = now.toISOString().split('T')[0]

      // Insert completion with full timestamp
      const { error: insertError } = await supabase
        .from('habit_completions')
        .insert({
          habit_id: habit.id,
          user_id: user.id,
          completed_at: now.toISOString(), // Store full timestamp for time-based achievements
        })

      if (insertError) {
        // Check if it's a unique constraint error (already completed)
        if (insertError.code === '23505') {
          toast.success('Already completed today! 🎉')
          onCheckOff()
          return
        }
        toast.error('❌ Failed to check off habit. Please try again.')
        throw insertError
      }

      // Calculate new streak (add today to completion dates)
      const updatedCompletionDates = [...completionDates, new Date()]
      const updatedStreak = calculateCurrentStreak(updatedCompletionDates)

      // Success - show toast with option to add note
      toast.success(`✅ Nice work! Streak: ${updatedStreak} day${updatedStreak === 1 ? '' : 's'}`, {
        action: {
          label: 'Add Note',
          onClick: () => {
            setCompletedAtForNote(today)
            setIsNoteDialogOpen(true)
          },
        },
      })

      // Trigger confetti animation
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#6366f1', '#8b5cf6', '#10b981', '#f59e0b']
      })

      // Check for milestone celebrations
      celebrateMilestone(updatedStreak)

      // Trigger refresh
      onCheckOff()
    } catch {
      // Still refresh to get latest state
      onCheckOff()
    } finally {
      setIsCheckingOff(false)
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <Card
          className={`group flex flex-col border-2 ${categoryConfig.borderClass} shadow-lg shadow-blue-500/5 backdrop-blur-sm bg-white/95 dark:bg-gray-800/95 hover:shadow-2xl hover:shadow-blue-500/10 transition-all cursor-pointer`}
          onClick={() => setIsDetailOpen(true)}
        >
        <CardHeader className="pb-1">
          <div className="flex items-start justify-between gap-2 mb-2">
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent line-clamp-2 break-words" title={habit.name}>
              {habit.name}
            </CardTitle>
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${categoryConfig.bgClass} ${categoryConfig.textClass} text-xs font-semibold border ${categoryConfig.borderClass}`}>
              <categoryConfig.icon className="h-3.5 w-3.5" />
              {categoryConfig.label}
            </div>
          </div>
          <CardDescription className="capitalize text-sm font-semibold text-gray-600 dark:text-gray-400">
            {habit.frequency}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-1 space-y-3 pt-0">
          {habit.description && (
            <p
              className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed break-all line-clamp-2 cursor-help"
              title={habit.description}
            >
              {habit.description}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <motion.div 
              className="flex items-center gap-2 rounded-xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-red-50 px-3 py-2 shadow-md shadow-orange-500/10"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Flame className="h-4 w-4 text-orange-600" />
              <div className="flex items-baseline gap-1">
                <motion.span 
                  key={currentStreak}
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-lg font-bold text-orange-900"
                >
                  {currentStreak}
                </motion.span>
                <span className="text-xs font-medium text-orange-700">day{currentStreak === 1 ? '' : 's'}</span>
              </div>
            </motion.div>
            <motion.div 
              className="flex items-center gap-2 rounded-xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 px-3 py-2 shadow-md shadow-amber-500/10"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Award className="h-4 w-4 text-amber-600" />
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-amber-900">{longestStreak}</span>
                <span className="text-xs font-medium text-amber-700">best</span>
              </div>
            </motion.div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pt-3">
          <motion.div className="w-full" whileTap={{ scale: 0.98 }}>
            <Button
              className={`w-full h-12 rounded-xl font-semibold text-base shadow-lg transition-all ${
                isCompletedToday
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 shadow-green-500/30 hover:shadow-green-500/50'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 active:scale-95'
              }`}
              onClick={(e) => {
                e.stopPropagation()
                handleCheckOff()
              }}
              disabled={isCompletedToday || isCheckingOff}
            >
              {isCheckingOff ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Checking off...</span>
                </div>
              ) : isCompletedToday ? (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Completed Today</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Check off today</span>
                </div>
              )}
            </Button>
          </motion.div>

          <div className="flex w-full gap-2">
            <motion.div className="flex-1" whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                className="w-full rounded-xl border-2 font-semibold hover:bg-blue-50 hover:border-blue-300 transition-all"
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit()
                }}
              >
                <Pencil className="h-4 w-4 mr-1.5" />
                Edit
              </Button>
            </motion.div>
            <motion.div className="flex-1" whileTap={{ scale: 0.95 }}>
              <Button
                variant="destructive"
                className="w-full rounded-xl font-semibold shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30 transition-all"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete()
                }}
              >
                <Trash2 className="h-4 w-4 mr-1.5" />
                Delete
              </Button>
            </motion.div>
          </div>
        </CardFooter>
      </Card>
    </motion.div>

      <HabitDetailDialog
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        habit={habit}
        completions={completions}
        onEdit={onEdit}
        onDelete={onDelete}
        onRefresh={onCheckOff}
      />

      <HabitNoteDialog
        isOpen={isNoteDialogOpen}
        onClose={() => setIsNoteDialogOpen(false)}
        habitId={habit.id}
        habitName={habit.name}
        completedAt={completedAtForNote}
        onNoteSaved={onCheckOff}
      />
    </>
  )
}

