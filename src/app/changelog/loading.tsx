import { Skeleton } from '@/components/ui/skeleton'
import { ChangelogListSkeleton } from '@/features/changelog/components'

export default function ChangelogLoading() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-5 w-72" />
        </div>
        <Skeleton className="h-9 w-28" />
      </div>

      <ChangelogListSkeleton />
    </div>
  )
}
