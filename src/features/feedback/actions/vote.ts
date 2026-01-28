'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type VoteResult = {
  success: boolean
  error?: string
  newVoteCount?: number
  hasVoted?: boolean
}

export const toggleVote = async (feedbackId: string): Promise<VoteResult> => {
  const supabase = await createClient()

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'You must be logged in to vote' }
  }

  // Check if user has already voted
  const { data: existingVote } = await supabase
    .from('votes')
    .select('id')
    .eq('feedback_id', feedbackId)
    .eq('user_id', user.id)
    .single()

  if (existingVote) {
    // Remove vote
    const { error: deleteError } = await supabase
      .from('votes')
      .delete()
      .eq('feedback_id', feedbackId)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Error removing vote:', deleteError)
      return { success: false, error: 'Failed to remove vote' }
    }

    // Get updated vote count
    const { data: feedback } = await supabase
      .from('feedback')
      .select('vote_count')
      .eq('id', feedbackId)
      .single()

    revalidatePath('/feedback')
    revalidatePath(`/feedback/${feedbackId}`)

    return {
      success: true,
      newVoteCount: feedback?.vote_count ?? 0,
      hasVoted: false,
    }
  } else {
    // Add vote
    const { error: insertError } = await supabase.from('votes').insert({
      feedback_id: feedbackId,
      user_id: user.id,
    })

    if (insertError) {
      console.error('Error adding vote:', insertError)
      return { success: false, error: 'Failed to add vote' }
    }

    // Get updated vote count
    const { data: feedback } = await supabase
      .from('feedback')
      .select('vote_count')
      .eq('id', feedbackId)
      .single()

    revalidatePath('/feedback')
    revalidatePath(`/feedback/${feedbackId}`)

    return {
      success: true,
      newVoteCount: feedback?.vote_count ?? 0,
      hasVoted: true,
    }
  }
}
