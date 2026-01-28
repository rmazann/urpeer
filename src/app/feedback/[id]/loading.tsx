import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function FeedbackDetailLoading() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Skeleton className="h-5 w-32 mb-6" />

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start gap-4">
            <Skeleton className="h-16 w-[60px]" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-8 w-3/4" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
      </Card>

      <div className="mt-8">
        <Skeleton className="h-6 w-32 mb-4" />
        <Card>
          <CardContent className="py-8">
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
