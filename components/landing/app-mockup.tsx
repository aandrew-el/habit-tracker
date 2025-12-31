'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import Image from 'next/image'

interface AppMockupProps {
  imageSrc?: string
}

export function AppMockup({ imageSrc = '/app-preview.png' }: AppMockupProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  })

  const y = useTransform(scrollYProgress, [0, 1], [0, -50])
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [10, 0, -5])

  return (
    <motion.div
      ref={ref}
      className="relative w-full max-w-2xl mx-auto"
      style={{ y, rotateX, perspective: 1000 }}
      initial={{ opacity: 0, y: 60, rotateY: -10 }}
      animate={{ opacity: 1, y: 0, rotateY: 0 }}
      transition={{
        duration: 0.8,
        delay: 0.4,
        type: 'spring',
        stiffness: 100,
        damping: 20
      }}
    >
      {/* Glow effect behind the mockup */}
      <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 rounded-3xl blur-2xl opacity-60" />

      {/* Browser frame */}
      <div className="relative bg-gray-900 rounded-xl overflow-hidden shadow-2xl shadow-gray-900/50 border border-gray-700/50">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 px-4 py-3 bg-gray-800 border-b border-gray-700/50">
          {/* Traffic light buttons */}
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>

          {/* URL bar */}
          <div className="flex-1 mx-4">
            <div className="flex items-center gap-2 bg-gray-900/80 rounded-md px-3 py-1.5 text-sm">
              <svg className="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-400 truncate">habitflow.app/dashboard</span>
            </div>
          </div>

          {/* Window controls placeholder */}
          <div className="flex gap-3 text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
          </div>
        </div>

        {/* App content area */}
        <div className="relative aspect-[16/10] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
          {/* Simplified dashboard preview */}
          <DashboardPreview />
        </div>
      </div>

      {/* Reflection effect */}
      <div className="absolute -bottom-12 left-4 right-4 h-24 bg-gradient-to-b from-gray-900/20 to-transparent blur-sm rounded-xl transform scale-y-[-1] opacity-30" />
    </motion.div>
  )
}

// Simplified dashboard preview component
function DashboardPreview() {
  const habits = [
    { name: 'Morning Meditation', streak: 12, color: 'from-violet-500 to-purple-600', completed: true },
    { name: 'Read 30 minutes', streak: 8, color: 'from-blue-500 to-cyan-500', completed: true },
    { name: 'Exercise', streak: 5, color: 'from-orange-500 to-red-500', completed: false },
  ]

  return (
    <div className="p-4 sm:p-6 h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5 sm:mb-1">Tuesday, December 31</div>
          <div className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Today&apos;s Habits</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-2 sm:px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-medium rounded-full flex items-center gap-1">
            <span className="text-yellow-300">🔥</span> 12 day streak
          </div>
        </div>
      </div>

      {/* Habits list */}
      <div className="space-y-2 sm:space-y-3">
        {habits.map((habit, i) => (
          <motion.div
            key={habit.name}
            className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + i * 0.1 }}
          >
            {/* Checkbox */}
            <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
              habit.completed
                ? `bg-gradient-to-r ${habit.color} text-white`
                : 'border-2 border-gray-300 dark:border-gray-600'
            }`}>
              {habit.completed && (
                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>

            {/* Habit info */}
            <div className="flex-1 min-w-0">
              <div className={`text-sm font-medium ${
                habit.completed
                  ? 'text-gray-400 dark:text-gray-500 line-through'
                  : 'text-gray-900 dark:text-white'
              }`}>
                {habit.name}
              </div>
            </div>

            {/* Streak badge */}
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <span>🔥</span>
              <span>{habit.streak}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Progress bar at bottom */}
      <div className="mt-4 sm:mt-6">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
          <span>Today&apos;s progress</span>
          <span>2/3 completed</span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: '67%' }}
            transition={{ delay: 1, duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>
    </div>
  )
}
