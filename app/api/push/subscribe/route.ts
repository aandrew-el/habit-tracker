import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createServerClient as createSSRClient } from '@supabase/ssr'

export async function POST(request: NextRequest) {
  try {
    const { subscription, reminderTime } = await request.json()

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 })
    }

    // Validate endpoint length
    if (typeof subscription.endpoint !== 'string' || subscription.endpoint.length > 500) {
      return NextResponse.json({ error: 'Invalid endpoint' }, { status: 400 })
    }

    // Validate keys
    if (typeof subscription.keys.p256dh !== 'string' || subscription.keys.p256dh.length > 200) {
      return NextResponse.json({ error: 'Invalid p256dh key' }, { status: 400 })
    }
    if (typeof subscription.keys.auth !== 'string' || subscription.keys.auth.length > 50) {
      return NextResponse.json({ error: 'Invalid auth key' }, { status: 400 })
    }

    // Validate reminderTime format (HH:MM)
    if (reminderTime && !/^\d{2}:\d{2}$/.test(reminderTime)) {
      return NextResponse.json({ error: 'Invalid reminder time format' }, { status: 400 })
    }

    // Get user from session
    const cookieStore = await cookies()
    const supabase = createSSRClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use service role for database operations
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Save push subscription
    const { error: subError } = await adminClient
      .from('push_subscriptions')
      .upsert({
        user_id: user.id,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      }, {
        onConflict: 'user_id,endpoint',
      })

    if (subError) {
      return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 })
    }

    // Save/update notification preferences
    const { error: prefError } = await adminClient
      .from('notification_preferences')
      .upsert({
        user_id: user.id,
        enabled: true,
        reminder_time: reminderTime ? reminderTime + ':00' : '09:00:00',
      }, {
        onConflict: 'user_id',
      })

    if (prefError) {
      return NextResponse.json({ error: 'Failed to save preferences' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
