import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { getFeedback, type FeedbackFilters } from '@/features/feedback/actions/get-feedback'
import {
  FeedbackList,
  FeedbackFilters as FeedbackFiltersComponent,
  FeedbackListSkeleton,
  NewFeedbackDialog,
} from '@/features/feedback/components'
import { PageHeader } from '@/components/layout/page-header'

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
    <div className="space-y-6">
      <PageHeader
        title="Feedback Board"
        description="Share your ideas, vote on features, and help shape our product."
        actions={<NewFeedbackDialog isAuthenticated={!!user} />}
      />

      <div>
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
