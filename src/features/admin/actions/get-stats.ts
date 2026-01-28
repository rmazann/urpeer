'use server'

import { createClient } from '@/lib/supabase/server'

export type DashboardStats = {
  totalFeedback: number
  totalVotes: number
  totalComments: number
  totalUsers: number
  feedbackByStatus: { status: string; count: number }[]
  feedbackByCategory: { category: string; count: number }[]
  recentActivity: {
    type: 'feedback' | 'vote' | 'comment'
    title: string
    createdAt: string
  }[]
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const supabase = await createClient()

  // Get total counts in parallel
  const [
    { count: totalFeedback },
    { count: totalVotes },
    { count: totalComments },
    { count: totalUsers },
  ] = await Promise.all([
    supabase.from('feedback').select('*', { count: 'exact', head: true }),
    supabase.from('votes').select('*', { count: 'exact', head: true }),
    supabase.from('comments').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
  ])

  // Get feedback by status
  const { data: feedbackData } = await supabase
    .from('feedback')
    .select('status')

  const statusCounts: Record<string, number> = {}
  feedbackData?.forEach((f) => {
    statusCounts[f.status] = (statusCounts[f.status] || 0) + 1
  })

  const feedbackByStatus = Object.entries(statusCounts).map(([status, count]) => ({
    status,
    count,
  }))

  // Get feedback by category
  const categoryCounts: Record<string, number> = {}
  const { data: categoryData } = await supabase
    .from('feedback')
    .select('category')

  categoryData?.forEach((f) => {
    const cat = f.category || 'other'
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1
  })

  const feedbackByCategory = Object.entries(categoryCounts).map(([category, count]) => ({
    category,
    count,
  }))

  // Get recent activity
  const [
    { data: recentFeedback },
    { data: recentComments },
  ] = await Promise.all([
    supabase
      .from('feedback')
      .select('title, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('comments')
      .select('content, created_at, feedback!inner(title)')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const recentActivity: DashboardStats['recentActivity'] = []

  recentFeedback?.forEach((f) => {
    recentActivity.push({
      type: 'feedback',
      title: f.title,
      createdAt: f.created_at || '',
    })
  })

  recentComments?.forEach((c) => {
    recentActivity.push({
      type: 'comment',
      title: `Comment on "${(c.feedback as { title: string })?.title || 'Unknown'}"`,
      createdAt: c.created_at || '',
    })
  })

  // Sort by date
  recentActivity.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return {
    totalFeedback: totalFeedback ?? 0,
    totalVotes: totalVotes ?? 0,
    totalComments: totalComments ?? 0,
    totalUsers: totalUsers ?? 0,
    feedbackByStatus,
    feedbackByCategory,
    recentActivity: recentActivity.slice(0, 10),
  }
}

export type TopVotedFeedback = {
  id: string
  title: string
  vote_count: number
  status: string
  category: string | null
}

export const getTopVotedFeedback = async (limit: number = 10): Promise<TopVotedFeedback[]> => {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('feedback')
    .select('id, title, vote_count, status, category')
    .order('vote_count', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching top voted feedback:', error)
    return []
  }

  return (data || []).map((f) => ({
    ...f,
    vote_count: f.vote_count ?? 0,
  }))
}
