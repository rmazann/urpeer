import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
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
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <Link
        href="/changelog"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Changelog
      </Link>

      <ChangelogEntry entry={entry} showFullContent />
    </div>
  )
}
