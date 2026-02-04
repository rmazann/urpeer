import { Skeleton } from '@/components/ui/skeleton'
import { FeedbackListSkeleton } from '@/features/feedback/components'

export default function FeedbackLoading() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-80" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>

      <div className="flex gap-3 mb-6">
        <Skeleton className="h-9 w-[160px]" />
        <Skeleton className="h-9 w-[160px]" />
        <Skeleton className="h-9 w-[160px]" />
      </div>

      <FeedbackListSkeleton />
    </div>
  )
}
