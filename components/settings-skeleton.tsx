export function SettingsSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-9 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        <div className="h-5 w-80 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      </div>

      {/* Profile Section */}
      <div className="rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm space-y-6">
        <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="flex items-center gap-6">
          <div className="h-20 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
          <div className="space-y-3 flex-1">
            <div className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm space-y-6">
        <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
            <div className="h-10 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
          </div>
        ))}
      </div>

      {/* Data Management Section */}
      <div className="rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm space-y-6">
        <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
              <div className="space-y-2">
                <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-4 w-56 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
              <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-2xl border-2 border-red-200 dark:border-red-900/30 bg-white dark:bg-gray-800 p-6 shadow-sm space-y-4">
        <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded-xl" />
      </div>
    </div>
  )
}
