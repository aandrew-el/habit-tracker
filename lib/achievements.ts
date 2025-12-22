export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  category: 'streak' | 'consistency' | 'milestone' | 'special'
  requirement: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

export const ACHIEVEMENTS: Achievement[] = [
  // Streak Achievements
  {
    id: 'first-step',
    title: 'First Step',
    description: 'Complete your first habit',
    icon: '👣',
    category: 'streak',
    requirement: 1,
    rarity: 'common',
  },
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Achieve a 3-day streak',
    icon: '🌱',
    category: 'streak',
    requirement: 3,
    rarity: 'common',
  },
  {
    id: 'week-warrior',
    title: 'Week Warrior',
    description: 'Achieve a 7-day streak',
    icon: '⚡',
    category: 'streak',
    requirement: 7,
    rarity: 'common',
  },
  {
    id: 'fortnight-force',
    title: 'Fortnight Force',
    description: 'Achieve a 14-day streak',
    icon: '💫',
    category: 'streak',
    requirement: 14,
    rarity: 'rare',
  },
  {
    id: 'month-master',
    title: 'Month Master',
    description: 'Achieve a 30-day streak',
    icon: '🔥',
    category: 'streak',
    requirement: 30,
    rarity: 'rare',
  },
  {
    id: 'quarter-champion',
    title: 'Quarter Champion',
    description: 'Achieve a 90-day streak',
    icon: '💎',
    category: 'streak',
    requirement: 90,
    rarity: 'epic',
  },
  {
    id: 'century-club',
    title: 'Century Club',
    description: 'Achieve a 100-day streak',
    icon: '💯',
    category: 'streak',
    requirement: 100,
    rarity: 'epic',
  },
  {
    id: 'half-year-hero',
    title: 'Half-Year Hero',
    description: 'Achieve a 180-day streak',
    icon: '🌟',
    category: 'streak',
    requirement: 180,
    rarity: 'legendary',
  },
  {
    id: 'year-legend',
    title: 'Year Legend',
    description: 'Achieve a 365-day streak',
    icon: '🏆',
    category: 'streak',
    requirement: 365,
    rarity: 'legendary',
  },

  // Consistency Achievements
  {
    id: 'daily-dedication',
    title: 'Daily Dedication',
    description: 'Complete all daily habits for 7 days',
    icon: '📅',
    category: 'consistency',
    requirement: 7,
    rarity: 'common',
  },
  {
    id: 'perfect-month',
    title: 'Perfect Month',
    description: 'Complete all daily habits for 30 days',
    icon: '🎯',
    category: 'consistency',
    requirement: 30,
    rarity: 'epic',
  },
  {
    id: 'no-excuses',
    title: 'No Excuses',
    description: 'Complete all habits (daily & weekly) for 7 days',
    icon: '💪',
    category: 'consistency',
    requirement: 7,
    rarity: 'rare',
  },

  // Milestone Achievements
  {
    id: 'habit-collector',
    title: 'Habit Collector',
    description: 'Create 5 habits',
    icon: '📝',
    category: 'milestone',
    requirement: 5,
    rarity: 'common',
  },
  {
    id: 'habit-enthusiast',
    title: 'Habit Enthusiast',
    description: 'Create 10 habits',
    icon: '📚',
    category: 'milestone',
    requirement: 10,
    rarity: 'rare',
  },
  {
    id: 'completion-streak',
    title: 'Completion Streak',
    description: 'Complete 50 total habits',
    icon: '✅',
    category: 'milestone',
    requirement: 50,
    rarity: 'rare',
  },
  {
    id: 'century-completions',
    title: 'Century Completions',
    description: 'Complete 100 total habits',
    icon: '💯',
    category: 'milestone',
    requirement: 100,
    rarity: 'epic',
  },
  {
    id: 'productivity-machine',
    title: 'Productivity Machine',
    description: 'Complete 500 total habits',
    icon: '🚀',
    category: 'milestone',
    requirement: 500,
    rarity: 'legendary',
  },

  // Special Achievements
  {
    id: 'early-bird',
    title: 'Early Bird',
    description: 'Complete a habit before 6 AM',
    icon: '🌅',
    category: 'special',
    requirement: 1,
    rarity: 'rare',
  },
  {
    id: 'night-owl',
    title: 'Night Owl',
    description: 'Complete a habit after 10 PM',
    icon: '🦉',
    category: 'special',
    requirement: 1,
    rarity: 'rare',
  },
  {
    id: 'multi-category',
    title: 'Well-Rounded',
    description: 'Have active habits in 4+ categories',
    icon: '🌈',
    category: 'special',
    requirement: 4,
    rarity: 'epic',
  },
  {
    id: 'comeback-kid',
    title: 'Comeback Kid',
    description: 'Restart a habit after missing 3+ days',
    icon: '🔄',
    category: 'special',
    requirement: 1,
    rarity: 'rare',
  },
]

