'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'

interface NotificationPreferences {
  enabled: boolean
  reminderTime: string
}

interface UsePushNotificationsReturn {
  isSupported: boolean
  permission: NotificationPermission | 'default'
  isSubscribed: boolean
  isLoading: boolean
  preferences: NotificationPreferences
  subscribe: () => Promise<boolean>
  unsubscribe: () => Promise<boolean>
  updateReminderTime: (time: string) => Promise<boolean>
}

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray.buffer as ArrayBuffer
}

export function usePushNotifications(): UsePushNotificationsReturn {
  const [isSupported, setIsSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission | 'default'>('default')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    enabled: false,
    reminderTime: '09:00',
  })

  // Check if push notifications are supported
  useEffect(() => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
    setIsSupported(supported)

    if (supported) {
      setPermission(Notification.permission)
    }
  }, [])

  // Load existing subscription and preferences
  useEffect(() => {
    async function loadState() {
      if (!isSupported) {
        setIsLoading(false)
        return
      }

      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          setIsLoading(false)
          return
        }

        // Check for existing subscription
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.getSubscription()
        setIsSubscribed(!!subscription)

        // Load preferences from Supabase
        const { data: prefs } = await supabase
          .from('notification_preferences')
          .select('enabled, reminder_time')
          .eq('user_id', user.id)
          .single()

        if (prefs) {
          setPreferences({
            enabled: prefs.enabled,
            reminderTime: prefs.reminder_time?.substring(0, 5) || '09:00',
          })
        }
      } catch {
        // Silently fail - user will see default state
      } finally {
        setIsLoading(false)
      }
    }

    loadState()
  }, [isSupported])

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false

    try {
      setIsLoading(true)

      // Request permission
      const result = await Notification.requestPermission()
      setPermission(result)

      if (result !== 'granted') {
        return false
      }

      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })

      // Send subscription to server
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          reminderTime: preferences.reminderTime,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save subscription')
      }

      setIsSubscribed(true)
      setPreferences(prev => ({ ...prev, enabled: true }))
      return true
    } catch {
      return false
    } finally {
      setIsLoading(false)
    }
  }, [isSupported, preferences.reminderTime])

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false

    try {
      setIsLoading(true)

      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        // Unsubscribe from push
        await subscription.unsubscribe()

        // Remove from server
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            endpoint: subscription.endpoint,
          }),
        })
      }

      setIsSubscribed(false)
      setPreferences(prev => ({ ...prev, enabled: false }))
      return true
    } catch {
      return false
    } finally {
      setIsLoading(false)
    }
  }, [isSupported])

  const updateReminderTime = useCallback(async (time: string): Promise<boolean> => {
    try {
      setIsLoading(true)

      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return false

      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          reminder_time: time + ':00',
          enabled: preferences.enabled,
        })

      if (error) throw error

      setPreferences(prev => ({ ...prev, reminderTime: time }))
      return true
    } catch {
      return false
    } finally {
      setIsLoading(false)
    }
  }, [preferences.enabled])

  return {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    preferences,
    subscribe,
    unsubscribe,
    updateReminderTime,
  }
}
