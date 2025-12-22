'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Flame } from 'lucide-react'

interface Completion {
  habit_id: string
  completed_at: string
}

interface HabitHeatmapProps {
  completions: Completion[]
  totalHabits: number
}

interface DayData {
  date: Date
  dateStr: string
  count: number
  percentage: number
  level: 0 | 1 | 2 | 3 | 4
}

const CELL_SIZE = 14
const CELL_GAP = 3
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function HabitHeatmap({ completions, totalHabits }: HabitHeatmapProps) {
  const [tooltip, setTooltip] = useState<{ day: DayData; x: number; y: number } | null>(null)

  // Generate data for the past 365 days
  const heatmapData = useMemo(() => {
    const days: DayData[] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Create a map of completions by date
    const completionsByDate = new Map<string, number>()
    completions.forEach((c) => {
      const dateStr = c.completed_at.split('T')[0]
      completionsByDate.set(dateStr, (completionsByDate.get(dateStr) || 0) + 1)
    })

    // Generate last 365 days
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const count = completionsByDate.get(dateStr) || 0
      const percentage = totalHabits > 0 ? (count / totalHabits) * 100 : 0

      let level: 0 | 1 | 2 | 3 | 4 = 0
      if (percentage > 0 && percentage < 25) level = 1
      else if (percentage >= 25 && percentage < 50) level = 2
      else if (percentage >= 50 && percentage < 75) level = 3
      else if (percentage >= 75) level = 4

      days.push({ date, dateStr, count, percentage, level })
    }

    return days
  }, [completions, totalHabits])

  // Group days into weeks (columns) - Sunday = 0
  const weeks = useMemo(() => {
    const result: (DayData | null)[][] = []
    let currentWeek: (DayData | null)[] = []

    // Pad first week
    const firstDayOfWeek = heatmapData[0].date.getDay()
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push(null)
    }

    heatmapData.forEach((day) => {
      currentWeek.push(day)
      if (currentWeek.length === 7) {
        result.push(currentWeek)
        currentWeek = []
      }
    })

    // Pad last week
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null)
      }
      result.push(currentWeek)
    }

    return result
  }, [heatmapData])

  // Stats
  const stats = useMemo(() => {
    const totalCompletions = heatmapData.reduce((sum, day) => sum + day.count, 0)
    const daysWithActivity = heatmapData.filter((d) => d.count > 0).length

    let currentStreak = 0
    for (let i = heatmapData.length - 1; i >= 0; i--) {
      if (heatmapData[i].count > 0) currentStreak++
      else break
    }

    let longestStreak = 0
    let current = 0
    heatmapData.forEach((day) => {
      if (day.count > 0) {
        current++
        longestStreak = Math.max(longestStreak, current)
      } else {
        current = 0
      }
    })

    return { totalCompletions, daysWithActivity, currentStreak, longestStreak }
  }, [heatmapData])

  const getLevelColor = (level: number) => {
    const colors = [
      'bg-gray-200 dark:bg-gray-700',      // level 0 - empty
      'bg-green-200 dark:bg-green-900',    // level 1 - low
      'bg-green-400 dark:bg-green-700',    // level 2 - medium
      'bg-green-500 dark:bg-green-500',    // level 3 - high
      'bg-green-600 dark:bg-green-400',    // level 4 - complete
    ]
    return colors[level] || colors[0]
  }

  // Month labels - find first week of each month
  const monthLabels = useMemo(() => {
    const labels: { month: string; weekIndex: number }[] = []
    let lastMonth = -1

    weeks.forEach((week, weekIndex) => {
      const firstValidDay = week.find((d) => d !== null)
      if (firstValidDay) {
        const month = firstValidDay.date.getMonth()
        if (month !== lastMonth) {
          labels.push({
            month: firstValidDay.date.toLocaleString('default', { month: 'short' }),
            weekIndex,
          })
          lastMonth = month
        }
      }
    })

    return labels
  }, [weeks])

  const handleMouseEnter = (day: DayData, e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setTooltip({
      day,
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
    })
  }

  const gridHeight = 7 * CELL_SIZE + 6 * CELL_GAP // 7 rows with gaps

  return (
    <Card className="border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-bold dark:text-white flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              Activity Heatmap
            </CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {stats.totalCompletions} completions in the last year
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{stats.currentStreak}</div>
              <div className="text-xs text-gray-500">Current streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-500">{stats.longestStreak}</div>
              <div className="text-xs text-gray-500">Longest streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{stats.daysWithActivity}</div>
              <div className="text-xs text-gray-500">Active days</div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto pb-2">
          <div className="inline-block">
            {/* Month labels */}
            <div className="flex" style={{ marginLeft: 36, marginBottom: 8 }}>
              {monthLabels.map((label, idx) => {
                const nextLabel = monthLabels[idx + 1]
                const span = nextLabel
                  ? nextLabel.weekIndex - label.weekIndex
                  : weeks.length - label.weekIndex
                const width = span * (CELL_SIZE + CELL_GAP)

                return (
                  <div
                    key={idx}
                    className="text-xs text-gray-400 font-medium"
                    style={{ width, flexShrink: 0 }}
                  >
                    {label.month}
                  </div>
                )
              })}
            </div>

            {/* Grid container */}
            <div className="flex">
              {/* Day labels */}
              <div
                className="flex flex-col justify-between pr-2"
                style={{ height: gridHeight }}
              >
                {DAY_LABELS.map((day, i) => (
                  <div
                    key={day}
                    className="text-xs text-gray-400 flex items-center justify-end"
                    style={{ height: CELL_SIZE }}
                  >
                    {i % 2 === 1 ? day : ''}
                  </div>
                ))}
              </div>

              {/* Heatmap grid */}
              <div className="flex" style={{ gap: CELL_GAP }}>
                {weeks.map((week, weekIdx) => (
                  <div
                    key={weekIdx}
                    className="flex flex-col"
                    style={{ gap: CELL_GAP }}
                  >
                    {week.map((day, dayIdx) => (
                      <div
                        key={dayIdx}
                        className={`rounded-sm transition-all ${
                          day
                            ? `${getLevelColor(day.level)} cursor-pointer hover:ring-2 hover:ring-white/50`
                            : 'bg-transparent'
                        }`}
                        style={{
                          width: CELL_SIZE,
                          height: CELL_SIZE,
                        }}
                        onMouseEnter={(e) => day && handleMouseEnter(day, e)}
                        onMouseLeave={() => setTooltip(null)}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-end gap-2 mt-4 text-xs text-gray-400">
              <span>Less</span>
              <div className="flex" style={{ gap: 3 }}>
                {[0, 1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`rounded-sm ${getLevelColor(level)}`}
                    style={{ width: CELL_SIZE, height: CELL_SIZE }}
                  />
                ))}
              </div>
              <span>More</span>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Floating tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-xl pointer-events-none border border-gray-700"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="font-semibold">
            {tooltip.day.count} completion{tooltip.day.count !== 1 ? 's' : ''}
          </div>
          <div className="text-gray-300">
            {tooltip.day.date.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </div>
          {totalHabits > 0 && (
            <div className="text-gray-400 mt-1">
              {Math.round(tooltip.day.percentage)}% of habits
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
