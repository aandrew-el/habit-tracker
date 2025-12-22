'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { habitTemplates, categories, type HabitTemplate } from '@/lib/habit-templates'

interface HabitTemplatesDialogProps {
  isOpen: boolean
  onClose: () => void
  onSelectTemplate: (template: HabitTemplate) => void
}

export function HabitTemplatesDialog({ isOpen, onClose, onSelectTemplate }: HabitTemplatesDialogProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const filteredTemplates = habitTemplates.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleSelectTemplate = (template: HabitTemplate) => {
    onSelectTemplate(template)
    onClose()
    setSearchQuery('')
    setSelectedCategory('all')
  }

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
              className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-2xl"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 z-10 border-b-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg shadow-purple-500/30">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Habit Templates
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Choose from {habitTemplates.length} pre-made habits
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"
                    aria-label="Close template browser"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                  <Input
                    type="text"
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 dark:focus:ring-purple-900"
                  />
                </div>

                {/* Category Tabs */}
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
                        selectedCategory === category.id
                          ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      <span>{category.emoji}</span>
                      <span>{category.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Templates Grid */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-240px)]">
                {filteredTemplates.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      No templates found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Try adjusting your search or category filter
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredTemplates.map((template, index) => (
                      <motion.div
                        key={template.id}
                        className="group relative rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-5 hover:shadow-xl hover:border-purple-300 dark:hover:border-purple-700 transition-all cursor-pointer"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleSelectTemplate(template)}
                        whileHover={{ y: -4, scale: 1.02 }}
                      >
                        {/* Emoji Badge */}
                        <div className="text-4xl mb-3">{template.emoji}</div>

                        {/* Content */}
                        <div className="mb-4">
                          <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1 line-clamp-1">
                            {template.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                            {template.description}
                          </p>

                          {/* Frequency Badge */}
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold">
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                            {template.frequency === 'daily' ? 'Daily' : 'Weekly'}
                          </div>
                        </div>

                        {/* Use Template Button - Shows on Hover */}
                        <Button
                          className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSelectTemplate(template)
                          }}
                        >
                          Use Template
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 border-t-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
                <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                  Showing {filteredTemplates.length} of {habitTemplates.length} templates
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
