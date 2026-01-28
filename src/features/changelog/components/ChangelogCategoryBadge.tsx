import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Sparkles, Zap, Bug, AlertTriangle } from 'lucide-react'

type ChangelogCategoryBadgeProps = {
  category: string
}

const categoryConfig: Record<
  string,
  { label: string; className: string; icon: typeof Sparkles }
> = {
  feature: {
    label: 'New Feature',
    className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    icon: Sparkles,
  },
  improvement: {
    label: 'Improvement',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    icon: Zap,
  },
  bugfix: {
    label: 'Bug Fix',
    className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    icon: Bug,
  },
  breaking: {
    label: 'Breaking Change',
    className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    icon: AlertTriangle,
  },
}

export const ChangelogCategoryBadge = ({ category }: ChangelogCategoryBadgeProps) => {
  const config = categoryConfig[category] || categoryConfig.feature
  const Icon = config.icon

  return (
    <Badge variant="outline" className={cn('border-0 gap-1', config.className)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  )
}
