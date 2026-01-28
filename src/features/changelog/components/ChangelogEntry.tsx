'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChangelogCategoryBadge } from './ChangelogCategoryBadge'
import type { ChangelogEntryWithDetails } from '@/lib/supabase/types'
import Link from 'next/link'
import { LinkIcon } from 'lucide-react'

type ChangelogEntryProps = {
  entry: ChangelogEntryWithDetails
  showFullContent?: boolean
}

export const ChangelogEntry = ({ entry, showFullContent = false }: ChangelogEntryProps) => {
  const publishedDate = entry.published_at
    ? format(new Date(entry.published_at), 'MMMM d, yyyy')
    : entry.created_at
      ? format(new Date(entry.created_at), 'MMMM d, yyyy')
      : 'Unknown date'

  const authorName = entry.profiles?.full_name || 'Team'
  const linkedFeedback = entry.changelog_feedback_links || []

  // Truncate content for preview
  const contentPreview = showFullContent
    ? entry.content
    : entry.content.length > 500
      ? entry.content.slice(0, 500) + '...'
      : entry.content

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <time dateTime={entry.published_at || entry.created_at || ''}>
                {publishedDate}
              </time>
              <span>·</span>
              <span>by {authorName}</span>
              {!entry.published && (
                <Badge variant="outline" className="text-xs">
                  Draft
                </Badge>
              )}
            </div>
            <CardTitle className="text-xl">{entry.title}</CardTitle>
          </div>
          <ChangelogCategoryBadge category={entry.category} />
        </div>
      </CardHeader>

      <CardContent>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{contentPreview}</ReactMarkdown>
        </div>

        {!showFullContent && entry.content.length > 500 && (
          <Link
            href={`/changelog/${entry.id}`}
            className="text-sm text-primary hover:underline mt-4 inline-block"
          >
            Read more →
          </Link>
        )}

        {linkedFeedback.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">Related feedback:</p>
            <div className="flex flex-wrap gap-2">
              {linkedFeedback.map((link) => (
                <Link
                  key={link.feedback.id}
                  href={`/feedback/${link.feedback.id}`}
                >
                  <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                    <LinkIcon className="h-3 w-3 mr-1" />
                    {link.feedback.title}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
