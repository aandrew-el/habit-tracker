'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase'
import { BookOpen, Calendar, Filter, Pencil, Trash2, Search, Plus, Sparkles, Lightbulb, PenLine, Flame, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { getCategoryConfig } from '@/lib/categories'
import { QuickAddNoteDialog } from '@/components/quick-add-note-dialog'

interface JournalEntry {
  id: string
  habit_id: string
  habit_name: string
  habit_category: string
  completed_at: string
  notes: string
  mood?: string | null
  created_at: string
}

const MOOD_CONFIG: Record<string, { emoji: string; label: string; color: string }> = {
  terrible: { emoji: '😢', label: 'Terrible', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' },
  bad: { emoji: '😕', label: 'Bad', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' },
  okay: { emoji: '😐', label: 'Okay', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' },
  good: { emoji: '😊', label: 'Good', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
  great: { emoji: '😄', label: 'Great', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' },
}

interface Habit {
  id: string
  name: string
  category?: string
}

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [habits, setHabits] = useState<Habit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedHabit, setSelectedHabit] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [editingEntry, setEditingEntry] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false)
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null)

  const MAX_PREVIEW_LENGTH = 150

  useEffect(() => {
    fetchJournalEntries()
  }, [])

  const fetchJournalEntries = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setIsLoading(false)
        return
      }

      // Fetch habits first
      const { data: habitsData, error: habitsError } = await supabase
        .from('habits')
        .select('id, name, category')
        .eq('user_id', user.id)
        .eq('archived', false)

      if (habitsError) {
        toast.error('Failed to load habits')
        throw habitsError
      }

      setHabits(habitsData || [])

      // Fetch all completions with notes
      const { data: completionsData, error } = await supabase
        .from('habit_completions')
        .select('id, habit_id, completed_at, notes, mood, created_at')
        .eq('user_id', user.id)
        .not('notes', 'is', null)
        .order('completed_at', { ascending: false })

      if (error) throw error

      // Join with habit data
      const entriesWithHabits = (completionsData || [])
        .map(completion => {
          const habit = habitsData?.find(h => h.id === completion.habit_id)
          if (!habit) return null
          return {
            id: completion.id,
            habit_id: completion.habit_id,
            habit_name: habit.name,
            habit_category: habit.category || 'Personal',
            completed_at: completion.completed_at,
            notes: completion.notes,
            mood: completion.mood,
            created_at: completion.created_at,
          } as JournalEntry
        })
        .filter((e): e is JournalEntry => e !== null)

      setEntries(entriesWithHabits)
    } catch {
      toast.error('Failed to load journal entries')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditNote = (entry: JournalEntry) => {
    setEditingEntry(entry.id)
    setEditText(entry.notes)
  }

  const handleSaveNote = async (entryId: string, habitId: string, completedAt: string) => {
    setIsSaving(true)
    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('habit_completions')
        .update({ notes: editText.trim() || null })
        .eq('id', entryId)

      if (error) throw error

      toast.success('Note updated!')
      setEditingEntry(null)
      setEditText('')
      fetchJournalEntries()
    } catch {
      toast.error('Failed to save note')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteNote = async (entryId: string) => {
    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('habit_completions')
        .update({ notes: null })
        .eq('id', entryId)

      if (error) throw error

      toast.success('Note deleted')
      fetchJournalEntries()
    } catch {
      toast.error('Failed to delete note')
    }
  }

  // Filter entries
  const filteredEntries = entries.filter(entry => {
    const matchesHabit = selectedHabit === 'all' || entry.habit_id === selectedHabit
    const matchesSearch = searchQuery === '' ||
      entry.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.habit_name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesHabit && matchesSearch
  })

  // Group entries by date
  const groupedEntries = filteredEntries.reduce((groups, entry) => {
    const date = entry.completed_at.split('T')[0]
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(entry)
    return groups
  }, {} as Record<string, JournalEntry[]>)

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (dateStr === today.toISOString().split('T')[0]) {
      return 'Today'
    } else if (dateStr === yesterday.toISOString().split('T')[0]) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      })
    }
  }

  // Calculate journaling streak
  const calculateJournalingStreak = () => {
    if (entries.length === 0) return 0

    const uniqueDates = [...new Set(entries.map(e => e.completed_at.split('T')[0]))]
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const todayStr = today.toISOString().split('T')[0]
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    // Check if streak is active (journaled today or yesterday)
    if (uniqueDates[0] !== todayStr && uniqueDates[0] !== yesterdayStr) {
      return 0
    }

    let streak = 1
    let currentDate = new Date(uniqueDates[0])

    for (let i = 1; i < uniqueDates.length; i++) {
      const expectedPrev = new Date(currentDate)
      expectedPrev.setDate(expectedPrev.getDate() - 1)
      const expectedPrevStr = expectedPrev.toISOString().split('T')[0]

      if (uniqueDates[i] === expectedPrevStr) {
        streak++
        currentDate = expectedPrev
      } else {
        break
      }
    }

    return streak
  }

  const journalingStreak = calculateJournalingStreak()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-12 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-blue-500" />
            Journal
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Your habit reflections and notes
          </p>
        </div>
        <Button
          onClick={() => setIsQuickAddOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all"
        >
          <PenLine className="h-4 w-4 mr-2" />
          Write Reflection
        </Button>
      </motion.div>

      {/* Filters */}
      <motion.div
        className="flex flex-col sm:flex-row gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedHabit} onValueChange={setSelectedHabit}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by habit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Habits</SelectItem>
            {habits.map(habit => (
              <SelectItem key={habit.id} value={habit.id}>
                {habit.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      {/* Stats */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="border-2 border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Flame className="h-5 w-5 text-orange-500" />
              <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">Streak</span>
            </div>
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {journalingStreak}
            </div>
            <div className="text-sm text-orange-700 dark:text-orange-300">day{journalingStreak === 1 ? '' : 's'}</div>
          </CardContent>
        </Card>
        <Card className="border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <CardContent className="p-4">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {entries.length}
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300">Total Notes</div>
          </CardContent>
        </Card>
        <Card className="border-2 border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
          <CardContent className="p-4">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {Object.keys(groupedEntries).length}
            </div>
            <div className="text-sm text-green-700 dark:text-green-300">Days Journaled</div>
          </CardContent>
        </Card>
        <Card className="border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <CardContent className="p-4">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {new Set(entries.map(e => e.habit_id)).size}
            </div>
            <div className="text-sm text-purple-700 dark:text-purple-300">Habits with Notes</div>
          </CardContent>
        </Card>
        <Card className="border-2 border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20">
          <CardContent className="p-4">
            <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
              {entries.reduce((sum, e) => sum + e.notes.length, 0)}
            </div>
            <div className="text-sm text-amber-700 dark:text-amber-300">Characters Written</div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Empty State */}
      {filteredEntries.length === 0 && (
        <motion.div
          className="py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {searchQuery || selectedHabit !== 'all' ? (
            // Filtered empty state
            <div className="text-center">
              <Search className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                No matching entries
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Try adjusting your filters to find entries.
              </p>
            </div>
          ) : (
            // First-time empty state with tips
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 mb-4">
                  <BookOpen className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Start Your Journal
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                  Capture your thoughts, track your growth, and reflect on your habit journey.
                </p>
              </div>

              {/* Tips */}
              <div className="grid sm:grid-cols-3 gap-4 mb-8">
                <Card className="border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                  <CardContent className="p-4 text-center">
                    <Lightbulb className="h-8 w-8 mx-auto text-blue-600 dark:text-blue-400 mb-2" />
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                      Reflect Daily
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Write a few sentences about how completing each habit made you feel
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                  <CardContent className="p-4 text-center">
                    <Sparkles className="h-8 w-8 mx-auto text-purple-600 dark:text-purple-400 mb-2" />
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                      Celebrate Wins
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Note your small victories and progress to stay motivated
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-2 border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                  <CardContent className="p-4 text-center">
                    <PenLine className="h-8 w-8 mx-auto text-green-600 dark:text-green-400 mb-2" />
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                      Track Growth
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Look back at past entries to see how far you've come
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* CTA */}
              <div className="text-center">
                <Button
                  onClick={() => setIsQuickAddOpen(true)}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all"
                >
                  <PenLine className="h-5 w-5 mr-2" />
                  Write Your First Reflection
                </Button>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                  Or complete a habit and click "Add Note" in the success message
                </p>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Timeline */}
      <div className="space-y-8">
        {Object.entries(groupedEntries).map(([date, dayEntries], groupIndex) => (
          <motion.div
            key={date}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * groupIndex }}
          >
            {/* Date Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {formatDate(date)}
                </span>
              </div>
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            </div>

            {/* Entries for this date */}
            <div className="space-y-3 pl-4 border-l-2 border-gray-200 dark:border-gray-700 ml-2">
              {dayEntries.map((entry, entryIndex) => {
                const categoryConfig = getCategoryConfig(entry.habit_category)
                const isEditing = editingEntry === entry.id

                return (
                  <motion.div
                    key={entry.id}
                    className="relative"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 * entryIndex }}
                  >
                    {/* Timeline dot */}
                    <div className="absolute -left-[21px] top-4 w-3 h-3 rounded-full bg-blue-500 border-2 border-white dark:border-gray-800" />

                    <Card
                      className={`border-2 transition-all overflow-hidden ${
                        expandedEntry === entry.id
                          ? 'border-blue-300 dark:border-blue-700 shadow-lg shadow-blue-500/10'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      } ${!isEditing ? 'cursor-pointer hover:shadow-md' : ''}`}
                      onClick={() => {
                        if (!isEditing) {
                          setExpandedEntry(expandedEntry === entry.id ? null : entry.id)
                        }
                      }}
                    >
                      <CardContent className="p-4">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${categoryConfig.bgClass} ${categoryConfig.textClass} text-xs font-semibold border ${categoryConfig.borderClass} max-w-[150px] sm:max-w-[200px]`}>
                              <categoryConfig.icon className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{entry.habit_name}</span>
                            </div>
                            {entry.mood && MOOD_CONFIG[entry.mood] && (
                              <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${MOOD_CONFIG[entry.mood].color}`}>
                                <span>{MOOD_CONFIG[entry.mood].emoji}</span>
                                <span>{MOOD_CONFIG[entry.mood].label}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            {!isEditing && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditNote(entry)}
                                  className="h-8 w-8 p-0"
                                  aria-label="Edit note"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteNote(entry.id)}
                                  className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  aria-label="Delete note"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </>
                            )}
                            {entry.notes.length > MAX_PREVIEW_LENGTH && !isEditing && (
                              <motion.div
                                animate={{ rotate: expandedEntry === entry.id ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <ChevronDown className="h-4 w-4 text-gray-400" />
                              </motion.div>
                            )}
                          </div>
                        </div>

                        {/* Note content or edit mode */}
                        {isEditing ? (
                          <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                            <Textarea
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="min-h-[100px] resize-none w-full overflow-y-auto"
                              autoFocus
                            />
                            <div className="flex gap-2 justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingEntry(null)
                                  setEditText('')
                                }}
                                disabled={isSaving}
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleSaveNote(entry.id, entry.habit_id, entry.completed_at)}
                                disabled={isSaving}
                              >
                                {isSaving ? 'Saving...' : 'Save'}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <motion.div
                            initial={false}
                            animate={{
                              height: 'auto',
                            }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                          >
                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words overflow-hidden" style={{ wordBreak: 'break-word' }}>
                              <AnimatePresence mode="wait">
                                <motion.span
                                  key={expandedEntry === entry.id ? 'expanded' : 'collapsed'}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  transition={{ duration: 0.15 }}
                                >
                                  {expandedEntry === entry.id || entry.notes.length <= MAX_PREVIEW_LENGTH
                                    ? entry.notes
                                    : `${entry.notes.slice(0, MAX_PREVIEW_LENGTH)}...`}
                                </motion.span>
                              </AnimatePresence>
                            </p>
                            {entry.notes.length > MAX_PREVIEW_LENGTH && (
                              <motion.p
                                className="text-xs text-blue-500 dark:text-blue-400 mt-2 font-medium"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.1 }}
                              >
                                {expandedEntry === entry.id ? 'Click to collapse' : 'Click to read more'}
                              </motion.p>
                            )}
                          </motion.div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Add Note Dialog */}
      <QuickAddNoteDialog
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        habits={habits}
        onNoteSaved={fetchJournalEntries}
      />
    </div>
  )
}
