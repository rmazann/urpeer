import { notFound } from 'next/navigation'
import { getChangelogEntryById } from '@/features/changelog/actions/get-changelog'
import { ChangelogEntry } from '@/features/changelog/components'

type ChangelogDetailPageProps = {
  params: Promise<{ id: string }>
}

export default async function ChangelogDetailPage({ params }: ChangelogDetailPageProps) {
  const { id } = await params
  const entry = await getChangelogEntryById(id)

  if (!entry || !entry.published) {
    notFound()
  }

  return (
    <div className="max-w-3xl">
      <ChangelogEntry entry={entry} showFullContent />
    </div>
  )
}
