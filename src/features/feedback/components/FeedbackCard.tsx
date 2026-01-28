import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { FeedbackWithAuthor } from '@/lib/supabase/types'
import { VoteButton } from './VoteButton'
import { StatusBadge } from './StatusBadge'
import { CategoryBadge } from './CategoryBadge'
import { formatDistanceToNow } from 'date-fns'

type FeedbackCardProps = {
  feedback: FeedbackWithAuthor
  isAuthenticated: boolean
}

export const FeedbackCard = ({ feedback, isAuthenticated }: FeedbackCardProps) => {
  const authorName = feedback.profiles?.full_name || 'Anonymous'
  const timeAgo = feedback.created_at
    ? formatDistanceToNow(new Date(feedback.created_at), { addSuffix: true })
    : 'Unknown'

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <VoteButton
            feedbackId={feedback.id}
            initialVoteCount={feedback.vote_count ?? 0}
            initialHasVoted={feedback.user_has_voted || false}
            isAuthenticated={isAuthenticated}
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <Link
                href={`/feedback/${feedback.id}`}
                className="text-lg font-semibold hover:text-primary transition-colors line-clamp-1"
              >
                {feedback.title}
              </Link>
              <div className="flex gap-2 shrink-0">
                <CategoryBadge category={feedback.category ?? 'other'} />
                <StatusBadge status={feedback.status} />
              </div>
            </div>

            <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
              {feedback.description}
            </p>

            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
              <span>{authorName}</span>
              <span>·</span>
              <span>{timeAgo}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                {feedback.comment_count ?? 0}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
