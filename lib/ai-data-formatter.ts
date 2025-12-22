// Format habit data for AI consumption
// Prepares user data in a concise format for GPT-4o-mini

export interface HabitData {
  id: string
  name: string
  category: string
  frequency: 'daily' | 'weekly'
  created_at: string
}

export interface CompletionData {
  habit_id: string
  completed_at: string
  notes: string | null
  mood: 'terrible' | 'bad' | 'okay' | 'good' | 'great' | null
}

export interface FormattedHabitData {
  habits: Array<{
    name: string
    category: string
    frequency: string
    daysActive: number
  }>
  completionsByHabit: Record<string, {
    total: number
    last7Days: number
    last30Days: number
    completedDates: string[]
    currentStreak: number
    longestStreak: number
  }>
  moodData: Array<{
    date: string
    mood: string
    habitsCompleted: string[]
  }>
  weeklyPatterns: Record<string, number> // day of week -> count
  overallStats: {
    totalHabits: number
    totalCompletions: number
    avgCompletionRate7Days: number
    avgCompletionRate30Days: number
    daysTracked: number
  }
}

// Format raw habit data for AI prompts
export function formatHabitDataForAI(
  habits: HabitData[],
  completions: CompletionData[]
): FormattedHabitData {
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  // Group completions by habit
  const completionsByHabitId: Record<string, CompletionData[]> = {}
  completions.forEach(c => {
    if (!completionsByHabitId[c.habit_id]) {
      completionsByHabitId[c.habit_id] = []
    }
    completionsByHabitId[c.habit_id].push(c)
  })

  // Calculate weekly patterns (day of week distribution)
  const weeklyPatterns: Record<string, number> = {
    Sunday: 0,
    Monday: 0,
    Tuesday: 0,
    Wednesday: 0,
    Thursday: 0,
    Friday: 0,
    Saturday: 0,
  }
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  completions.forEach(c => {
    const date = new Date(c.completed_at)
    weeklyPatterns[dayNames[date.getDay()]]++
  })

  // Build completions summary per habit
  const completionsByHabit: FormattedHabitData['completionsByHabit'] = {}

  habits.forEach(habit => {
    const habitCompletions = completionsByHabitId[habit.id] || []
    const completedDates = habitCompletions.map(c => c.completed_at).sort()

    const last7Days = habitCompletions.filter(c =>
      new Date(c.completed_at) >= sevenDaysAgo
    ).length

    const last30Days = habitCompletions.filter(c =>
      new Date(c.completed_at) >= thirtyDaysAgo
    ).length

    completionsByHabit[habit.name] = {
      total: habitCompletions.length,
      last7Days,
      last30Days,
      completedDates: completedDates.slice(-30), // Last 30 for context
      currentStreak: calculateCurrentStreak(completedDates),
      longestStreak: calculateLongestStreak(completedDates),
    }
  })

  // Build mood data with habit associations
  const moodData: FormattedHabitData['moodData'] = []
  const completionsByDate: Record<string, { moods: string[], habits: string[] }> = {}

  completions.forEach(c => {
    const date = c.completed_at
    if (!completionsByDate[date]) {
      completionsByDate[date] = { moods: [], habits: [] }
    }

    const habitName = habits.find(h => h.id === c.habit_id)?.name
    if (habitName) {
      completionsByDate[date].habits.push(habitName)
    }
    if (c.mood) {
      completionsByDate[date].moods.push(c.mood)
    }
  })

  Object.entries(completionsByDate).forEach(([date, data]) => {
    if (data.moods.length > 0) {
      // Use the most common mood for that day
      const moodCounts: Record<string, number> = {}
      data.moods.forEach(m => {
        moodCounts[m] = (moodCounts[m] || 0) + 1
      })
      const dominantMood = Object.entries(moodCounts)
        .sort((a, b) => b[1] - a[1])[0][0]

      moodData.push({
        date,
        mood: dominantMood,
        habitsCompleted: data.habits,
      })
    }
  })

  // Calculate overall stats
  const daysTracked = new Set(completions.map(c => c.completed_at)).size
  const dailyHabits = habits.filter(h => h.frequency === 'daily').length

  // For daily habits, calculate completion rate
  const possible7Days = dailyHabits * 7
  const possible30Days = dailyHabits * 30
  const completed7Days = completions.filter(c =>
    new Date(c.completed_at) >= sevenDaysAgo
  ).length
  const completed30Days = completions.filter(c =>
    new Date(c.completed_at) >= thirtyDaysAgo
  ).length

  return {
    habits: habits.map(h => ({
      name: h.name,
      category: h.category,
      frequency: h.frequency,
      daysActive: Math.floor((now.getTime() - new Date(h.created_at).getTime()) / (24 * 60 * 60 * 1000)),
    })),
    completionsByHabit,
    moodData: moodData.slice(-30), // Last 30 days
    weeklyPatterns,
    overallStats: {
      totalHabits: habits.length,
      totalCompletions: completions.length,
      avgCompletionRate7Days: possible7Days > 0 ? Math.round((completed7Days / possible7Days) * 100) : 0,
      avgCompletionRate30Days: possible30Days > 0 ? Math.round((completed30Days / possible30Days) * 100) : 0,
      daysTracked,
    },
  }
}

