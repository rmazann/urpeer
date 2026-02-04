import { createClient } from '@/lib/supabase/server'
import { getRoadmapItems } from '@/features/roadmap/actions/get-roadmap'
import { RoadmapBoard, AddRoadmapDialog } from '@/features/roadmap/components'
import { PageHeader } from '@/components/layout/page-header'

export default async function RoadmapPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Check if user is admin
  let isAdmin = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    isAdmin = profile?.role === 'admin'
  }

  const roadmapItems = await getRoadmapItems()

  // Get feedback options for linking (only for admins)
  let feedbackOptions: { id: string; title: string; vote_count: number }[] = []
  if (isAdmin) {
    const { data: feedback } = await supabase
      .from('feedback')
      .select('id, title, vote_count')
      .order('vote_count', { ascending: false })
      .limit(50)

    feedbackOptions = (feedback || []).map((f) => ({
      id: f.id,
      title: f.title,
      vote_count: f.vote_count ?? 0,
    }))
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Product Roadmap"
        description="See what we're working on and what's coming next."
        actions={isAdmin ? <AddRoadmapDialog feedbackOptions={feedbackOptions} /> : undefined}
      />

      <RoadmapBoard initialItems={roadmapItems} isAdmin={isAdmin} />
    </div>
  )
}
