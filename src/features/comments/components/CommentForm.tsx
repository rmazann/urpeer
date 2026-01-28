'use client'

import { useActionState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { createComment, type CreateCommentState } from '../actions/create-comment'
import { toast } from 'sonner'

type CommentFormProps = {
  feedbackId: string
  isAuthenticated: boolean
}

export const CommentForm = ({ feedbackId, isAuthenticated }: CommentFormProps) => {
  const formRef = useRef<HTMLFormElement>(null)

  const createCommentWithId = createComment.bind(null, feedbackId)
  const [state, formAction, isPending] = useActionState<CreateCommentState, FormData>(
    createCommentWithId,
    null
  )

  useEffect(() => {
    if (state?.success) {
      toast.success('Comment added successfully!')
      formRef.current?.reset()
    } else if (state?.error && !state.fieldErrors) {
      toast.error(state.error)
    }
  }, [state])

  if (!isAuthenticated) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        <a href="/login" className="text-primary hover:underline">
          Log in
        </a>{' '}
        to leave a comment.
      </div>
    )
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <Textarea
        name="content"
        placeholder="Write a comment..."
        rows={3}
        required
        disabled={isPending}
      />
      {state?.fieldErrors?.content && (
        <p className="text-sm text-destructive">{state.fieldErrors.content[0]}</p>
      )}
      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Posting...' : 'Post Comment'}
        </Button>
      </div>
    </form>
  )
}
