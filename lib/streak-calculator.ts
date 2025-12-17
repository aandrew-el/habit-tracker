/**
 * Calculates the current streak of consecutive days from today backwards
 * @param completions Array of completion dates
 * @returns Number of consecutive days (0 if today is not completed)
 */
export function calculateCurrentStreak(completions: Date[]): number {
  if (completions.length === 0) return 0

  // Sort dates in descending order (most recent first)
  const sortedDates = completions
    .map((date) => new Date(date))
    .sort((a, b) => b.getTime() - a.getTime())

  // Get today's date at midnight (UTC)
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  // Check if today is completed
  const mostRecentDate = new Date(sortedDates[0])
  mostRecentDate.setUTCHours(0, 0, 0, 0)

  if (mostRecentDate.getTime() !== today.getTime()) {
    return 0 // Today is not completed, streak is 0
  }

  let streak = 1
  let expectedDate = new Date(today)

  for (let i = 1; i < sortedDates.length; i++) {
    const currentDate = new Date(sortedDates[i])
    currentDate.setUTCHours(0, 0, 0, 0)

    // Calculate expected previous date (one day before)
    expectedDate.setUTCDate(expectedDate.getUTCDate() - 1)

    if (currentDate.getTime() === expectedDate.getTime()) {
      streak++
    } else {
      break // Gap found, stop counting
    }
  }

  return streak
}

/**
 * Calculates the longest streak of consecutive days in entire history
 * @param completions Array of completion dates
 * @returns Number of consecutive days in longest streak
 */
export function calculateLongestStreak(completions: Date[]): number {
  if (completions.length === 0) return 0

  // Sort dates in ascending order
  const sortedDates = completions
    .map((date) => {
      const d = new Date(date)
      d.setUTCHours(0, 0, 0, 0)
      return d.getTime()
    })
    .sort((a, b) => a - b)

  // Remove duplicates (same day multiple times)
  const uniqueDates = [...new Set(sortedDates)]

  let longestStreak = 1
  let currentStreak = 1

  for (let i = 1; i < uniqueDates.length; i++) {
    const dayDiff =
      (uniqueDates[i] - uniqueDates[i - 1]) / (1000 * 60 * 60 * 24)

    if (dayDiff === 1) {
      currentStreak++
      longestStreak = Math.max(longestStreak, currentStreak)
    } else {
      currentStreak = 1
    }
  }

  return longestStreak
}

