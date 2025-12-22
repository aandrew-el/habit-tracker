'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface Habit {
  id: string
  name: string
}

interface DayDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  date: Date | null
  habits: Habit[]
  completedHabitIds: string[]
}

export function DayDetailDialog({
  open,
  onOpenChange,
  date,
  habits,
  completedHabitIds,
}: DayDetailDialogProps) {
  if (!date) return null

  const completedCount = completedHabitIds.length
  const totalCount = habits.length

  const formatDate = (d: Date) => {
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {formatDate(date)}
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600 dark:text-gray-400">
            {completedCount} of {totalCount} habits completed
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {habits.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">No habits to track</p>
          ) : (
            habits.map((habit) => {
              const isCompleted = completedHabitIds.includes(habit.id)
              return (
                <div
                  key={habit.id}
                  className={`flex items-center gap-3 rounded-xl border-2 p-4 transition-all ${
                    isCompleted
                      ? 'border-green-300 dark:border-green-700 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 shadow-sm'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                  }`}
                >
                  <span className="text-2xl">
                    {isCompleted ? '✅' : '⬜'}
                  </span>
                  <span
                    className={`text-base truncate ${
                      isCompleted ? 'font-semibold text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'
                    }`}
                    title={habit.name}
                  >
                    {habit.name}
                  </span>
                </div>
              )
            })
          )}
        </div>

        {totalCount > 0 && (
          <div className="rounded-xl border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 p-4 text-center shadow-sm">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {Math.round((completedCount / totalCount) * 100)}%
            </div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-1">
              completion rate
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

