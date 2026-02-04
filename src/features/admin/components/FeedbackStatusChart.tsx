'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type FeedbackStatusChartProps = {
  data: { status: string; count: number }[]
}

const statusLabels: Record<string, string> = {
  open: 'Open',
  under_review: 'Under Review',
  planned: 'Planned',
  in_progress: 'In Progress',
  completed: 'Completed',
  closed: 'Closed',
}

const statusColors: Record<string, string> = {
  open: 'bg-blue-500',
  under_review: 'bg-yellow-500',
  planned: 'bg-purple-500',
  in_progress: 'bg-orange-500',
  completed: 'bg-green-500',
  closed: 'bg-gray-500',
}

export const FeedbackStatusChart = ({ data }: FeedbackStatusChartProps) => {
  const total = data.reduce((sum, item) => sum + item.count, 0)

  if (total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Feedback by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm text-center py-4">
            No feedback data yet
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Feedback by Status</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Progress bar */}
        <div className="flex h-4 rounded-full overflow-hidden mb-4">
          {data.map((item) => {
            const percentage = (item.count / total) * 100
            if (percentage === 0) return null
            return (
              <div
                key={item.status}
                className={`${statusColors[item.status] || 'bg-gray-400'}`}
                style={{ width: `${percentage}%` }}
                title={`${statusLabels[item.status] || item.status}: ${item.count}`}
              />
            )
          })}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-2">
          {data.map((item) => (
            <div key={item.status} className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${statusColors[item.status] || 'bg-gray-400'}`}
              />
              <span className="text-sm text-muted-foreground">
                {statusLabels[item.status] || item.status}
              </span>
              <span className="text-sm font-medium ml-auto">{item.count}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
