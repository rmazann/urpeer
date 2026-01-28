'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Calendar, LinkIcon, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { RoadmapItemWithFeedback } from '@/lib/supabase/types'
import Link from 'next/link'

type RoadmapCardProps = {
  item: RoadmapItemWithFeedback
  isAdmin: boolean
  onEdit?: (item: RoadmapItemWithFeedback) => void
  onDelete?: (item: RoadmapItemWithFeedback) => void
}

export const RoadmapCard = ({ item, isAdmin, onEdit, onDelete }: RoadmapCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    disabled: !isAdmin,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const feedbackVotes = item.feedback?.vote_count ?? 0

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? 'shadow-lg ring-2 ring-primary' : ''}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start gap-2">
          {isAdmin && (
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-muted-foreground hover:text-foreground"
            >
              <GripVertical className="h-4 w-4" />
            </button>
          )}

          <div className="flex-1 min-w-0">
            <CardTitle className="text-base line-clamp-2">{item.title}</CardTitle>
          </div>

          {isAdmin && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit?.(item)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete?.(item)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {item.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {item.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {item.eta && (
            <Badge variant="outline" className="text-xs">
              <Calendar className="h-3 w-3 mr-1" />
              {item.eta}
            </Badge>
          )}

          {item.feedback && (
            <Link href={`/feedback/${item.feedback.id}`}>
              <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-secondary/80">
                <LinkIcon className="h-3 w-3 mr-1" />
                {feedbackVotes} votes
              </Badge>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
