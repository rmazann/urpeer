import type { CommentWithAuthor } from '@/lib/supabase/types'
import { CommentItem } from './CommentItem'

type CommentListProps = {
  comments: CommentWithAuthor[]
  feedbackId: string
  currentUserId?: string
  isAdmin: boolean
}

export const CommentList = ({
  comments,
  feedbackId,
  currentUserId,
  isAdmin,
}: CommentListProps) => {
  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No comments yet. Be the first to comment!
      </div>
    )
  }

  return (
    <div className="divide-y">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          feedbackId={feedbackId}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
        />
      ))}
    </div>
  )
}
