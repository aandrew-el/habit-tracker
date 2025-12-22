import { Heart, Briefcase, User, DollarSign, GraduationCap, Users } from 'lucide-react'

export const CATEGORIES = [
  {
    value: 'Health',
    label: 'Health',
    icon: Heart,
    color: 'green',
    bgClass: 'bg-green-100 dark:bg-green-900/30',
    textClass: 'text-green-700 dark:text-green-400',
    borderClass: 'border-green-300 dark:border-green-700',
  },
  {
    value: 'Work',
    label: 'Work',
    icon: Briefcase,
    color: 'blue',
    bgClass: 'bg-blue-100 dark:bg-blue-900/30',
    textClass: 'text-blue-700 dark:text-blue-400',
    borderClass: 'border-blue-300 dark:border-blue-700',
  },
  {
    value: 'Personal',
    label: 'Personal',
    icon: User,
    color: 'purple',
    bgClass: 'bg-purple-100 dark:bg-purple-900/30',
    textClass: 'text-purple-700 dark:text-purple-400',
    borderClass: 'border-purple-300 dark:border-purple-700',
  },
  {
    value: 'Finance',
    label: 'Finance',
    icon: DollarSign,
    color: 'yellow',
    bgClass: 'bg-yellow-100 dark:bg-yellow-900/30',
    textClass: 'text-yellow-700 dark:text-yellow-400',
    borderClass: 'border-yellow-300 dark:border-yellow-700',
  },
  {
    value: 'Learning',
    label: 'Learning',
    icon: GraduationCap,
    color: 'orange',
    bgClass: 'bg-orange-100 dark:bg-orange-900/30',
    textClass: 'text-orange-700 dark:text-orange-400',
    borderClass: 'border-orange-300 dark:border-orange-700',
  },
  {
    value: 'Social',
    label: 'Social',
    icon: Users,
    color: 'pink',
    bgClass: 'bg-pink-100 dark:bg-pink-900/30',
    textClass: 'text-pink-700 dark:text-pink-400',
    borderClass: 'border-pink-300 dark:border-pink-700',
  },
] as const

export type CategoryValue = typeof CATEGORIES[number]['value']

export function getCategoryConfig(category: string) {
  return CATEGORIES.find(c => c.value === category) || CATEGORIES[2] // Default to Personal
}

