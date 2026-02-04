import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronUp } from 'lucide-react'
import type { TopVotedFeedback } from '../actions/get-stats'

type TopVotedListProps = {
  items: TopVotedFeedback[]
}

const statusColors: Record<string, string> = {
  open: 'bg-blue-100 text-blue-800',
  under_review: 'bg-yellow-100 text-yellow-800',
  planned: 'bg-purple-100 text-purple-800',
  in_progress: 'bg-orange-100 text-orange-800',
  completed: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
}

export const TopVotedList = ({ items }: TopVotedListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Top Voted Feedback</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-4">
            No feedback yet
          </p>
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => (
              <Link
                key={item.id}
                href={`/feedback/${item.id}`}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-medium">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge
                      variant="outline"
                      className={`text-xs border-0 ${statusColors[item.status] || ''}`}
                    >
                      {item.status}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm font-medium">
                  <ChevronUp className="h-4 w-4 text-primary" />
                  {item.vote_count}
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
