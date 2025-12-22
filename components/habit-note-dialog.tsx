'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
import { BookOpen, Sparkles } from 'lucide-react'

interface HabitNoteDialogProps {
  isOpen: boolean
  onClose: () => void
  habitId: string
  habitName: string
  completedAt: string
  existingNote?: string
  onNoteSaved?: () => void
}

const NOTE_PROMPTS = [
  "How did it feel to complete this today?",
  "What made today's completion special?",
  "Any challenges you overcame?",
  "What motivated you today?",
  "Anything you want to remember about this?",
]

export function HabitNoteDialog({
  isOpen,
  onClose,
  habitId,
  habitName,
  completedAt,
  existingNote = '',
  onNoteSaved,
}: HabitNoteDialogProps) {
  const [note, setNote] = useState(existingNote)
  const [isSaving, setIsSaving] = useState(false)
  const [prompt] = useState(() => NOTE_PROMPTS[Math.floor(Math.random() * NOTE_PROMPTS.length)])

  const handleSave = async () => {
    if (!note.trim()) {
      onClose()
      return
    }

    setIsSaving(true)

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('habit_completions')
        .update({ notes: note.trim() })
        .eq('habit_id', habitId)
        .eq('completed_at', completedAt.split('T')[0])

      if (error) throw error

      toast.success('Note saved!')
      onNoteSaved?.()
      onClose()
    } catch {
      toast.error('Failed to save note')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSkip = () => {
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-500" />
            {existingNote ? 'Edit Note' : 'Add a Note'}
          </DialogTitle>
          <DialogDescription className="text-left">
            <span className="font-medium text-gray-900 dark:text-gray-100">{habitName}</span>
            <span className="text-gray-500"> • </span>
            <span className="text-gray-500">
              {new Date(completedAt).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span className="italic">{prompt}</span>
          </div>

          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Write your thoughts..."
            className="min-h-[120px] resize-none"
            autoFocus
          />

          <p className="text-xs text-gray-400 text-right">
            {note.length}/500 characters
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {!existingNote && (
            <Button variant="ghost" onClick={handleSkip} disabled={isSaving}>
              Skip
            </Button>
          )}
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Saving...
              </div>
            ) : (
              'Save Note'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
