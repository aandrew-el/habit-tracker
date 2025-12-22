'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Settings, Home, Calendar, BarChart3, Zap, Trophy, BookOpen } from 'lucide-react'
import { toast } from 'sonner'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'
import { KeyboardShortcutsModal } from '@/components/keyboard-shortcuts-modal'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false)

  // Enable keyboard shortcuts
  useKeyboardShortcuts({
    onShowHelp: () => setIsShortcutsOpen(true),
  })

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        toast.error('Failed to sign out. Please try again.')
        return
      }
      router.push('/')
      router.refresh()
    } catch {
      toast.error('Failed to sign out. Please try again.')
    }
  }

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname?.startsWith(path)
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors">
      {/* Navigation */}
      <header className="sticky top-0 z-40 border-b-2 border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-sm transition-colors">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30 transition-all group-hover:shadow-xl group-hover:shadow-blue-500/40">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                  <path strokeLinecap="round" d="M21 12a9 9 0 11-6.22-8.56" />
                </svg>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">
                HabitFlow
              </h1>
            </Link>
            <nav className="hidden sm:flex items-center gap-1 rounded-xl bg-gray-100 dark:bg-gray-800 p-1 transition-colors">
              <Link
                href="/dashboard"
                className={cn(
                  'rounded-lg px-4 py-2 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
                  isActive('/dashboard')
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                )}
              >
                Habits
              </Link>
              <Link
                href="/dashboard/calendar"
                className={cn(
                  'rounded-lg px-4 py-2 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
                  isActive('/dashboard/calendar')
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                )}
              >
                Calendar
              </Link>
              <Link
                href="/dashboard/analytics"
                className={cn(
                  'rounded-lg px-4 py-2 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
                  isActive('/dashboard/analytics')
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                )}
              >
                Analytics
              </Link>
              <Link
                href="/dashboard/journal"
                className={cn(
                  'rounded-lg px-4 py-2 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
                  isActive('/dashboard/journal')
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                )}
              >
                Journal
              </Link>
              <Link
                href="/dashboard/achievements"
                className={cn(
                  'rounded-lg px-4 py-2 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
                  isActive('/dashboard/achievements')
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                )}
              >
                Achievements
              </Link>
              <Link
                href="/dashboard/settings"
                className={cn(
                  'rounded-lg p-2 text-sm font-semibold transition-all flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
                  isActive('/dashboard/settings')
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                )}
                aria-label="Settings"
              >
                <Settings className="h-4 w-4" />
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto flex-1 px-4 py-8 pb-28 sm:pb-8">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="sm:hidden fixed bottom-4 left-4 right-4 z-50 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-2xl shadow-gray-900/10 dark:shadow-gray-900/50">
        <div className="grid grid-cols-6 h-20 px-1">
          <Link
            href="/dashboard"
            className={cn(
              'flex flex-col items-center justify-center gap-1 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset rounded-xl',
              isActive('/dashboard')
                ? 'relative text-blue-600 dark:text-blue-400 before:absolute before:inset-x-1 before:top-2 before:bottom-2 before:bg-gradient-to-br before:from-blue-500/10 before:to-indigo-500/10 dark:before:from-blue-500/20 dark:before:to-indigo-500/20 before:rounded-xl before:-z-10'
                : 'text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 active:scale-95'
            )}
          >
            <Home className="h-5 w-5" />
            <span className="text-[10px] font-bold tracking-wide">Habits</span>
          </Link>
          <Link
            href="/dashboard/calendar"
            className={cn(
              'flex flex-col items-center justify-center gap-1 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset rounded-xl',
              isActive('/dashboard/calendar')
                ? 'relative text-blue-600 dark:text-blue-400 before:absolute before:inset-x-1 before:top-2 before:bottom-2 before:bg-gradient-to-br before:from-blue-500/10 before:to-indigo-500/10 dark:before:from-blue-500/20 dark:before:to-indigo-500/20 before:rounded-xl before:-z-10'
                : 'text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 active:scale-95'
            )}
          >
            <Calendar className="h-5 w-5" />
            <span className="text-[10px] font-bold tracking-wide">Calendar</span>
          </Link>
          <Link
            href="/dashboard/analytics"
            className={cn(
              'flex flex-col items-center justify-center gap-1 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset rounded-xl',
              isActive('/dashboard/analytics')
                ? 'relative text-blue-600 dark:text-blue-400 before:absolute before:inset-x-1 before:top-2 before:bottom-2 before:bg-gradient-to-br before:from-blue-500/10 before:to-indigo-500/10 dark:before:from-blue-500/20 dark:before:to-indigo-500/20 before:rounded-xl before:-z-10'
                : 'text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 active:scale-95'
            )}
          >
            <BarChart3 className="h-5 w-5" />
            <span className="text-[10px] font-bold tracking-wide">Stats</span>
          </Link>
          <Link
            href="/dashboard/journal"
            className={cn(
              'flex flex-col items-center justify-center gap-1 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset rounded-xl',
              isActive('/dashboard/journal')
                ? 'relative text-blue-600 dark:text-blue-400 before:absolute before:inset-x-1 before:top-2 before:bottom-2 before:bg-gradient-to-br before:from-blue-500/10 before:to-indigo-500/10 dark:before:from-blue-500/20 dark:before:to-indigo-500/20 before:rounded-xl before:-z-10'
                : 'text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 active:scale-95'
            )}
          >
            <BookOpen className="h-5 w-5" />
            <span className="text-[10px] font-bold tracking-wide">Journal</span>
          </Link>
          <Link
            href="/dashboard/achievements"
            className={cn(
              'flex flex-col items-center justify-center gap-1 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset rounded-xl',
              isActive('/dashboard/achievements')
                ? 'relative text-blue-600 dark:text-blue-400 before:absolute before:inset-x-1 before:top-2 before:bottom-2 before:bg-gradient-to-br before:from-blue-500/10 before:to-indigo-500/10 dark:before:from-blue-500/20 dark:before:to-indigo-500/20 before:rounded-xl before:-z-10'
                : 'text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 active:scale-95'
            )}
          >
            <Trophy className="h-5 w-5" />
            <span className="text-[10px] font-bold tracking-wide">Awards</span>
          </Link>
          <Link
            href="/dashboard/settings"
            className={cn(
              'flex flex-col items-center justify-center gap-1 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset rounded-xl',
              isActive('/dashboard/settings')
                ? 'relative text-blue-600 dark:text-blue-400 before:absolute before:inset-x-1 before:top-2 before:bottom-2 before:bg-gradient-to-br before:from-blue-500/10 before:to-indigo-500/10 dark:before:from-blue-500/20 dark:before:to-indigo-500/20 before:rounded-xl before:-z-10'
                : 'text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 active:scale-95'
            )}
          >
            <Settings className="h-5 w-5" />
            <span className="text-[10px] font-bold tracking-wide">Settings</span>
          </Link>
        </div>
      </nav>

      {/* Keyboard Shortcuts Help Button - Fixed bottom right */}
      <button
        onClick={() => setIsShortcutsOpen(true)}
        className="hidden sm:flex fixed bottom-8 right-8 z-40 items-center gap-2 rounded-xl border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 px-4 py-2.5 text-sm font-semibold text-purple-700 dark:text-purple-300 shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
        aria-label="Show keyboard shortcuts"
      >
        <Zap className="h-4 w-4" />
        <span className="hidden lg:inline">Keyboard Shortcuts</span>
        <kbd className="hidden lg:inline rounded border border-purple-300 dark:border-purple-700 bg-white dark:bg-purple-900 px-1.5 py-0.5 text-xs">?</kbd>
      </button>

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  )
}
