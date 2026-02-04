import { Suspense } from 'react'
import { getAdminFeedbackList } from '@/features/admin/actions/get-feedback-list'
import { FeedbackManagementTable } from '@/features/admin/components/FeedbackManagementTable'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/layout/page-header'

type AdminFeedbackPageProps = {
  searchParams: Promise<{
    status?: string
    category?: string
    search?: string
    page?: string
  }>
}

const FeedbackTableContent = async ({
  status,
  category,
  search,
  page,
}: {
  status?: string
  category?: string
  search?: string
  page: number
}) => {
  const { items } = await getAdminFeedbackList({
    status,
    category,
    search,
    page,
    limit: 20,
  })

  return <FeedbackManagementTable items={items} />
}

export default async function AdminFeedbackPage({ searchParams }: AdminFeedbackPageProps) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page || '1', 10))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Feedback Management"
        description="Manage and moderate user feedback submissions"
      />

      <Suspense
        fallback={
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        }
      >
        <FeedbackTableContent
          status={params.status}
          category={params.category}
          search={params.search}
          page={page}
        />
      </Suspense>
    </div>
  )
}
