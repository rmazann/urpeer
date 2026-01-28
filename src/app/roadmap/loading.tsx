import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

const ColumnSkeleton = () => (
  <div className="flex flex-col rounded-lg border border-t-4 border-t-gray-300 bg-muted/30 min-h-[400px]">
    <div className="p-4 border-b">
      <Skeleton className="h-6 w-24" />
    </div>
    <div className="flex-1 p-3 space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-5 w-3/4" />
          </CardHeader>
          <CardContent className="pt-0">
            <Skeleton className="h-4 w-full mb-2" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
)

export default function RoadmapLoading() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-80" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ColumnSkeleton />
        <ColumnSkeleton />
        <ColumnSkeleton />
      </div>
    </div>
  )
}
