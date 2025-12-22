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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CATEGORIES } from '@/lib/categories'

interface Habit {
  id: string
  name: string
  description: string | null
  frequency: 'daily' | 'weekly'
  category?: string
}

interface EditHabitDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onHabitUpdated: () => void
  habit: Habit | null
}

export function EditHabitDialog({
  open,
  onOpenChange,
  onHabitUpdated,
  habit,
}: EditHabitDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily')
  const [category, setCategory] = useState('Personal')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Pre-fill form when habit changes
  useEffect(() => {
    if (habit) {
      setName(habit.name)
      setDescription(habit.description || '')
      setFrequency(habit.frequency)
      setCategory(habit.category || 'Personal')
    }
  }, [habit])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('Habit name is required')
      return
    }

    if (!habit) {
      toast.error('No habit selected')
      return
    }

    setIsSubmitting(true)

    try {
      const supabase = createClient()

      // Update habit
      const { data: updatedData, error: updateError } = await supabase
        .from('habits')
        .update({
          name: name.trim(),
          description: description.trim() || null,
          frequency,
          category,
        })
        .eq('id', habit.id)
        .select()
        .single()

      if (updateError) {
        toast.error(`❌ Failed to update: ${updateError.message}`)
        throw updateError
      }

      // Success - close dialog
      toast.success('✨ Habit updated!')
      onOpenChange(false)
      onHabitUpdated()
    } catch {
      // Error already shown via toast
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Edit Habit
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600 dark:text-gray-400">
            Update your habit details and tracking frequency.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Habit Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-name"
                placeholder="e.g., Morning Exercise"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting}
                autoFocus
                maxLength={50}
                className="h-11 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/50 transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Description (optional)
              </Label>
              <Textarea
                id="edit-description"
                placeholder="Add any notes about this habit..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
                rows={3}
                maxLength={200}
                className="rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/50 transition-all resize-none max-h-32 overflow-y-auto"
                style={{ wordBreak: 'break-all', overflowWrap: 'break-word' }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-category" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Category
              </Label>
              <Select
                value={category}
                onValueChange={setCategory}
                disabled={isSubmitting}
              >
                <SelectTrigger id="edit-category" className="h-11 w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/50">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      <div className="flex items-center gap-2">
                        <cat.icon className="h-4 w-4" />
                        {cat.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-frequency" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Frequency
              </Label>
              <Select
                value={frequency}
                onValueChange={(value) =>
                  setFrequency(value as 'daily' | 'weekly')
                }
                disabled={isSubmitting}
              >
                <SelectTrigger id="edit-frequency" className="h-11 w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/50">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>

          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="rounded-xl border-2 font-semibold"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Saving...</span>
                </div>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

