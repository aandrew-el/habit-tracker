export function HabitCardSkeleton() {
  return (
    <div className="flex flex-col border-2 border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden animate-pulse">
      <div className="p-6 pb-3">
        <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-lg w-3/4 mb-2 animate-pulse" />
        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-1/4 animate-pulse" />
      </div>
      
      <div className="px-6 flex-1 space-y-4">
        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-full animate-pulse" />
        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-2/3 animate-pulse" />
        
        <div className="flex gap-2">
          <div className="h-12 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-xl flex-1 animate-pulse" />
          <div className="h-12 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-xl flex-1 animate-pulse" />
        </div>
      </div>
      
      <div className="p-6 pt-3 space-y-3">
        <div className="h-12 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-xl w-full animate-pulse" />
        <div className="flex gap-2">
          <div className="h-11 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-xl flex-1 animate-pulse" />
          <div className="h-11 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-xl flex-1 animate-pulse" />
        </div>
      </div>
    </div>
  )
}

export function CalendarSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-2">
        <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg w-32 animate-pulse" />
        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-48 animate-pulse" />
      </div>
      
      <div className="rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6 shadow-sm animate-pulse">
        <div className="flex items-center justify-between mb-6">
          <div className="h-11 w-11 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-xl" />
          <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg w-48" />
          <div className="h-11 w-11 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-xl" />
        </div>
        
        <div className="grid grid-cols-7 gap-3 mb-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded" />
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-3">
          {Array.from({ length: 35 }).map((_, i) => (
            <div 
              key={i} 
              className="aspect-square bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-xl"
              style={{ animationDelay: `${i * 20}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

