'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ThemeToggle } from '@/components/theme-toggle'
import { User, Moon, Download, Info, LogOut, Bell } from 'lucide-react'
import { SettingsSkeleton } from '@/components/settings-skeleton'
import { NotificationSettings } from '@/components/notification-settings'

export default function SettingsPage() {
  const router = useRouter()
  const [email, setEmail] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const supabase = createClient()
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error || !user) {
          toast.error('Failed to load user data')
          return
        }
        
        setEmail(user.email || '')
      } catch {
        toast.error('Failed to load settings')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [])

  const handleSignOut = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      toast.success('Signed out successfully')
      router.push('/')
      router.refresh()
    } catch {
      toast.error('Failed to sign out')
    }
  }

  const handleExportData = async () => {
    try {
      const supabase = createClient()
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        toast.error('You must be logged in')
        return
      }

      // Fetch all habits
      const { data: habits, error: habitsError } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .eq('archived', false)

      if (habitsError) throw habitsError

      // Fetch all completions
      const { data: completions, error: completionsError } = await supabase
        .from('habit_completions')
        .select('*')
        .eq('user_id', user.id)

      if (completionsError) throw completionsError

      // Create CSV content
      let csvContent = 'Habit Name,Description,Frequency,Created At,Completed At\n'
      
      // Helper to escape CSV values (double quotes become double-double quotes)
      const escapeCSV = (value: string) => value.replace(/"/g, '""')

      habits?.forEach(habit => {
        const habitCompletions = completions?.filter(c => c.habit_id === habit.id) || []
        const name = escapeCSV(habit.name)
        const description = escapeCSV(habit.description || '')

        if (habitCompletions.length === 0) {
          csvContent += `"${name}","${description}","${habit.frequency}","${habit.created_at}",""\n`
        } else {
          habitCompletions.forEach(completion => {
            csvContent += `"${name}","${description}","${habit.frequency}","${habit.created_at}","${completion.completed_at}"\n`
          })
        }
      })

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `habitflow-data-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      toast.success('📊 Data exported successfully!')
    } catch {
      toast.error('❌ Something went wrong. Please try again.')
    }
  }

  if (isLoading) {
    return <SettingsSkeleton />
  }

  return (
    <motion.div 
      className="space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage your account and preferences</p>
      </motion.div>

      <div className="grid gap-8 max-w-3xl">
        {/* Account Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 shadow-lg">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold dark:text-white">Account</CardTitle>
                  <CardDescription className="text-sm dark:text-gray-400">Your account information</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Email Address</Label>
                <div className="rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-4 py-3.5 text-gray-900 dark:text-white font-medium">
                  {email}
                </div>
              </div>
              <div className="pt-2">
                <motion.div whileTap={{ scale: 0.95 }}>
                  <Button 
                    onClick={handleSignOut}
                    variant="destructive"
                    className="w-full h-12 rounded-xl font-semibold shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Appearance Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 shadow-lg">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg shadow-purple-500/30">
                  <Moon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold dark:text-white">Appearance</CardTitle>
                  <CardDescription className="text-sm dark:text-gray-400">Customize how HabitFlow looks</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Theme</Label>
                <ThemeToggle />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Choose your preferred theme or use system settings
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notifications Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          <Card className="border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 shadow-lg">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-600 shadow-lg shadow-orange-500/30">
                  <Bell className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold dark:text-white">Notifications</CardTitle>
                  <CardDescription className="text-sm dark:text-gray-400">Get reminded to complete your habits</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <NotificationSettings />
            </CardContent>
          </Card>
        </motion.div>

        {/* Data Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 shadow-lg">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/30">
                  <Download className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold dark:text-white">Data</CardTitle>
                  <CardDescription className="text-sm dark:text-gray-400">Export your habit data</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <motion.div whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={handleExportData}
                  variant="outline"
                  className="w-full h-12 rounded-xl border-2 font-semibold hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-300 dark:hover:border-green-700 transition-all"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Data as CSV
                </Button>
              </motion.div>
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                Download all your habits and completion history as a CSV file for backup or analysis
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* About Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 shadow-lg">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/30">
                  <Info className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold dark:text-white">About</CardTitle>
                  <CardDescription className="text-sm dark:text-gray-400">Application information</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex justify-between items-center text-base">
                <span className="text-gray-600 dark:text-gray-400 font-medium">Version</span>
                <span className="font-bold text-gray-900 dark:text-white">v1.0.0</span>
              </div>
              <div className="flex justify-between items-center text-base">
                <span className="text-gray-600 dark:text-gray-400 font-medium">Built by</span>
                <span className="font-bold text-gray-900 dark:text-white">Andrew El-Sayegh</span>
              </div>
              <div className="pt-4 border-t-2 border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center leading-relaxed">
                  Made with ❤️ for building better habits
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}

