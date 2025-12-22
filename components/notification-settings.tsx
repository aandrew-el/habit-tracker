'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Bell, BellOff, Clock, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { usePushNotifications } from '@/hooks/use-push-notifications'
import { cn } from '@/lib/utils'

const REMINDER_TIMES = [
  { value: '06:00', label: '6:00 AM' },
  { value: '07:00', label: '7:00 AM' },
  { value: '08:00', label: '8:00 AM' },
  { value: '09:00', label: '9:00 AM' },
  { value: '10:00', label: '10:00 AM' },
  { value: '12:00', label: '12:00 PM' },
  { value: '14:00', label: '2:00 PM' },
  { value: '17:00', label: '5:00 PM' },
  { value: '19:00', label: '7:00 PM' },
  { value: '20:00', label: '8:00 PM' },
  { value: '21:00', label: '9:00 PM' },
]

export function NotificationSettings() {
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    preferences,
    subscribe,
    unsubscribe,
    updateReminderTime,
  } = usePushNotifications()

  const [selectedTime, setSelectedTime] = useState(preferences.reminderTime)

  const handleToggle = async () => {
    if (isSubscribed) {
      const success = await unsubscribe()
      if (success) {
        toast.success('Notifications disabled')
      } else {
        toast.error('Failed to disable notifications')
      }
    } else {
      const success = await subscribe()
      if (success) {
        toast.success('Notifications enabled! You\'ll receive daily reminders.')
      } else if (permission === 'denied') {
        toast.error('Notifications blocked. Please enable them in your browser settings.')
      } else {
        toast.error('Failed to enable notifications')
      }
    }
  }

  const handleTimeChange = async (time: string) => {
    setSelectedTime(time)
    const success = await updateReminderTime(time)
    if (success) {
      toast.success('Reminder time updated')
    } else {
      toast.error('Failed to update reminder time')
    }
  }

  if (!isSupported) {
    return (
      <div className="rounded-xl border-2 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div>
            <h3 className="font-semibold text-amber-900 dark:text-amber-100">
              Notifications Not Supported
            </h3>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
              Your browser doesn't support push notifications. Try using Chrome, Firefox, or Edge for the full experience.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (permission === 'denied') {
    return (
      <div className="rounded-xl border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
        <div className="flex items-start gap-3">
          <BellOff className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900 dark:text-red-100">
              Notifications Blocked
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
              You've blocked notifications for this site. To enable them, click the lock icon in your browser's address bar and allow notifications.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Enable/Disable Toggle */}
      <div className="flex items-center justify-between rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <div className="flex items-center gap-3">
          {isSubscribed ? (
            <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-2">
              <Bell className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          ) : (
            <div className="rounded-full bg-gray-100 dark:bg-gray-700 p-2">
              <BellOff className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </div>
          )}
          <div>
            <Label htmlFor="notifications" className="font-semibold text-gray-900 dark:text-white">
              Daily Reminders
            </Label>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isSubscribed
                ? 'You\'ll receive reminders for incomplete habits'
                : 'Get reminded to complete your habits'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isLoading && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
          <Switch
            id="notifications"
            checked={isSubscribed}
            onCheckedChange={handleToggle}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Reminder Time Selection */}
      {isSubscribed && (
        <div className="rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <Label className="font-semibold text-gray-900 dark:text-white">
              Reminder Time
            </Label>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {REMINDER_TIMES.map((time) => (
              <button
                key={time.value}
                onClick={() => handleTimeChange(time.value)}
                disabled={isLoading}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-all border-2',
                  selectedTime === time.value
                    ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-300'
                    : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                )}
              >
                {time.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
            You'll receive a reminder at this time if you have incomplete habits
          </p>
        </div>
      )}

      {/* Status */}
      {isSubscribed && (
        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
          <CheckCircle2 className="h-4 w-4" />
          <span>Notifications are enabled and working</span>
        </div>
      )}
    </div>
  )
}
