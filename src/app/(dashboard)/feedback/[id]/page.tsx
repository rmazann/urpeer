import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getFeedbackById } from '@/features/feedback/actions/get-feedback'
import { getCommentsByFeedbackId } from '@/features/comments/actions/get-comments'
import { VoteButton } from '@/features/feedback/components/VoteButton'
import { StatusBadge } from '@/features/feedback/components/StatusBadge'
import { CategoryBadge } from '@/features/feedback/components/CategoryBadge'
import { AdminActionsDropdown } from '@/features/feedback/components/AdminActionsDropdown'
import { CommentList, CommentForm } from '@/features/comments/components'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDistanceToNow } from 'date-fns'
import { MessageCircle } from 'lucide-react'

type FeedbackDetailPageProps = {
  params: Promise<{ id: string }>
}

export default async function FeedbackDetailPage({ params }: FeedbackDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get user profile to check if admin
  let isAdmin = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    isAdmin = profile?.role === 'admin'
  }

  const [feedback, comments] = await Promise.all([
    getFeedbackById(id),
    getCommentsByFeedbackId(id),
  ])

  if (!feedback) {
    notFound()
  }

  const isAuthor = user?.id === feedback.author_id
  const authorName = feedback.profiles?.full_name || 'Anonymous'
  const timeAgo = feedback.created_at
    ? formatDistanceToNow(new Date(feedback.created_at), { addSuffix: true })
    : 'Unknown'

  return (
    <div className="max-w-4xl space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start gap-4">
            <VoteButton
              feedbackId={feedback.id}
              initialVoteCount={feedback.vote_count ?? 0}
              initialHasVoted={feedback.user_has_voted || false}
              isAuthenticated={!!user}
            />

            <div className="flex-1">
              <div className="flex items-start justify-between gap-4 mb-2">
                <CardTitle className="text-2xl">{feedback.title}</CardTitle>
                <div className="flex items-center gap-2 shrink-0">
                  <CategoryBadge category={feedback.category ?? 'other'} />
                  <StatusBadge status={feedback.status} />
                  {(isAdmin || isAuthor) && (
                    <AdminActionsDropdown
                      feedbackId={feedback.id}
                      currentStatus={feedback.status}
                      currentTitle={feedback.title}
                      currentDescription={feedback.description}
                      currentCategory={feedback.category ?? 'other'}
                      isAdmin={isAdmin}
                      isAuthor={isAuthor}
                    />
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{authorName}</span>
                <span>·</span>
                <span>{timeAgo}</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  {feedback.comment_count ?? 0} comments
                </span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="whitespace-pre-wrap">{feedback.description}</p>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-semibold mb-4">
          Comments ({comments.length})
        </h2>
        <Card>
          <CardContent className="pt-6">
            <CommentForm feedbackId={id} isAuthenticated={!!user} />
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardContent className="pt-2">
            <CommentList
              comments={comments}
              feedbackId={id}
              currentUserId={user?.id}
              isAdmin={isAdmin}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
