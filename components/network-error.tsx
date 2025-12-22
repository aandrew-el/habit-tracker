import { Button } from '@/components/ui/button'
import { WifiOff, RefreshCw } from 'lucide-react'

interface NetworkErrorProps {
  message?: string
  onRetry: () => void
}

export function NetworkError({ message, onRetry }: NetworkErrorProps) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-orange-200 dark:border-orange-900/30 p-8 text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
            <WifiOff className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Connection Error
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {message || "We couldn't load your data. Please check your connection and try again."}
          </p>
        </div>

        <Button
          onClick={onRetry}
          className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg w-full sm:w-auto"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    </div>
  )
}
