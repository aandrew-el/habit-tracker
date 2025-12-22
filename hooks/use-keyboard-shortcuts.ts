'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface UseKeyboardShortcutsProps {
  onAddHabit?: () => void
  onShowHelp?: () => void
  enabled?: boolean
}

export function useKeyboardShortcuts({
  onAddHabit,
  onShowHelp,
  enabled = true,
}: UseKeyboardShortcutsProps = {}) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input/textarea
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      // Navigation shortcuts (only work on dashboard pages)
      const isDashboard = pathname?.startsWith('/dashboard')

      if (isDashboard) {
        // Number keys for navigation
        if (e.key === '1') {
          e.preventDefault()
          router.push('/dashboard')
          return
        }
        if (e.key === '2') {
          e.preventDefault()
          router.push('/dashboard/calendar')
          return
        }
        if (e.key === '3') {
          e.preventDefault()
          router.push('/dashboard/analytics')
          return
        }
        if (e.key === '4') {
          e.preventDefault()
          router.push('/dashboard/achievements')
          return
        }
        if (e.key === '5') {
          e.preventDefault()
          router.push('/dashboard/settings')
          return
        }

        // Action shortcuts
        if (e.key === 'n' || e.key === 'N') {
          e.preventDefault()
          if (onAddHabit && pathname === '/dashboard') {
            onAddHabit()
          }
          return
        }
      }

      // Global shortcuts (work everywhere)
      if (e.key === '?' && e.shiftKey) {
        e.preventDefault()
        if (onShowHelp) {
          onShowHelp()
        }
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enabled, pathname, router, onAddHabit, onShowHelp])
}
