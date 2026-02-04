import { Suspense } from 'react'
import { getChangelogEntries } from '@/features/changelog/actions/get-changelog'
import { ChangelogManagementTable } from '@/features/admin/components/ChangelogManagementTable'
import { AddChangelogDialog } from '@/features/admin/components/AddChangelogDialog'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/layout/page-header'

const ChangelogTableContent = async () => {
  const { entries } = await getChangelogEntries(1, 50, true) // Include unpublished

  return <ChangelogManagementTable entries={entries} />
}

export default function AdminChangelogPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Changelog Management"
        description="Create and manage product changelog entries"
        actions={<AddChangelogDialog />}
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
        <ChangelogTableContent />
      </Suspense>
    </div>
  )
}
