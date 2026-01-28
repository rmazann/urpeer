import { Suspense } from 'react'
import { getChangelogEntries } from '@/features/changelog/actions/get-changelog'
import { ChangelogManagementTable } from '@/features/admin/components/ChangelogManagementTable'
import { AddChangelogDialog } from '@/features/admin/components/AddChangelogDialog'
import { Skeleton } from '@/components/ui/skeleton'

const ChangelogTableContent = async () => {
  const { entries } = await getChangelogEntries(1, 50, true) // Include unpublished

  return <ChangelogManagementTable entries={entries} />
}

export default function AdminChangelogPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Changelog Management</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage product changelog entries.
          </p>
        </div>
        <AddChangelogDialog />
      </div>

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
