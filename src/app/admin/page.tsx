import { MessageSquare, ThumbsUp, Users, FileText } from 'lucide-react'
import { getDashboardStats, getTopVotedFeedback } from '@/features/admin/actions/get-stats'
import {
  StatsCard,
  FeedbackStatusChart,
  TopVotedList,
  RecentActivityList,
} from '@/features/admin/components'

export default async function AdminDashboardPage() {
  const [stats, topVoted] = await Promise.all([
    getDashboardStats(),
    getTopVotedFeedback(5),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your feedback platform.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Feedback"
          value={stats.totalFeedback}
          description="All time submissions"
          icon={MessageSquare}
        />
        <StatsCard
          title="Total Votes"
          value={stats.totalVotes}
          description="User engagement"
          icon={ThumbsUp}
        />
        <StatsCard
          title="Total Comments"
          value={stats.totalComments}
          description="Discussion activity"
          icon={FileText}
        />
        <StatsCard
          title="Total Users"
          value={stats.totalUsers}
          description="Registered accounts"
          icon={Users}
        />
      </div>

      {/* Charts and Lists */}
      <div className="grid gap-6 lg:grid-cols-2">
        <FeedbackStatusChart data={stats.feedbackByStatus} />
        <TopVotedList items={topVoted} />
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentActivityList activities={stats.recentActivity} />
      </div>
    </div>
  )
}
