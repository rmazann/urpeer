import type { ChangelogEntryWithDetails } from '@/lib/supabase/types'
import { ChangelogEntry } from './ChangelogEntry'

type ChangelogListProps = {
  entries: ChangelogEntryWithDetails[]
}

export const ChangelogList = ({ entries }: ChangelogListProps) => {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">No changelog entries yet.</p>
        <p className="text-muted-foreground text-sm mt-1">
          Check back later for product updates!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {entries.map((entry) => (
        <ChangelogEntry key={entry.id} entry={entry} />
      ))}
    </div>
  )
}
