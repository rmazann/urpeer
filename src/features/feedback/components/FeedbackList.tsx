import type { FeedbackWithAuthor } from '@/lib/supabase/types'
import { FeedbackCard } from './FeedbackCard'

type FeedbackListProps = {
  feedbackItems: FeedbackWithAuthor[]
  isAuthenticated: boolean
}

export const FeedbackList = ({ feedbackItems, isAuthenticated }: FeedbackListProps) => {
  if (feedbackItems.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">No feedback found.</p>
        <p className="text-muted-foreground text-sm mt-1">
          Be the first to submit feedback!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {feedbackItems.map((feedback) => (
        <FeedbackCard
          key={feedback.id}
          feedback={feedback}
          isAuthenticated={isAuthenticated}
        />
      ))}
    </div>
  )
}
