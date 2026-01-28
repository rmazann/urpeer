import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type StatusBadgeProps = {
  status: string
}

const statusConfig: Record<string, { label: string; className: string }> = {
  open: {
    label: 'Open',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  },
  'under-review': {
    label: 'Under Review',
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  },
  planned: {
    label: 'Planned',
    className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  },
  'in-progress': {
    label: 'In Progress',
    className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  },
  completed: {
    label: 'Completed',
    className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  },
  declined: {
    label: 'Declined',
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  },
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const config = statusConfig[status] || statusConfig.open

  return (
    <Badge variant="outline" className={cn('border-0', config.className)}>
      {config.label}
    </Badge>
  )
}
