import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { getFeedback, type FeedbackFilters } from '@/features/feedback/actions/get-feedback'
import {
  FeedbackList,
  FeedbackFilters as FeedbackFiltersComponent,
  FeedbackListSkeleton,
  NewFeedbackDialog,
} from '@/features/feedback/components'

type FeedbackPageProps = {
  searchParams: Promise<{
    status?: string
    category?: string
    sortBy?: 'votes' | 'recent'
  }>
}

const FeedbackContent = async ({ filters }: { filters: FeedbackFilters }) => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const feedbackItems = await getFeedback(filters)

  return <FeedbackList feedbackItems={feedbackItems} isAuthenticated={!!user} />
}

export default async function FeedbackPage({ searchParams }: FeedbackPageProps) {
  const params = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const filters: FeedbackFilters = {
    status: params.status,
    category: params.category,
    sortBy: params.sortBy,
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Feedback Board</h1>
          <p className="mt-1 text-muted-foreground">
            Share your ideas, vote on features, and help shape our product.
          </p>
        </div>
        <NewFeedbackDialog isAuthenticated={!!user} />
      </div>

      <div className="mb-6">
        <Suspense fallback={null}>
          <FeedbackFiltersComponent />
        </Suspense>
      </div>

      <Suspense fallback={<FeedbackListSkeleton />}>
        <FeedbackContent filters={filters} />
      </Suspense>
    </div>
  )
}
