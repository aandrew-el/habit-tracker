'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Target, TrendingUp, BarChart3, Flame, Star, CheckCircle2, Lightbulb, Calendar, Clock, PieChart, Sparkles } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, PieChart as RechartsPieChart, Pie, Cell } from 'recharts'
import { calculateCurrentStreak, calculateLongestStreak } from '@/lib/streak-calculator'
import { AnalyticsSkeleton } from '@/components/analytics-skeleton'
import { NetworkError } from '@/components/network-error'
import { getCategoryConfig } from '@/lib/categories'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AIInsightsTab } from '@/components/ai-insights-tab'

interface Habit {
  id: string
  name: string
  category: string | null
  frequency: 'daily' | 'weekly'
}

interface Completion {
  habit_id: string
  completed_at: string
}

export default function AnalyticsPage() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [completions, setCompletions] = useState<Completion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient()
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
          // User is not authenticated - handle gracefully
          setIsAuthenticated(false)
          setHabits([])
          setCompletions([])
          setIsLoading(false)
          return
        }

        setIsAuthenticated(true)

        // Fetch habits
        const { data: habitsData, error: habitsError } = await supabase
          .from('habits')
          .select('id, name, category, frequency')
          .eq('user_id', user.id)
          .eq('archived', false)

        if (habitsError) throw habitsError

        // Fetch all completions
        const { data: completionsData, error: completionsError } = await supabase
          .from('habit_completions')
          .select('habit_id, completed_at')
          .eq('user_id', user.id)

        if (completionsError) throw completionsError

        setHabits(habitsData || [])
        setCompletions(completionsData || [])
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analytics data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Calculate metrics
  const metrics = useMemo(() => {
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Weekly completion rate
    const weeklyCompletions = completions.filter(c => new Date(c.completed_at) >= sevenDaysAgo)
    const weeklyPossible = habits.length * 7
    const weeklyRate = weeklyPossible > 0 ? (weeklyCompletions.length / weeklyPossible) * 100 : 0

    // Monthly completion rate
    const monthlyCompletions = completions.filter(c => new Date(c.completed_at) >= thirtyDaysAgo)
    const monthlyPossible = habits.length * 30
    const monthlyRate = monthlyPossible > 0 ? (monthlyCompletions.length / monthlyPossible) * 100 : 0

    // Best current streak
    let bestStreak = 0
    let bestStreakHabit = ''
    habits.forEach(habit => {
      const habitCompletions = completions
        .filter(c => c.habit_id === habit.id)
        .map(c => new Date(c.completed_at))
      const streak = calculateCurrentStreak(habitCompletions)
      if (streak > bestStreak) {
        bestStreak = streak
        bestStreakHabit = habit.name
      }
    })

    // Most consistent habit
    let bestConsistency = 0
    let mostConsistentHabit = ''
    habits.forEach(habit => {
      const habitCompletions = completions.filter(
        c => c.habit_id === habit.id && new Date(c.completed_at) >= thirtyDaysAgo
      )
      const consistency = (habitCompletions.length / 30) * 100
      if (consistency > bestConsistency) {
        bestConsistency = consistency
        mostConsistentHabit = habit.name
      }
    })

    return {
      totalHabits: habits.length,
      weeklyRate: Math.round(weeklyRate),
      monthlyRate: Math.round(monthlyRate),
      bestStreak,
      bestStreakHabit,
      mostConsistentHabit,
      mostConsistencyRate: Math.round(bestConsistency),
      totalCheckIns: completions.length,
    }
  }, [habits, completions])

  // Chart data - Last 7 days
  const last7DaysData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const data = []
    const now = new Date()

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]
      const dayCompletions = completions.filter(c => c.completed_at === dateStr).length
      const possible = habits.length
      const rate = possible > 0 ? (dayCompletions / possible) * 100 : 0

      data.push({
        day: days[date.getDay()],
        rate: Math.round(rate),
      })
    }

    return data
  }, [habits, completions])

  // Chart data - Last 30 days
  const last30DaysData = useMemo(() => {
    const data = []
    const now = new Date()

    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]
      const count = completions.filter(c => c.completed_at.split('T')[0] === dateStr).length

      data.push({
        date: `${date.getMonth() + 1}/${date.getDate()}`,
        count,
      })
    }

    return data
  }, [completions])

  // Category breakdown data
  const categoryData = useMemo(() => {
    const categoryCompletions: Record<string, number> = {}

    habits.forEach(habit => {
      const category = habit.category || 'Personal'
      const habitCompletions = completions.filter(c => c.habit_id === habit.id).length
      categoryCompletions[category] = (categoryCompletions[category] || 0) + habitCompletions
    })

    return Object.entries(categoryCompletions).map(([name, value]) => {
      const config = getCategoryConfig(name)
      return {
        name,
        value,
        color: config.color,
      }
    }).filter(item => item.value > 0)
  }, [habits, completions])

  // Per-habit performance
  const habitPerformance = useMemo(() => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    return habits.map(habit => {
      const habitCompletions = completions.filter(c => c.habit_id === habit.id)
      const recentCompletions = habitCompletions.filter(c => new Date(c.completed_at) >= thirtyDaysAgo)
      const completionDates = habitCompletions.map(c => new Date(c.completed_at))

      const currentStreak = calculateCurrentStreak(completionDates)
      const longestStreak = calculateLongestStreak(completionDates)
      const completionRate = habit.frequency === 'daily'
        ? Math.round((recentCompletions.length / 30) * 100)
        : Math.round((recentCompletions.length / 4) * 100) // 4 weeks in a month

      return {
        id: habit.id,
        name: habit.name,
        category: habit.category || 'Personal',
        currentStreak,
        longestStreak,
        completionRate: Math.min(completionRate, 100),
        totalCompletions: habitCompletions.length,
      }
    }).sort((a, b) => b.completionRate - a.completionRate)
  }, [habits, completions])

  // Day of week patterns
  const dayOfWeekData = useMemo(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const dayCounts = [0, 0, 0, 0, 0, 0, 0]

    completions.forEach(c => {
      const date = new Date(c.completed_at)
      dayCounts[date.getDay()]++
    })

    const maxCount = Math.max(...dayCounts)

    return days.map((day, index) => ({
      day: day.slice(0, 3),
      fullDay: day,
      count: dayCounts[index],
      percentage: maxCount > 0 ? Math.round((dayCounts[index] / maxCount) * 100) : 0,
    }))
  }, [completions])

  // Smart insights
  const insights = useMemo(() => {
    const insightsList: { icon: string; title: string; description: string; type: 'success' | 'warning' | 'info' }[] = []

    // Best day insight
    const bestDay = dayOfWeekData.reduce((a, b) => a.count > b.count ? a : b)
    if (bestDay.count > 0) {
      insightsList.push({
        icon: '📅',
        title: `${bestDay.fullDay} is your best day`,
        description: `You complete the most habits on ${bestDay.fullDay}s. Consider scheduling important tasks then!`,
        type: 'success',
      })
    }

    // Worst day insight
    const worstDay = dayOfWeekData.reduce((a, b) => a.count < b.count ? a : b)
    if (worstDay.count < bestDay.count * 0.5 && completions.length > 7) {
      insightsList.push({
        icon: '⚠️',
        title: `${worstDay.fullDay} needs attention`,
        description: `You complete fewer habits on ${worstDay.fullDay}s. Try setting reminders!`,
        type: 'warning',
      })
    }

    // Streak insight
    if (metrics.bestStreak >= 7) {
      insightsList.push({
        icon: '🔥',
        title: `${metrics.bestStreak}-day streak!`,
        description: `Amazing consistency on "${metrics.bestStreakHabit}". Keep it going!`,
        type: 'success',
      })
    }

    // Completion rate insight
    if (metrics.weeklyRate >= 80) {
      insightsList.push({
        icon: '🏆',
        title: 'Outstanding week!',
        description: `${metrics.weeklyRate}% completion rate this week. You're crushing it!`,
        type: 'success',
      })
    } else if (metrics.weeklyRate < 50 && habits.length > 0) {
      insightsList.push({
        icon: '💪',
        title: 'Room for improvement',
        description: `Your weekly rate is ${metrics.weeklyRate}%. Focus on 1-2 key habits to build momentum.`,
        type: 'warning',
      })
    }

    // Category diversity
    const uniqueCategories = new Set(habits.map(h => h.category || 'Personal'))
    if (uniqueCategories.size >= 3) {
      insightsList.push({
        icon: '🌈',
        title: 'Well-rounded habits',
        description: `You're tracking habits across ${uniqueCategories.size} different categories. Great balance!`,
        type: 'info',
      })
    }

    return insightsList.slice(0, 4) // Show max 4 insights
  }, [dayOfWeekData, metrics, habits, completions])

  // Category colors for pie chart
  const CATEGORY_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

  const getColorClass = (rate: number) => {
    if (rate >= 70) return 'text-green-600 dark:text-green-400'
    if (rate >= 40) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  if (isLoading) {
    return <AnalyticsSkeleton />
  }

  if (error) {
    return (
      <NetworkError
        message={error}
        onRetry={() => {
          setError(null)
          setIsLoading(true)
          window.location.reload()
        }}
      />
    )
  }

  if (habits.length === 0) {
    return (
      <motion.div 
        className="space-y-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Analytics
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Track your progress and insights</p>
        </div>
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 py-24">
          <div className="text-center max-w-md">
            <div className="mb-6 text-7xl">📊</div>
            <h2 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">
              No Data Yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Add some habits and start tracking to see your analytics!
            </p>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div 
      className="space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
          Analytics
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Track your progress and insights</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mx-auto mb-6 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 p-1">
          <TabsTrigger
            value="overview"
            className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-md font-semibold"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="ai-insights"
            className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-md font-semibold"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            AI Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8 mt-0">
      {/* Metrics Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Habits</CardTitle>
              <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{metrics.totalHabits}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Active habits tracked</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">This Week</CardTitle>
              <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${getColorClass(metrics.weeklyRate)}`}>
                {metrics.weeklyRate}%
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Completion rate</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">This Month</CardTitle>
              <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${getColorClass(metrics.monthlyRate)}`}>
                {metrics.monthlyRate}%
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Completion rate</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Best Streak</CardTitle>
              <Flame className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{metrics.bestStreak}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                {metrics.bestStreakHabit || 'No streaks yet'}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Most Consistent</CardTitle>
              <Star className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">{metrics.mostConsistencyRate}%</div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                {metrics.mostConsistentHabit || 'Start tracking!'}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Check-ins</CardTitle>
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">{metrics.totalCheckIns}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">All time completions</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Smart Insights */}
      {insights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Card className="border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-950/40 dark:via-indigo-950/40 dark:to-blue-950/40 shadow-xl">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-700 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
                  Smart Insights
                </CardTitle>
              </div>
              <CardDescription className="dark:text-gray-400">
                Personalized recommendations based on your habits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {insights.map((insight, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className={`p-4 rounded-xl border-2 ${
                      insight.type === 'success'
                        ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
                        : insight.type === 'warning'
                        ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
                        : 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{insight.icon}</span>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{insight.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{insight.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Charts Row */}
      <motion.div
        className="grid gap-6 lg:grid-cols-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        {/* Category Breakdown */}
        {categoryData.length > 0 && (
          <Card className="border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <CardTitle className="dark:text-white">Category Breakdown</CardTitle>
              </div>
              <CardDescription className="dark:text-gray-400">
                Completions by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col lg:flex-row items-center gap-4">
                <ResponsiveContainer width="100%" height={200}>
                  <RechartsPieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgb(31 41 55)',
                        border: '1px solid rgb(55 65 81)',
                        borderRadius: '0.5rem',
                        color: 'white'
                      }}
                      formatter={(value) => [`${value} completions`, '']}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-2 justify-center">
                  {categoryData.map((category, index) => (
                    <Badge
                      key={category.name}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }}
                      />
                      {category.name}: {category.value}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Day of Week Patterns */}
        <Card className="border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <CardTitle className="dark:text-white">Weekly Patterns</CardTitle>
            </div>
            <CardDescription className="dark:text-gray-400">
              When you&apos;re most productive
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dayOfWeekData.map((day) => (
                <div key={day.day} className="flex items-center gap-3">
                  <span className="w-10 text-sm font-medium text-gray-600 dark:text-gray-400">{day.day}</span>
                  <div className="flex-1">
                    <Progress value={day.percentage} className="h-3" />
                  </div>
                  <span className="w-8 text-sm font-semibold text-gray-900 dark:text-white text-right">{day.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Original Charts */}
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.9 }}
      >
        {/* Last 7 Days Bar Chart */}
        <Card className="border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 shadow-lg">
          <CardHeader>
            <CardTitle className="dark:text-white">Last 7 Days Completion Rate</CardTitle>
            <CardDescription className="dark:text-gray-400">
              Daily completion percentage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={last7DaysData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis 
                  dataKey="day" 
                  className="text-sm dark:text-gray-400"
                  stroke="currentColor"
                />
                <YAxis 
                  className="text-sm dark:text-gray-400"
                  stroke="currentColor"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgb(31 41 55)',
                    border: '1px solid rgb(55 65 81)',
                    borderRadius: '0.5rem',
                    color: 'white'
                  }}
                  formatter={(value) => [`${value}%`, 'Completion']}
                />
                <Bar 
                  dataKey="rate" 
                  fill="url(#colorGradient)" 
                  radius={[8, 8, 0, 0]}
                />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Last 30 Days Line Chart */}
        <Card className="border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 shadow-lg">
          <CardHeader>
            <CardTitle className="dark:text-white">30-Day Trend</CardTitle>
            <CardDescription className="dark:text-gray-400">
              Number of habits completed each day
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={last30DaysData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis 
                  dataKey="date" 
                  className="text-sm dark:text-gray-400"
                  stroke="currentColor"
                  tick={{ fontSize: 12 }}
                  interval={4}
                />
                <YAxis 
                  className="text-sm dark:text-gray-400"
                  stroke="currentColor"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgb(31 41 55)',
                    border: '1px solid rgb(55 65 81)',
                    borderRadius: '0.5rem',
                    color: 'white'
                  }}
                  formatter={(value) => [`${value} habits`, 'Completed']}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#3b82f6" 
                  fill="url(#colorArea)" 
                  strokeWidth={2}
                />
                <defs>
                  <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Per-Habit Performance */}
      {habitPerformance.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.0 }}
        >
          <Card className="border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <CardTitle className="dark:text-white">Habit Performance</CardTitle>
              </div>
              <CardDescription className="dark:text-gray-400">
                Individual habit statistics (last 30 days)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {habitPerformance.map((habit, index) => {
                  const categoryConfig = getCategoryConfig(habit.category)
                  return (
                    <motion.div
                      key={habit.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.1 + index * 0.05 }}
                      className="p-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white truncate max-w-[150px] sm:max-w-[250px] md:max-w-none" title={habit.name}>{habit.name}</h4>
                          <Badge
                            variant="outline"
                            className="text-xs"
                            style={{ borderColor: categoryConfig.color, color: categoryConfig.color }}
                          >
                            {habit.category}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Flame className="h-4 w-4 text-orange-500" />
                            <span className="font-medium text-gray-700 dark:text-gray-300">{habit.currentStreak} day streak</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-amber-500" />
                            <span className="font-medium text-gray-700 dark:text-gray-300">{habit.longestStreak} best</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <Progress
                            value={habit.completionRate}
                            className={`h-3 ${
                              habit.completionRate >= 70
                                ? '[&>div]:bg-green-500'
                                : habit.completionRate >= 40
                                ? '[&>div]:bg-yellow-500'
                                : '[&>div]:bg-red-500'
                            }`}
                          />
                        </div>
                        <span className={`font-bold text-sm w-12 text-right ${getColorClass(habit.completionRate)}`}>
                          {habit.completionRate}%
                        </span>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
        </TabsContent>

        <TabsContent value="ai-insights" className="mt-0">
          <AIInsightsTab />
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}

