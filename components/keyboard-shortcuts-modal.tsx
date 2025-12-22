'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface KeyboardShortcutsModalProps {
  isOpen: boolean
  onClose: () => void
}

interface Shortcut {
  keys: string[]
  description: string
  category: string
}

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  const shortcuts: Shortcut[] = [
    // Navigation
    { keys: ['1'], description: 'Go to Dashboard', category: 'Navigation' },
    { keys: ['2'], description: 'Go to Calendar', category: 'Navigation' },
    { keys: ['3'], description: 'Go to Analytics', category: 'Navigation' },
    { keys: ['4'], description: 'Go to Achievements', category: 'Navigation' },
    { keys: ['5'], description: 'Go to Settings', category: 'Navigation' },

    // Actions
    { keys: ['N'], description: 'Add new habit', category: 'Actions' },
    { keys: ['?'], description: 'Show keyboard shortcuts', category: 'Actions' },
    { keys: ['Esc'], description: 'Close dialog/modal', category: 'Actions' },

    // Calendar
    { keys: ['←'], description: 'Previous month', category: 'Calendar' },
    { keys: ['→'], description: 'Next month', category: 'Calendar' },
  ]

  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = []
    }
    acc[shortcut.category].push(shortcut)
    return acc
  }, {} as Record<string, Shortcut[]>)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className="relative w-full max-w-2xl rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-2xl"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b-2 border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg shadow-purple-500/30">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Keyboard Shortcuts
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Navigate faster with keyboard shortcuts
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label="Close keyboard shortcuts"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Shortcuts List */}
              <div className="max-h-[60vh] overflow-y-auto p-6">
                <div className="space-y-6">
                  {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
                    <div key={category}>
                      <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        {category}
                      </h3>
                      <div className="space-y-2">
                        {categoryShortcuts.map((shortcut, index) => (
                          <motion.div
                            key={index}
                            className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-4"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {shortcut.description}
                            </span>
                            <div className="flex gap-2">
                              {shortcut.keys.map((key, keyIndex) => (
                                <kbd
                                  key={keyIndex}
                                  className="min-w-[2rem] rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-center text-sm font-bold text-gray-900 dark:text-white shadow-sm"
                                >
                                  {key}
                                </kbd>
                              ))}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t-2 border-gray-200 dark:border-gray-700 p-6">
                <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                  Press <kbd className="rounded border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 text-xs font-bold">?</kbd> anytime to show this dialog
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
