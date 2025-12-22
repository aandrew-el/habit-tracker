'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sparkles, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Habit {
  id: string
  name: string
}

interface QuickAddNoteDialogProps {
  isOpen: boolean
  onClose: () => void
  habits: Habit[]
  onNoteSaved: () => void
}

const PROMPTS = [
  "What made today meaningful?",
  "What's one thing you learned today?",
  "What are you grateful for right now?",
  "How did you grow today?",
  "What challenge did you overcome?",
  "What moment brought you joy today?",
  "What would you tell your past self?",
  "What's one small win from today?",
]

const MOODS = [
  { value: 'terrible', emoji: '😢', label: 'Terrible', color: 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700' },
  { value: 'bad', emoji: '😕', label: 'Bad', color: 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700' },
  { value: 'okay', emoji: '😐', label: 'Okay', color: 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700' },
  { value: 'good', emoji: '😊', label: 'Good', color: 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700' },
  { value: 'great', emoji: '😄', label: 'Great', color: 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700' },
]

export function QuickAddNoteDialog({
  isOpen,
  onClose,
  habits: propHabits,
  onNoteSaved,
}: QuickAddNoteDialogProps) {
  const [note, setNote] = useState('')
  const [selectedHabit, setSelectedHabit] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [selectedMood, setSelectedMood] = useState<string>('')
  const [isSaving, setIsSaving] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [completedHabitsToday, setCompletedHabitsToday] = useState<string[]>([])
  const [habits, setHabits] = useState<Habit[]>(propHabits || [])
  const [isLoadingHabits, setIsLoadingHabits] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setPrompt(PROMPTS[Math.floor(Math.random() * PROMPTS.length)])
      setNote('')
      setSelectedHabit('')
      setSelectedMood('')
      setSelectedDate(new Date().toISOString().split('T')[0])
      fetchHabitsAndCompletions()
    }
  }, [isOpen])

  const fetchHabitsAndCompletions = async () => {
    setIsLoadingHabits(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch all habits
      const { data: habitsData } = await supabase
        .from('habits')
        .select('id, name')
        .eq('user_id', user.id)
        .eq('archived', false)
        .order('name')

      if (habitsData) {
        setHabits(habitsData)
      }

      // Fetch today's completions
      const today = new Date().toISOString().split('T')[0]
      const { data: completionsData } = await supabase
        .from('habit_completions')
        .select('habit_id')
        .eq('user_id', user.id)
        .eq('completed_at', today)

      setCompletedHabitsToday(completionsData?.map(c => c.habit_id) || [])
    } catch {
      // Silently fail - form will show empty state
    } finally {
      setIsLoadingHabits(false)
    }
  }

  const handleSave = async () => {
    if (!note.trim()) {
      toast.error('Please write something first')
      return
    }

    if (!selectedHabit) {
      toast.error('Please select a habit to attach this note to')
      return
    }

    setIsSaving(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error('You must be logged in')
        return
      }

      // Check if there's already a completion for this habit on this date
      const { data: existingCompletion } = await supabase
        .from('habit_completions')
        .select('id, notes')
        .eq('habit_id', selectedHabit)
        .eq('completed_at', selectedDate)
        .single()

      if (existingCompletion) {
        // Update existing completion with note and mood
        const { error } = await supabase
          .from('habit_completions')
          .update({
            notes: note.trim(),
            mood: selectedMood || null,
          })
          .eq('id', existingCompletion.id)

        if (error) throw error
      } else {
        // Create new completion with note and mood
        const { error } = await supabase
          .from('habit_completions')
          .insert({
            habit_id: selectedHabit,
            user_id: user.id,
            completed_at: selectedDate,
            notes: note.trim(),
            mood: selectedMood || null,
          })

        if (error) throw error
      }

      toast.success('Reflection saved!')
      onNoteSaved()
      onClose()
    } catch (err: unknown) {
      const error = err as { message?: string }
      toast.error(error?.message || 'Failed to save reflection')
    } finally {
      setIsSaving(false)
    }
  }

  // Get habits that are completed today (can add notes to them)
  const availableHabits = habits.filter(h => completedHabitsToday.includes(h.id))
  const uncompletedHabits = habits.filter(h => !completedHabitsToday.includes(h.id))

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Write a Reflection
          </DialogTitle>
          <DialogDescription>
            Capture your thoughts and insights
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Writing Prompt */}
          <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 p-3">
            <p className="text-sm text-blue-700 dark:text-blue-300 italic flex items-start gap-2">
              <Sparkles className="h-4 w-4 mt-0.5 flex-shrink-0" />
              {prompt}
            </p>
          </div>

          {/* Mood Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              How are you feeling?
            </label>
            <div className="grid grid-cols-5 gap-2">
              {MOODS.map((mood) => (
                <button
                  key={mood.value}
                  type="button"
                  onClick={() => setSelectedMood(selectedMood === mood.value ? '' : mood.value)}
                  className={cn(
                    'flex flex-col items-center gap-1 py-2 px-1 rounded-xl border-2 transition-all',
                    selectedMood === mood.value
                      ? `${mood.color} ring-2 ring-offset-2 ring-blue-500 scale-105`
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                  )}
                >
                  <span className="text-xl">{mood.emoji}</span>
                  <span className="text-[9px] font-medium text-gray-600 dark:text-gray-400">
                    {mood.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Habit Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Attach to habit
            </label>
            {isLoadingHabits ? (
              <div className="h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 animate-pulse" />
            ) : habits.length === 0 ? (
              <div className="text-sm text-gray-500 dark:text-gray-400 p-3 rounded-md border border-dashed border-gray-300 dark:border-gray-600">
                No habits found. Create a habit first from the Habits page.
              </div>
            ) : (
              <Select value={selectedHabit} onValueChange={setSelectedHabit}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a habit..." />
                </SelectTrigger>
                <SelectContent>
                  {availableHabits.length > 0 && (
                    <>
                      <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">
                        Completed Today
                      </div>
                      {availableHabits.map(habit => (
                        <SelectItem key={habit.id} value={habit.id}>
                          ✓ {habit.name}
                        </SelectItem>
                      ))}
                    </>
                  )}
                  {uncompletedHabits.length > 0 && (
                    <>
                      <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 mt-2">
                        {availableHabits.length > 0 ? 'Other Habits' : 'Your Habits'} (will mark as done)
                      </div>
                      {uncompletedHabits.map(habit => (
                        <SelectItem key={habit.id} value={habit.id}>
                          {habit.name}
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Date Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
            />
          </div>

          {/* Note Textarea */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Your reflection
            </label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Write your thoughts..."
              className="h-[150px] resize-none w-full overflow-y-auto"
              autoFocus
            />
            <p className="text-xs text-gray-400 text-right">
              {note.length} characters
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !note.trim() || !selectedHabit || habits.length === 0}>
            {isSaving ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Saving...
              </div>
            ) : (
              'Save Reflection'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
