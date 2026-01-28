'use client'

import { useState, useTransition } from 'react'
import { ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toggleVote } from '../actions/vote'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

type VoteButtonProps = {
  feedbackId: string
  initialVoteCount: number
  initialHasVoted: boolean
  isAuthenticated: boolean
}

export const VoteButton = ({
  feedbackId,
  initialVoteCount,
  initialHasVoted,
  isAuthenticated,
}: VoteButtonProps) => {
  const [isPending, startTransition] = useTransition()
  const [voteCount, setVoteCount] = useState(initialVoteCount)
  const [hasVoted, setHasVoted] = useState(initialHasVoted)

  const handleVote = () => {
    if (!isAuthenticated) {
      toast.error('Please log in to vote')
      return
    }

    // Optimistic update
    const newHasVoted = !hasVoted
    const newVoteCount = newHasVoted ? voteCount + 1 : voteCount - 1
    setHasVoted(newHasVoted)
    setVoteCount(newVoteCount)

    startTransition(async () => {
      const result = await toggleVote(feedbackId)

      if (!result.success) {
        // Revert optimistic update
        setHasVoted(!newHasVoted)
        setVoteCount(voteCount)
        toast.error(result.error || 'Failed to vote')
        return
      }

      // Update with actual server values
      if (result.newVoteCount !== undefined) {
        setVoteCount(result.newVoteCount)
      }
      if (result.hasVoted !== undefined) {
        setHasVoted(result.hasVoted)
      }
    })
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleVote}
      disabled={isPending}
      className={cn(
        'flex flex-col items-center gap-0.5 h-auto py-2 px-3 min-w-[60px]',
        hasVoted && 'border-primary bg-primary/10 text-primary'
      )}
    >
      <ChevronUp className={cn('h-4 w-4', hasVoted && 'text-primary')} />
      <span className="text-sm font-semibold">{voteCount}</span>
    </Button>
  )
}
