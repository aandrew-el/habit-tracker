'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { PlusCircle, CheckCircle, TrendingUp } from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: PlusCircle,
    title: 'Create your habits',
    description: 'Add the habits you want to build. Set custom schedules, colors, and reminders.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    number: '02',
    icon: CheckCircle,
    title: 'Track daily',
    description: 'Check off your habits each day. Build streaks and stay accountable.',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    number: '03',
    icon: TrendingUp,
    title: 'Watch yourself grow',
    description: 'See your progress with beautiful charts and AI-powered insights.',
    gradient: 'from-purple-500 to-pink-500',
  },
]

export function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section className="py-20 relative overflow-hidden" ref={ref}>
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-50/30 to-transparent dark:via-blue-900/10" />

      <div className="container mx-auto px-4 relative">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent leading-tight py-1">
            How it works
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Building better habits has never been easier
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 max-w-5xl mx-auto relative">
          {/* Connecting line (desktop only) */}
          <div className="hidden md:block absolute top-24 left-[16.67%] right-[16.67%] h-0.5 bg-gradient-to-r from-blue-500 via-green-500 to-purple-500 opacity-20" />

          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              className="relative text-center"
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              {/* Step number */}
              <motion.div
                className="text-7xl font-bold text-gray-100 dark:text-gray-800 absolute -top-4 left-1/2 -translate-x-1/2 select-none"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: index * 0.2 + 0.1 }}
              >
                {step.number}
              </motion.div>

              {/* Icon */}
              <motion.div
                className={`relative z-10 mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br ${step.gradient} shadow-lg flex items-center justify-center mb-6`}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <step.icon className="h-10 w-10 text-white" />
              </motion.div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {step.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {step.description}
              </p>

              {/* Arrow (mobile only, between steps) */}
              {index < steps.length - 1 && (
                <div className="md:hidden flex justify-center my-6">
                  <svg className="w-6 h-6 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
