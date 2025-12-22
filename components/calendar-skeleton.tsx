export function CalendarSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-9 w-40 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        <div className="h-5 w-72 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      </div>

      {/* Month Navigation */}
      <div className="rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-xl" />
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        </div>
      </div>

      {/* Legend */}
      <div className="rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
        <div className="flex flex-wrap gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
        <div className="space-y-4">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-6 bg-gray-200 dark:bg-gray-700 rounded" />
            ))}
          </div>

          {/* Calendar Days */}
          {[...Array(5)].map((_, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-2">
              {[...Array(7)].map((_, dayIndex) => (
                <div
                  key={dayIndex}
                  className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-xl"
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
