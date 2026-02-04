import { Suspense } from 'react'
import Link from 'next/link'
import { Rss } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getChangelogEntries } from '@/features/changelog/actions/get-changelog'
import {
  ChangelogList,
  ChangelogPagination,
  ChangelogListSkeleton,
} from '@/features/changelog/components'
import { PageHeader } from '@/components/layout/page-header'

type ChangelogPageProps = {
  searchParams: Promise<{
    page?: string
  }>
}

const PAGE_SIZE = 10

const ChangelogContent = async ({ page }: { page: number }) => {
  const { entries, totalCount, hasMore } = await getChangelogEntries(page, PAGE_SIZE)

  return (
    <>
      <ChangelogList entries={entries} />
      <Suspense fallback={null}>
        <ChangelogPagination
          currentPage={page}
          totalCount={totalCount}
          hasMore={hasMore}
          pageSize={PAGE_SIZE}
        />
      </Suspense>
    </>
  )
}

export default async function ChangelogPage({ searchParams }: ChangelogPageProps) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page || '1', 10))

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        title="Changelog"
        description="Stay up to date with the latest product updates."
        actions={
          <Link href="/api/changelog/rss" target="_blank">
            <Button variant="outline" size="sm">
              <Rss className="h-4 w-4 mr-2" />
              RSS Feed
            </Button>
          </Link>
        }
      />

      <Suspense fallback={<ChangelogListSkeleton />}>
        <ChangelogContent page={page} />
      </Suspense>
    </div>
  )
}
