'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase'
import { X, Flame, Award, CheckCircle2, Calendar, BookOpen, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { getCategoryConfig } from '@/lib/categories'
import { calculateCurrentStreak, calculateLongestStreak } from '@/lib/streak-calculator'

interface Habit {
  id: string
  name: string
  description: string | null
  frequency: 'daily' | 'weekly'
  category?: string
}

interface Completion {
  completed_at: string
  notes?: string | null
}

interface HabitDetailDialogProps {
  isOpen: boolean
  onClose: () => void
  habit: Habit | null
  completions: Completion[]
  onEdit: () => void
  onDelete: () => void
  onRefresh?: () => void
}

export function HabitDetailDialog({
  isOpen,
  onClose,
  habit,
  completions,
  onEdit,
  onDelete,
  onRefresh,
}: HabitDetailDialogProps) {
  const [editingNoteDate, setEditingNoteDate] = useState<string | null>(null)
  const [noteText, setNoteText] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  if (!isOpen || !habit) return null

  const completionDates = completions.map((c) => new Date(c.completed_at))
  const currentStreak = calculateCurrentStreak(completionDates)
  const longestStreak = calculateLongestStreak(completionDates)
  const totalCompletions = completions.length
  const categoryConfig = getCategoryConfig(habit.category || 'Personal')

  // Get last 7 days activity
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - i)
    return date.toISOString().split('T')[0]
  })

  const getCompletionForDate = (dateStr: string) => {
    return completions.find((c) => c.completed_at.split('T')[0] === dateStr)
  }

  const handleEditNote = (dateStr: string, existingNote?: string | null) => {
    setEditingNoteDate(dateStr)
    setNoteText(existingNote || '')
  }

  const handleSaveNote = async () => {
    if (!editingNoteDate || !habit) return

    setIsSaving(true)
    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('habit_completions')
        .update({ notes: noteText.trim() || null })
        .eq('habit_id', habit.id)
        .eq('completed_at', editingNoteDate)

      if (error) throw error

      toast.success('Note saved!')
      setEditingNoteDate(null)
      setNoteText('')
      onRefresh?.()
    } catch {
      toast.error('Failed to save note')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingNoteDate(null)
    setNoteText('')
  }

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          className="relative w-full max-w-lg rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-2xl"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', duration: 0.5 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="border-b-2 border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 break-words" style={{ wordBreak: 'break-word' }}>
                  {habit.name}
                </h2>
                <div className="flex items-center gap-3">
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${categoryConfig.bgClass} ${categoryConfig.textClass} text-xs font-semibold border ${categoryConfig.borderClass}`}>
                    <categoryConfig.icon className="h-3.5 w-3.5" />
                    {categoryConfig.label}
                  </div>
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 capitalize">
                    {habit.frequency}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
            {/* Description */}
            {habit.description && (
              <div>
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed break-all">
                  {habit.description}
                </p>
              </div>
            )}

            {/* Stats */}
            <div>
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                Statistics
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border-2 border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Flame className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    <span className="text-xs font-semibold text-orange-700 dark:text-orange-300">Current</span>
                  </div>
                  <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                    {currentStreak}
                  </div>
                  <div className="text-xs text-orange-600 dark:text-orange-400">
                    day{currentStreak === 1 ? '' : 's'}
                  </div>
                </div>

                <div className="rounded-xl border-2 border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">Best</span>
                  </div>
                  <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                    {longestStreak}
                  </div>
                  <div className="text-xs text-amber-600 dark:text-amber-400">
                    day{longestStreak === 1 ? '' : 's'}
                  </div>
                </div>

                <div className="rounded-xl border-2 border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-xs font-semibold text-green-700 dark:text-green-300">Total</span>
                  </div>
                  <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {totalCompletions}
                  </div>
                  <div className="text-xs text-green-600 dark:text-green-400">
                    time{totalCompletions === 1 ? '' : 's'}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity with Notes */}
            <div>
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Recent Activity (Last 7 Days)
              </h3>
              <div className="space-y-2">
                {last7Days.map((dateStr, index) => {
                  const date = new Date(dateStr)
                  const completion = getCompletionForDate(dateStr)
                  const isCompleted = !!completion
                  const isToday = index === 0
                  const dayName = isToday
                    ? 'Today'
                    : index === 1
                    ? 'Yesterday'
                    : date.toLocaleDateString('en-US', { weekday: 'long' })
                  const isEditing = editingNoteDate === dateStr

                  return (
                    <div
                      key={dateStr}
                      className={`rounded-lg border p-3 ${
                        isCompleted
                          ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full ${
                              isCompleted
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              <X className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <div className={`text-sm font-semibold ${isCompleted ? 'text-green-900 dark:text-green-100' : 'text-gray-700 dark:text-gray-300'}`}>
                              {dayName}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                          </div>
                        </div>

                        {/* Note indicator/button */}
                        {isCompleted && !isEditing && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditNote(dateStr, completion?.notes)}
                            className="text-xs h-7 px-2"
                          >
                            {completion?.notes ? (
                              <>
                                <BookOpen className="h-3 w-3 mr-1 text-blue-500" />
                                <span className="text-blue-600 dark:text-blue-400">View Note</span>
                              </>
                            ) : (
                              <>
                                <Pencil className="h-3 w-3 mr-1" />
                                <span className="text-gray-500">Add Note</span>
                              </>
                            )}
                          </Button>
                        )}
                      </div>

                      {/* Note display or edit mode */}
                      {isCompleted && completion?.notes && !isEditing && (
                        <div className="mt-2 pl-11">
                          <div className="text-sm text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 rounded-lg p-2 border border-gray-200 dark:border-gray-600 overflow-hidden">
                            <BookOpen className="h-3 w-3 inline mr-1 text-blue-500 flex-shrink-0" />
                            <span className="break-words" style={{ wordBreak: 'break-word' }}>
                              {completion.notes.length > 100
                                ? `${completion.notes.slice(0, 100)}...`
                                : completion.notes}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Edit mode */}
                      {isEditing && (
                        <div className="mt-3 pl-11 space-y-2">
                          <Textarea
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="How did it feel? What did you learn?"
                            className="min-h-[80px] text-sm resize-none"
                            autoFocus
                          />
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleCancelEdit}
                              disabled={isSaving}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={handleSaveNote}
                              disabled={isSaving}
                            >
                              {isSaving ? 'Saving...' : 'Save Note'}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t-2 border-gray-200 dark:border-gray-700 p-4 flex gap-3">
            <Button
              variant="outline"
              className="flex-1 rounded-xl border-2 font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700"
              onClick={() => {
                onClose()
                onEdit()
              }}
            >
              Edit Habit
            </Button>
            <Button
              variant="destructive"
              className="flex-1 rounded-xl font-semibold shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30"
              onClick={() => {
                onClose()
                onDelete()
              }}
            >
              Delete Habit
            </Button>
          </div>
        </motion.div>
      </div>
    </>
  )
}
