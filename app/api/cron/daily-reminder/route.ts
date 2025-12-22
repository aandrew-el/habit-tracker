import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { timingSafeEqual } from 'crypto'
import webpush from 'web-push'

interface PushSubscription {
  endpoint: string
  p256dh: string
  auth: string
}

// Configure web-push lazily to avoid build-time errors
let vapidConfigured = false
function configureVapid() {
  if (vapidConfigured) return

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  const subject = process.env.VAPID_SUBJECT || 'mailto:hello@habitflow.app'

  if (!publicKey || !privateKey) {
    throw new Error('VAPID keys not configured')
  }

  webpush.setVapidDetails(subject, publicKey, privateKey)
  vapidConfigured = true
}

// Timing-safe comparison to prevent timing attacks
function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  try {
    return timingSafeEqual(Buffer.from(a), Buffer.from(b))
  } catch {
    return false
  }
}

export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get('authorization')
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`

  if (!process.env.CRON_SECRET || !authHeader || !safeCompare(authHeader, expectedAuth)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Configure VAPID keys
  try {
    configureVapid()
  } catch {
    return NextResponse.json({ error: 'Push notifications not configured' }, { status: 500 })
  }

  try {
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get current time in HH:MM format
    const now = new Date()
    const currentHour = now.getUTCHours().toString().padStart(2, '0')
    const currentMinute = Math.floor(now.getUTCMinutes() / 30) * 30 // Round to nearest 30 min
    const timeWindow = `${currentHour}:${currentMinute.toString().padStart(2, '0')}:00`

    // Find users who want notifications at this time window
    const { data: preferences, error: prefError } = await adminClient
      .from('notification_preferences')
      .select(`
        user_id,
        reminder_time,
        push_subscriptions (
          endpoint,
          p256dh,
          auth
        )
      `)
      .eq('enabled', true)
      .gte('reminder_time', timeWindow)
      .lt('reminder_time', `${currentHour}:${(currentMinute + 30).toString().padStart(2, '0')}:00`)

    if (prefError) {
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    if (!preferences || preferences.length === 0) {
      return NextResponse.json({ message: 'No notifications to send', count: 0 })
    }

    let sentCount = 0
    let failedCount = 0
    const expiredEndpoints: string[] = []

    for (const pref of preferences) {
      const subscriptions = pref.push_subscriptions as PushSubscription[] | null

      if (!subscriptions || subscriptions.length === 0) continue

      // Check if user has incomplete habits today
      const today = now.toISOString().split('T')[0]

      const { data: habits } = await adminClient
        .from('habits')
        .select('id')
        .eq('user_id', pref.user_id)
        .eq('archived', false)

      if (!habits || habits.length === 0) continue

      const { data: completions } = await adminClient
        .from('habit_completions')
        .select('habit_id')
        .eq('user_id', pref.user_id)
        .eq('completed_at', today)

      const completedIds = new Set(completions?.map(c => c.habit_id) || [])
      const incompleteCount = habits.filter(h => !completedIds.has(h.id)).length

      if (incompleteCount === 0) continue // All habits done, no need to remind

      // Send notification to all subscriptions for this user
      for (const sub of subscriptions) {
        try {
          const pushSubscription = {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          }

          const payload = JSON.stringify({
            title: 'HabitFlow Reminder',
            body: incompleteCount === 1
              ? 'You have 1 habit left to complete today!'
              : `You have ${incompleteCount} habits left to complete today!`,
            url: '/dashboard',
          })

          await webpush.sendNotification(pushSubscription, payload)
          sentCount++
        } catch (error: unknown) {
          // Handle expired subscriptions (410 Gone or 404 Not Found)
          const pushError = error as { statusCode?: number }
          if (pushError.statusCode === 410 || pushError.statusCode === 404) {
            expiredEndpoints.push(sub.endpoint)
          }
          failedCount++
        }
      }
    }

    // Clean up expired subscriptions
    if (expiredEndpoints.length > 0) {
      await adminClient
        .from('push_subscriptions')
        .delete()
        .in('endpoint', expiredEndpoints)
    }

    return NextResponse.json({
      message: 'Notifications processed',
      sent: sentCount,
      failed: failedCount,
      cleanedUp: expiredEndpoints.length,
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
