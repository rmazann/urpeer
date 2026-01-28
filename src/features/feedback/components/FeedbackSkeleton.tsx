import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export const FeedbackSkeleton = () => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-4">
          <Skeleton className="h-16 w-[60px]" />
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <Skeleton className="h-6 w-3/4" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
              </div>
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export const FeedbackListSkeleton = () => {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <FeedbackSkeleton key={i} />
      ))}
    </div>
  )
}
