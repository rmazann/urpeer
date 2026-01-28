'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const statuses = [
  { value: 'all', label: 'All Statuses' },
  { value: 'open', label: 'Open' },
  { value: 'under-review', label: 'Under Review' },
  { value: 'planned', label: 'Planned' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'declined', label: 'Declined' },
]

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'feature', label: 'Feature' },
  { value: 'improvement', label: 'Improvement' },
  { value: 'bug', label: 'Bug' },
  { value: 'other', label: 'Other' },
]

const sortOptions = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'votes', label: 'Most Voted' },
]

export const FeedbackFilters = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentStatus = searchParams.get('status') || 'all'
  const currentCategory = searchParams.get('category') || 'all'
  const currentSort = searchParams.get('sortBy') || 'recent'

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all' || (key === 'sortBy' && value === 'recent')) {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.push(`/feedback?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Select value={currentStatus} onValueChange={(v) => updateFilter('status', v)}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {statuses.map((status) => (
            <SelectItem key={status.value} value={status.value}>
              {status.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={currentCategory} onValueChange={(v) => updateFilter('category', v)}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((category) => (
            <SelectItem key={category.value} value={category.value}>
              {category.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={currentSort} onValueChange={(v) => updateFilter('sortBy', v)}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
