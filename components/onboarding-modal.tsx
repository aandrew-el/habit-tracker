'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Target, CheckCircle2, BarChart3, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import confetti from 'canvas-confetti'

interface OnboardingModalProps {
  isOpen: boolean
  onClose: () => void
}

const steps = [
  {
    id: 1,
    title: "Welcome to HabitFlow! 👋",
    message: "Let's get you started with building better habits. This quick tour will show you around.",
    icon: Sparkles,
    iconGradient: "from-yellow-500 to-orange-600",
    showNext: false,
    showSkip: false,
  },
  {
    id: 2,
    title: "Add Your First Habit",
    message: "Click the 'Add Habit' button to create a habit you want to track. Give it a name, description, and choose how often you want to do it.",
    icon: Target,
    iconGradient: "from-blue-500 to-indigo-600",
    showNext: true,
    showSkip: true,
  },
  {
    id: 3,
    title: "Check Off Your Habits",
    message: "Complete a habit each day by clicking 'Check off today'. Build streaks and stay motivated!",
    icon: CheckCircle2,
    iconGradient: "from-green-500 to-emerald-600",
    showNext: true,
    showSkip: true,
  },
  {
    id: 4,
    title: "Track Your Progress",
    message: "Check the Analytics and Calendar pages to see your stats, streaks, and completion history!",
    icon: BarChart3,
    iconGradient: "from-purple-500 to-pink-600",
    showNext: false,
    showSkip: false,
  },
]

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleSkip = () => {
    onClose()
  }

  const handleComplete = () => {
    // Celebration confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#3b82f6', '#6366f1', '#8b5cf6', '#06b6d4'],
    })
    onClose()
  }

  const step = steps[currentStep]
  const Icon = step.icon

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={handleSkip}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative w-full max-w-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl shadow-2xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Skip button */}
          {(step.showSkip || currentStep === 0) && (
            <button
              onClick={handleSkip}
              className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Skip tour"
            >
              <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
          )}

          {/* Content */}
          <div className="p-8 sm:p-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="space-y-6"
              >
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="flex justify-center"
                >
                  <div className={`flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${step.iconGradient} shadow-lg`}>
                    <Icon className="h-10 w-10 text-white" />
                  </div>
                </motion.div>

                {/* Title */}
                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl font-bold text-center bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent"
                >
                  {step.title}
                </motion.h2>

                {/* Message */}
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-lg text-center text-gray-600 dark:text-gray-400 leading-relaxed"
                >
                  {step.message}
                </motion.p>

                {/* Buttons */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-col sm:flex-row gap-3 pt-4"
                >
                  {currentStep === 0 && (
                    <Button
                      onClick={handleNext}
                      className="w-full h-14 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-lg text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 transition-all"
                    >
                      Get Started
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  )}

                  {step.showNext && (
                    <>
                      {step.showSkip && (
                        <Button
                          onClick={handleSkip}
                          variant="outline"
                          className="w-full sm:w-auto h-12 rounded-xl border-2 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          Skip Tour
                        </Button>
                      )}
                      <Button
                        onClick={handleNext}
                        className="flex-1 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 transition-all"
                      >
                        Next
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </>
                  )}

                  {currentStep === steps.length - 1 && (
                    <Button
                      onClick={handleComplete}
                      className="w-full h-14 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-lg text-white font-semibold shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 hover:scale-105 transition-all"
                    >
                      Get Started! 🎉
                    </Button>
                  )}
                </motion.div>
              </motion.div>
            </AnimatePresence>

            {/* Progress Dots */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center justify-center gap-2 mt-8"
            >
              {steps.map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentStep
                      ? 'w-8 bg-gradient-to-r from-blue-600 to-indigo-600'
                      : 'w-2 bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </motion.div>

            {/* Step Counter */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-center text-sm text-gray-500 dark:text-gray-500 mt-4 font-medium"
            >
              {currentStep + 1} / {steps.length}
            </motion.p>
          </div>

          {/* Decorative gradient overlay */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

