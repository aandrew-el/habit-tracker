export interface HabitTemplate {
  id: string
  name: string
  description: string
  frequency: 'daily' | 'weekly'
  category: 'Health' | 'Work' | 'Personal' | 'Finance' | 'Learning' | 'Social'
  emoji: string
}

export const habitTemplates: HabitTemplate[] = [
  // Health
  {
    id: 'drink-water',
    name: 'Drink 8 glasses of water',
    description: 'Stay hydrated throughout the day for better health and energy',
    frequency: 'daily',
    category: 'Health',
    emoji: '💧',
  },
  {
    id: 'take-vitamins',
    name: 'Take daily vitamins',
    description: 'Remember to take your daily supplements',
    frequency: 'daily',
    category: 'Health',
    emoji: '💊',
  },
  {
    id: 'sleep-8-hours',
    name: 'Sleep 8 hours',
    description: 'Get a full night of quality sleep for recovery',
    frequency: 'daily',
    category: 'Health',
    emoji: '😴',
  },
  {
    id: 'healthy-breakfast',
    name: 'Eat a healthy breakfast',
    description: 'Start your day with a nutritious meal',
    frequency: 'daily',
    category: 'Health',
    emoji: '🥗',
  },
  {
    id: 'no-sugar',
    name: 'No added sugar',
    description: 'Avoid foods with added sugar for better health',
    frequency: 'daily',
    category: 'Health',
    emoji: '🍬',
  },

  // Fitness
  {
    id: 'morning-run',
    name: 'Go for a morning run',
    description: 'Start your day with a refreshing run',
    frequency: 'daily',
    category: 'Personal',
    emoji: '🏃',
  },
  {
    id: 'workout',
    name: 'Complete workout',
    description: 'Finish your planned workout session',
    frequency: 'daily',
    category: 'Personal',
    emoji: '💪',
  },
  {
    id: 'yoga',
    name: 'Practice yoga',
    description: 'Stretch and strengthen with yoga practice',
    frequency: 'daily',
    category: 'Personal',
    emoji: '🧘',
  },
  {
    id: 'walk-10k-steps',
    name: 'Walk 10,000 steps',
    description: 'Hit your daily step goal',
    frequency: 'daily',
    category: 'Personal',
    emoji: '👟',
  },
  {
    id: 'gym-session',
    name: 'Go to the gym',
    description: 'Complete your gym workout',
    frequency: 'weekly',
    category: 'Personal',
    emoji: '🏋️',
  },

  // Mindfulness
  {
    id: 'meditation',
    name: 'Meditate for 10 minutes',
    description: 'Practice mindfulness meditation',
    frequency: 'daily',
    category: 'Personal',
    emoji: '🧘‍♂️',
  },
  {
    id: 'gratitude-journal',
    name: 'Write in gratitude journal',
    description: 'List 3 things you\'re grateful for',
    frequency: 'daily',
    category: 'Personal',
    emoji: '🙏',
  },
  {
    id: 'deep-breathing',
    name: 'Practice deep breathing',
    description: '5 minutes of focused breathing exercises',
    frequency: 'daily',
    category: 'Personal',
    emoji: '🌬️',
  },
  {
    id: 'no-phone-morning',
    name: 'No phone for first hour',
    description: 'Start your day without screen time',
    frequency: 'daily',
    category: 'Personal',
    emoji: '📱',
  },
  {
    id: 'evening-reflection',
    name: 'Evening reflection',
    description: 'Reflect on your day before bed',
    frequency: 'daily',
    category: 'Personal',
    emoji: '🌙',
  },

  // Productivity
  {
    id: 'make-bed',
    name: 'Make your bed',
    description: 'Start your day with a completed task',
    frequency: 'daily',
    category: 'Work',
    emoji: '🛏️',
  },
  {
    id: 'plan-tomorrow',
    name: 'Plan tomorrow',
    description: 'Set up your tasks for the next day',
    frequency: 'daily',
    category: 'Work',
    emoji: '📝',
  },
  {
    id: 'deep-work',
    name: '2 hours of deep work',
    description: 'Focused work without distractions',
    frequency: 'daily',
    category: 'Work',
    emoji: '🎯',
  },
  {
    id: 'inbox-zero',
    name: 'Reach inbox zero',
    description: 'Process all emails to zero',
    frequency: 'daily',
    category: 'Work',
    emoji: '📧',
  },
  {
    id: 'review-goals',
    name: 'Review weekly goals',
    description: 'Check progress on your weekly objectives',
    frequency: 'weekly',
    category: 'Work',
    emoji: '🎯',
  },

  // Learning
  {
    id: 'read-30-min',
    name: 'Read for 30 minutes',
    description: 'Dedicate time to reading',
    frequency: 'daily',
    category: 'Learning',
    emoji: '📚',
  },
  {
    id: 'learn-language',
    name: 'Practice language learning',
    description: 'Study your target language',
    frequency: 'daily',
    category: 'Learning',
    emoji: '🗣️',
  },
  {
    id: 'code-practice',
    name: 'Code for 1 hour',
    description: 'Practice coding or work on projects',
    frequency: 'daily',
    category: 'Learning',
    emoji: '💻',
  },
  {
    id: 'podcast',
    name: 'Listen to educational podcast',
    description: 'Learn while commuting or exercising',
    frequency: 'daily',
    category: 'Learning',
    emoji: '🎧',
  },
  {
    id: 'online-course',
    name: 'Complete course module',
    description: 'Make progress on your online course',
    frequency: 'weekly',
    category: 'Learning',
    emoji: '🎓',
  },

  // Social
  {
    id: 'call-friend',
    name: 'Call a friend or family',
    description: 'Stay connected with loved ones',
    frequency: 'weekly',
    category: 'Social',
    emoji: '📞',
  },
  {
    id: 'compliment-someone',
    name: 'Give a genuine compliment',
    description: 'Brighten someone\'s day',
    frequency: 'daily',
    category: 'Social',
    emoji: '💝',
  },
  {
    id: 'quality-time',
    name: 'Quality time with partner',
    description: 'Dedicated time together without phones',
    frequency: 'daily',
    category: 'Social',
    emoji: '❤️',
  },
  {
    id: 'reach-out',
    name: 'Reach out to someone new',
    description: 'Make a new connection or networking effort',
    frequency: 'weekly',
    category: 'Social',
    emoji: '🤝',
  },
  {
    id: 'volunteer',
    name: 'Volunteer or help others',
    description: 'Give back to your community',
    frequency: 'weekly',
    category: 'Social',
    emoji: '🌟',
  },
]

export const categories = [
  { id: 'all', name: 'All Templates', emoji: '✨' },
  { id: 'Health', name: 'Health', emoji: '💧' },
  { id: 'Personal', name: 'Personal', emoji: '🧘' },
  { id: 'Work', name: 'Work', emoji: '🎯' },
  { id: 'Learning', name: 'Learning', emoji: '📚' },
  { id: 'Social', name: 'Social', emoji: '❤️' },
] as const
