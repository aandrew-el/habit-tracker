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
import { HabitTemplatesDialog } from '@/components/habit-templates-dialog'
import { type HabitTemplate } from '@/lib/habit-templates'
import { Sparkles } from 'lucide-react'

interface Habit {
  id: string
  name: string
  description: string | null
  frequency: 'daily' | 'weekly'
  category: string
  archived: boolean
  created_at: string
}

interface AddHabitDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onHabitAdded: (habit: Habit) => void
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
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false)

  const handleTemplateSelect = (template: HabitTemplate) => {
    setName(template.name)
    setDescription(template.description)
    setFrequency(template.frequency)
    setCategory(template.category)
    // Re-open the Add Habit dialog after template selection
    onOpenChange(true)
  }

  const handleBrowseTemplates = () => {
    setIsTemplatesOpen(true)
    // Close the Add Habit dialog while browsing templates
    onOpenChange(false)
  }

  const handleTemplatesClose = () => {
    setIsTemplatesOpen(false)
    // Re-open the Add Habit dialog when closing templates without selection
    onOpenChange(true)
  }

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

      // Optimistically add to parent state with the inserted data
      onHabitAdded(insertedHabit)
    } catch {
      // Error already shown via toast
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
      <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-white via-blue-50/50 to-indigo-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 border-2 border-blue-200/60 dark:border-blue-900/30 shadow-2xl backdrop-blur-sm">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            ✨ Add New Habit
          </DialogTitle>
          <DialogDescription className="text-base text-gray-700 dark:text-gray-300">
            Create a new habit to track. Choose a name and how often you want to do it.
          </DialogDescription>
        </DialogHeader>

        {/* Browse Templates Button */}
        <div className="py-2">
          <Button
            type="button"
            onClick={handleBrowseTemplates}
            variant="outline"
            className="w-full h-12 rounded-xl border-2 border-purple-300 dark:border-purple-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 text-purple-700 dark:text-purple-300 font-semibold hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30 transition-all shadow-sm hover:shadow-md"
          >
            <Sparkles className="h-5 w-5 mr-2" />
            Browse Habit Templates
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <span className="text-lg">🎯</span>
                Habit Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Morning Exercise"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting}
                autoFocus
                maxLength={50}
                className="h-12 rounded-xl border-2 border-blue-300/60 dark:border-blue-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/50 transition-all shadow-sm hover:shadow-md"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <span className="text-lg">📝</span>
                Description (optional)
              </Label>
              <Textarea
                id="description"
                placeholder="Add any notes about this habit..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
                rows={3}
                maxLength={200}
                className="rounded-xl border-2 border-blue-300/60 dark:border-blue-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/50 transition-all shadow-sm hover:shadow-md resize-none max-h-32 overflow-y-auto"
                style={{ wordBreak: 'break-all', overflowWrap: 'break-word' }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <span className="text-lg">🏷️</span>
                  Category
                </Label>
                <Select
                  value={category}
                  onValueChange={setCategory}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="category" className="h-12 w-full rounded-xl border-2 border-blue-300/60 dark:border-blue-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/50 shadow-sm hover:shadow-md transition-all">
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
                <Label htmlFor="frequency" className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <span className="text-lg">📅</span>
                  Frequency
                </Label>
                <Select
                  value={frequency}
                  onValueChange={(value) =>
                    setFrequency(value as 'daily' | 'weekly')
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="frequency" className="h-12 w-full rounded-xl border-2 border-blue-300/60 dark:border-blue-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/50 shadow-sm hover:shadow-md transition-all">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">📆 Daily</SelectItem>
                    <SelectItem value="weekly">📊 Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

          </div>

          <DialogFooter className="gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="rounded-xl border-2 border-gray-300 dark:border-gray-600 font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500 transition-all hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 font-semibold shadow-lg shadow-blue-500/40 hover:shadow-xl hover:shadow-indigo-500/50 transition-all hover:scale-105 active:scale-95 text-white"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Adding...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>Add Habit</span>
                  <span>✨</span>
                </div>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      {/* Habit Templates Dialog */}
      <HabitTemplatesDialog
        isOpen={isTemplatesOpen}
        onClose={handleTemplatesClose}
        onSelectTemplate={handleTemplateSelect}
      />
    </Dialog>
  )
}