export const RARITY_CONFIG = {
  common: {
    bg: 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800',
    border: 'border-gray-300 dark:border-gray-600',
    text: 'text-gray-900 dark:text-gray-100',
    glow: 'shadow-gray-500/20',
  },
  rare: {
    bg: 'bg-gradient-to-br from-blue-100 to-cyan-200 dark:from-blue-900/40 dark:to-cyan-900/40',
    border: 'border-blue-400 dark:border-blue-600',
    text: 'text-blue-900 dark:text-blue-100',
    glow: 'shadow-blue-500/30',
  },
  epic: {
    bg: 'bg-gradient-to-br from-purple-100 to-pink-200 dark:from-purple-900/40 dark:to-pink-900/40',
    border: 'border-purple-400 dark:border-purple-600',
    text: 'text-purple-900 dark:text-purple-100',
    glow: 'shadow-purple-500/40',
  },
  legendary: {
    bg: 'bg-gradient-to-br from-amber-100 via-yellow-200 to-orange-200 dark:from-amber-900/40 dark:via-yellow-900/40 dark:to-orange-900/40',
    border: 'border-amber-400 dark:border-amber-600',
    text: 'text-amber-900 dark:text-amber-100',
    glow: 'shadow-amber-500/50',
  },
}

export interface AchievementProgress {
  achievement: Achievement
  isUnlocked: boolean
  currentProgress: number
  progressPercentage: number
}

// Helper function to check if Early Bird achievement has been unlocked
export function checkEarlyBird(completions: Array<{ completed_at: string }>): boolean {
  return completions.some((completion) => {
    const date = new Date(completion.completed_at)
    const hour = date.getHours()
    return hour < 6 // Before 6 AM
  })
}

// Helper function to check if Night Owl achievement has been unlocked
export function checkNightOwl(completions: Array<{ completed_at: string }>): boolean {
  return completions.some((completion) => {
    const date = new Date(completion.completed_at)
    const hour = date.getHours()
    return hour >= 22 // After 10 PM
  })
}

// Helper function to check if Comeback Kid achievement has been unlocked
export function checkComebackKid(completions: Array<{ completed_at: string }>): boolean {
  if (completions.length < 2) return false

  // Sort completions by date
  const sortedDates = completions
    .map((c) => new Date(c.completed_at).toISOString().split('T')[0])
    .sort()

  // Check for a gap of 3+ days followed by a resumption
  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i - 1])
    const currentDate = new Date(sortedDates[i])
    const daysDiff = Math.floor(
      (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    // If there's a gap of 3+ days, that's a comeback
    if (daysDiff >= 3) {
      return true
    }
  }

  return false
}

export function checkAchievements(stats: {
  maxStreak: number
  totalCompletions: number
  habitCount: number
  categoryCount: number
  hasEarlyBird?: boolean
  hasNightOwl?: boolean
  hasComebackKid?: boolean
}): Achievement[] {
  const unlockedAchievements: Achievement[] = []

  ACHIEVEMENTS.forEach((achievement) => {
    let isUnlocked = false

    switch (achievement.category) {
      case 'streak':
        isUnlocked = stats.maxStreak >= achievement.requirement
        break
      case 'milestone':
        if (achievement.id === 'habit-collector' || achievement.id === 'habit-enthusiast') {
          isUnlocked = stats.habitCount >= achievement.requirement
        } else {
          isUnlocked = stats.totalCompletions >= achievement.requirement
        }
        break
      case 'special':
        if (achievement.id === 'multi-category') {
          isUnlocked = stats.categoryCount >= achievement.requirement
        } else if (achievement.id === 'early-bird') {
          isUnlocked = stats.hasEarlyBird || false
        } else if (achievement.id === 'night-owl') {
          isUnlocked = stats.hasNightOwl || false
        } else if (achievement.id === 'comeback-kid') {
          isUnlocked = stats.hasComebackKid || false
        }
        break
      case 'consistency':
        // Would need specific tracking for perfect days
        break
    }

    if (isUnlocked) {
      unlockedAchievements.push(achievement)
    }
  })

  return unlockedAchievements
}

export function getAchievementProgress(stats: {
  maxStreak: number
  totalCompletions: number
  habitCount: number
  categoryCount: number
  hasEarlyBird?: boolean
  hasNightOwl?: boolean
  hasComebackKid?: boolean
}): AchievementProgress[] {
  return ACHIEVEMENTS.map((achievement) => {
    let currentProgress = 0
    let isUnlocked = false

    switch (achievement.category) {
      case 'streak':
        currentProgress = stats.maxStreak
        isUnlocked = stats.maxStreak >= achievement.requirement
        break
      case 'milestone':
        if (achievement.id === 'habit-collector' || achievement.id === 'habit-enthusiast') {
          currentProgress = stats.habitCount
          isUnlocked = stats.habitCount >= achievement.requirement
        } else {
          currentProgress = stats.totalCompletions
          isUnlocked = stats.totalCompletions >= achievement.requirement
        }
        break
      case 'special':
        if (achievement.id === 'multi-category') {
          currentProgress = stats.categoryCount
          isUnlocked = stats.categoryCount >= achievement.requirement
        } else if (achievement.id === 'early-bird') {
          currentProgress = stats.hasEarlyBird ? 1 : 0
          isUnlocked = stats.hasEarlyBird || false
        } else if (achievement.id === 'night-owl') {
          currentProgress = stats.hasNightOwl ? 1 : 0
          isUnlocked = stats.hasNightOwl || false
        } else if (achievement.id === 'comeback-kid') {
          currentProgress = stats.hasComebackKid ? 1 : 0
          isUnlocked = stats.hasComebackKid || false
        }
        break
      case 'consistency':
        // Would need specific tracking for perfect days
        break
    }

    const progressPercentage = Math.min(
      100,
      Math.round((currentProgress / achievement.requirement) * 100)
    )

    return {
      achievement,
      isUnlocked,
      currentProgress,
      progressPercentage,
    }
  })
}
