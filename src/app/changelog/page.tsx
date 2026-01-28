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
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Changelog</h1>
          <p className="mt-1 text-muted-foreground">
            Stay up to date with the latest product updates.
          </p>
        </div>
        <Link href="/api/changelog/rss" target="_blank">
          <Button variant="outline" size="sm">
            <Rss className="h-4 w-4 mr-2" />
            RSS Feed
          </Button>
        </Link>
      </div>

      <Suspense fallback={<ChangelogListSkeleton />}>
        <ChangelogContent page={page} />
      </Suspense>
    </div>
  )
}
