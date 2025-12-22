'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex gap-2">
        <Button variant="outline" className="flex-1 rounded-xl border-2" disabled>
          <Sun className="h-4 w-4 mr-2" />
          Light
        </Button>
        <Button variant="outline" className="flex-1 rounded-xl border-2" disabled>
          <Moon className="h-4 w-4 mr-2" />
          Dark
        </Button>
      </div>
    )
  }

  return (
    <div className="flex gap-2">
      <Button
        variant={theme === 'light' ? 'default' : 'outline'}
        className={`flex-1 rounded-xl border-2 font-semibold transition-all ${
          theme === 'light'
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30'
            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
        onClick={() => setTheme('light')}
      >
        <Sun className="h-4 w-4 mr-2" />
        Light
      </Button>
      <Button
        variant={theme === 'dark' ? 'default' : 'outline'}
        className={`flex-1 rounded-xl border-2 font-semibold transition-all ${
          theme === 'dark'
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30'
            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
        onClick={() => setTheme('dark')}
      >
        <Moon className="h-4 w-4 mr-2" />
        Dark
      </Button>
    </div>
  )
}