// Convert formatted data to a concise string for AI
export function formatDataAsPrompt(data: FormattedHabitData): string {
  const lines: string[] = []

  lines.push('=== USER HABIT DATA ===')
  lines.push('')
  lines.push(`Total Habits: ${data.overallStats.totalHabits}`)
  lines.push(`Days Tracked: ${data.overallStats.daysTracked}`)
  lines.push(`7-Day Completion Rate: ${data.overallStats.avgCompletionRate7Days}%`)
  lines.push(`30-Day Completion Rate: ${data.overallStats.avgCompletionRate30Days}%`)
  lines.push('')

  lines.push('=== HABITS ===')
  data.habits.forEach(h => {
    const stats = data.completionsByHabit[h.name]
    lines.push(`- ${h.name} (${h.category}, ${h.frequency})`)
    lines.push(`  Last 7 days: ${stats.last7Days} completions`)
    lines.push(`  Current streak: ${stats.currentStreak} days`)
    lines.push(`  Longest streak: ${stats.longestStreak} days`)
  })
  lines.push('')

  lines.push('=== WEEKLY PATTERNS ===')
  Object.entries(data.weeklyPatterns).forEach(([day, count]) => {
    lines.push(`${day}: ${count} completions`)
  })
  lines.push('')

  if (data.moodData.length > 0) {
    lines.push('=== MOOD DATA (last 30 days) ===')
    const moodSummary: Record<string, { count: number, habits: string[] }> = {}
    data.moodData.forEach(m => {
      if (!moodSummary[m.mood]) {
        moodSummary[m.mood] = { count: 0, habits: [] }
      }
      moodSummary[m.mood].count++
      moodSummary[m.mood].habits.push(...m.habitsCompleted)
    })

    Object.entries(moodSummary).forEach(([mood, data]) => {
      const uniqueHabits = [...new Set(data.habits)]
      lines.push(`${mood}: ${data.count} days - habits: ${uniqueHabits.join(', ')}`)
    })
  }

  return lines.join('\n')
}

// Helper: Calculate current streak from sorted dates
function calculateCurrentStreak(dates: string[]): number {
  if (dates.length === 0) return 0

  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  // Check if today or yesterday is in the dates
  const lastDate = dates[dates.length - 1]
  if (lastDate !== today && lastDate !== yesterday) {
    return 0
  }

  let streak = 1
  for (let i = dates.length - 2; i >= 0; i--) {
    const current = new Date(dates[i + 1])
    const prev = new Date(dates[i])
    const diffDays = Math.round((current.getTime() - prev.getTime()) / (24 * 60 * 60 * 1000))

    if (diffDays === 1) {
      streak++
    } else {
      break
    }
  }

  return streak
}

// Helper: Calculate longest streak from sorted dates
function calculateLongestStreak(dates: string[]): number {
  if (dates.length === 0) return 0
  if (dates.length === 1) return 1

  let maxStreak = 1
  let currentStreak = 1

  for (let i = 1; i < dates.length; i++) {
    const current = new Date(dates[i])
    const prev = new Date(dates[i - 1])
    const diffDays = Math.round((current.getTime() - prev.getTime()) / (24 * 60 * 60 * 1000))

    if (diffDays === 1) {
      currentStreak++
      maxStreak = Math.max(maxStreak, currentStreak)
    } else {
      currentStreak = 1
    }
  }

  return maxStreak
}

// Check if user has enough data for insights
export function hasEnoughDataForInsights(
  habits: HabitData[],
  completions: CompletionData[]
): { hasEnough: boolean; message?: string; daysNeeded?: number } {
  if (habits.length === 0) {
    return {
      hasEnough: false,
      message: 'Add some habits to unlock AI insights!',
    }
  }

  const uniqueDays = new Set(completions.map(c => c.completed_at)).size

  // Lowered to 1 for testing - change back to 7 for production
  const minDays = 1
  if (uniqueDays < minDays) {
    return {
      hasEnough: false,
      message: `Keep tracking for ${minDays - uniqueDays} more days to unlock AI insights!`,
      daysNeeded: minDays - uniqueDays,
    }
  }

  return { hasEnough: true }
}
