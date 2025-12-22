export function AnalyticsSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-9 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        <div className="h-5 w-64 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
            <div className="space-y-3">
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Chart 1 */}
        <div className="rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
          <div className="space-y-4">
            <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-xl" />
          </div>
        </div>

        {/* Chart 2 */}
        <div className="rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
          <div className="space-y-4">
            <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Large Chart */}
      <div className="rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
        <div className="space-y-4">
          <div className="h-6 w-56 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-80 bg-gray-100 dark:bg-gray-700 rounded-xl" />
        </div>
      </div>
    </div>
  )
}
