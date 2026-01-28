import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDistanceToNow } from 'date-fns'
import { MessageSquare, Lightbulb, ThumbsUp } from 'lucide-react'
import type { DashboardStats } from '../actions/get-stats'

type RecentActivityListProps = {
  activities: DashboardStats['recentActivity']
}

const activityIcons = {
  feedback: Lightbulb,
  vote: ThumbsUp,
  comment: MessageSquare,
}

const activityColors = {
  feedback: 'text-blue-500 bg-blue-50',
  vote: 'text-green-500 bg-green-50',
  comment: 'text-purple-500 bg-purple-50',
}

export const RecentActivityList = ({ activities }: RecentActivityListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-4">
            No recent activity
          </p>
        ) : (
          <div className="space-y-3">
            {activities.map((activity, index) => {
              const Icon = activityIcons[activity.type]
              const colorClass = activityColors[activity.type]
              const timeAgo = activity.createdAt
                ? formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })
                : 'Unknown'

              return (
                <div key={index} className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${colorClass}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{timeAgo}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
