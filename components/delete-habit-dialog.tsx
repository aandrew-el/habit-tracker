'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface DeleteHabitDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onHabitDeleted: () => void
  habitId: string | null
  habitName: string | null
}

export function DeleteHabitDialog({
  open,
  onOpenChange,
  onHabitDeleted,
  habitId,
  habitName,
}: DeleteHabitDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!habitId) {
      toast.error('No habit selected')
      return
    }

    setIsDeleting(true)

    try {
      const supabase = createClient()

      // Delete habit (completions will cascade delete)
      const { error: deleteError } = await supabase
        .from('habits')
        .delete()
        .eq('id', habitId)

      if (deleteError) {
        toast.error('❌ Something went wrong. Please try again.')
        throw deleteError
      }

      // Success - close dialog and refresh
      toast.success('🗑️ Habit removed')
      onOpenChange(false)
      onHabitDeleted()
    } catch {
      // Error already shown via toast
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[500px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-bold text-red-600">
            Delete Habit?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base text-gray-600 dark:text-gray-400">
            This will permanently delete <span className="font-semibold text-gray-900 dark:text-white">&quot;{habitName}&quot;</span> and all its tracking
            history. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>


        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel 
            disabled={isDeleting}
            className="rounded-xl border-2 font-semibold"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleDelete()
            }}
            disabled={isDeleting}
            className="rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 hover:from-red-700 hover:to-red-800"
          >
            {isDeleting ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Deleting...</span>
              </div>
            ) : (
              'Delete Habit'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

