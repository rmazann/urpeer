import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type CategoryBadgeProps = {
  category: string
}

const categoryConfig: Record<string, { label: string; className: string }> = {
  feature: {
    label: 'Feature',
    className: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
  },
  improvement: {
    label: 'Improvement',
    className: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
  },
  bug: {
    label: 'Bug',
    className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  },
  other: {
    label: 'Other',
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  },
}

export const CategoryBadge = ({ category }: CategoryBadgeProps) => {
  const config = categoryConfig[category] || categoryConfig.other

  return (
    <Badge variant="outline" className={cn('border-0', config.className)}>
      {config.label}
    </Badge>
  )
}
