/**
 * Calendar utility functions for date manipulation and grid generation
 */

/**
 * Get the first day of a month
 */
export function getMonthStart(year: number, month: number): Date {
  return new Date(year, month, 1)
}

/**
 * Get the last day of a month
 */
export function getMonthEnd(year: number, month: number): Date {
  return new Date(year, month + 1, 0)
}

/**
 * Get month start and end as ISO date strings for Supabase queries
 */
export function getMonthDateRange(year: number, month: number) {
  const start = getMonthStart(year, month)
  const end = getMonthEnd(year, month)
  
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  }
}

/**
 * Generate calendar grid with days from previous, current, and next month
 */
export interface CalendarDay {
  date: Date
  dayOfMonth: number
  isCurrentMonth: boolean
  isToday: boolean
  isFuture: boolean
}

export function generateCalendarGrid(
  year: number,
  month: number
): CalendarDay[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const firstDay = getMonthStart(year, month)
  const lastDay = getMonthEnd(year, month)

  const startDayOfWeek = firstDay.getDay() // 0 = Sunday
  const daysInMonth = lastDay.getDate()

  const grid: CalendarDay[] = []

  // Add days from previous month to fill the first week
  const prevMonthLastDay = new Date(year, month, 0)
  const daysFromPrevMonth = startDayOfWeek
  for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, prevMonthLastDay.getDate() - i)
    date.setHours(0, 0, 0, 0)
    grid.push({
      date,
      dayOfMonth: date.getDate(),
      isCurrentMonth: false,
      isToday: date.getTime() === today.getTime(),
      isFuture: date > today,
    })
  }

  // Add days from current month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    date.setHours(0, 0, 0, 0)
    grid.push({
      date,
      dayOfMonth: day,
      isCurrentMonth: true,
      isToday: date.getTime() === today.getTime(),
      isFuture: date > today,
    })
  }

  // Add days from next month to complete the last week
  const remainingDays = 7 - (grid.length % 7)
  if (remainingDays < 7) {
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day)
      date.setHours(0, 0, 0, 0)
      grid.push({
        date,
        dayOfMonth: day,
        isCurrentMonth: false,
        isToday: date.getTime() === today.getTime(),
        isFuture: date > today,
      })
    }
  }

  return grid
}

/**
 * Format month and year for display
 */
export function formatMonthYear(year: number, month: number): string {
  const date = new Date(year, month, 1)
  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

/**
 * Convert Date to ISO date string (YYYY-MM-DD)
 */
export function toISODateString(date: Date): string {
  return date.toISOString().split('T')[0]
}

