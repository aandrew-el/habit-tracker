'use client'

import { useState } from 'react'
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

interface AddHabitDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onHabitAdded: () => void
}

export function AddHabitDialog({
  open,
  onOpenChange,
  onHabitAdded,
}: AddHabitDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily')
  const [category, setCategory] = useState('Personal')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('Habit name is required')
      return
    }

    setIsSubmitting(true)

    try {
      const supabase = createClient()

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        toast.error('You must be logged in to add a habit')
        throw new Error('You must be logged in to add a habit')
      }

      // Insert habit and get the inserted data back
      const { data: insertedHabit, error: insertError } = await supabase
        .from('habits')
        .insert({
          user_id: user.id,
          name: name.trim(),
          description: description.trim() || null,
          frequency,
          category,
          archived: false,
        })
        .select()
        .single()

      if (insertError) {
        toast.error('❌ Something went wrong. Please try again.')
        throw insertError
      }

      // Success - reset form and close dialog
      toast.success('✨ Habit added! Let\'s build that streak!')
      setName('')
      setDescription('')
      setFrequency('daily')
      setCategory('Personal')
      onOpenChange(false)

      // Real-time subscription will automatically update the UI
    } catch (err) {
      console.error('Error adding habit:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setName('')
    setDescription('')
    setFrequency('daily')
    setCategory('Personal')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Add New Habit
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600 dark:text-gray-400">
            Create a new habit to track. Choose a name and how often you want to
            do it.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Habit Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Morning Exercise"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting}
                autoFocus
                className="h-11 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Description (optional)
              </Label>
              <Textarea
                id="description"
                placeholder="Add any notes about this habit..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
                rows={3}
                className="rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Category
              </Label>
              <Select
                value={category}
                onValueChange={setCategory}
                disabled={isSubmitting}
              >
                <SelectTrigger id="category" className="h-11 w-full rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100">
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
              <Label htmlFor="frequency" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Frequency
              </Label>
              <Select
                value={frequency}
                onValueChange={(value) =>
                  setFrequency(value as 'daily' | 'weekly')
                }
                disabled={isSubmitting}
              >
                <SelectTrigger id="frequency" className="h-11 w-full rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100">
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
                  <span>Adding...</span>
                </div>
              ) : (
                'Add Habit'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

