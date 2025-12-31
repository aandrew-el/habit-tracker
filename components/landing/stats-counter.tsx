'use client'

import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion'
import { useRef, useEffect } from 'react'

interface AnimatedCounterProps {
  value: number
  suffix?: string
  duration?: number
}

function AnimatedCounter({ value, suffix = '', duration = 2 }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })
  const count = useMotionValue(0)
  const rounded = useTransform(count, (latest) => Math.floor(latest).toLocaleString())

  useEffect(() => {
    if (isInView) {
      // Use animate with easeOut - goes up smoothly, no overshoot
      const controls = animate(count, value, {
        duration: duration,
        ease: 'easeOut',
      })
      return controls.stop
    }
  }, [isInView, count, value, duration])

  return (
    <span ref={ref}>
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  )
}

export function StatsCounter() {
  const stats = [
    { value: 500, suffix: '+', label: 'Habits Created' },
    { value: 10000, suffix: '+', label: 'Completions' },
    { value: 98, suffix: '%', label: 'Satisfaction' },
  ]

  return (
    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-8 pt-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
        >
          <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            <AnimatedCounter value={stat.value} suffix={stat.suffix} />
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {stat.label}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export function GitHubStars() {
  return (
    <motion.a
      href="https://github.com/aandrew-el/habit-tracker"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium hover:scale-105 transition-transform"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
      </svg>
      <span>Star on GitHub</span>
      <span className="px-1.5 py-0.5 bg-white/20 dark:bg-gray-900/20 rounded text-xs">
        ⭐
      </span>
    </motion.a>
  )
}
