'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { RoadmapCard } from './RoadmapCard'
import type { RoadmapItemWithFeedback } from '@/lib/supabase/types'
import { cn } from '@/lib/utils'

type RoadmapColumnProps = {
  id: string
  title: string
  items: RoadmapItemWithFeedback[]
  isAdmin: boolean
  onEdit?: (item: RoadmapItemWithFeedback) => void
  onDelete?: (item: RoadmapItemWithFeedback) => void
}

const columnColors: Record<string, string> = {
  planned: 'border-t-blue-500',
  in_progress: 'border-t-yellow-500',
  completed: 'border-t-green-500',
}

export const RoadmapColumn = ({
  id,
  title,
  items,
  isAdmin,
  onEdit,
  onDelete,
}: RoadmapColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col rounded-lg border border-t-4 bg-muted/30 min-h-[400px]',
        columnColors[id] || 'border-t-gray-500',
        isOver && 'ring-2 ring-primary ring-offset-2'
      )}
    >
      <div className="p-4 border-b">
        <h3 className="font-semibold flex items-center gap-2">
          {title}
          <span className="text-muted-foreground font-normal text-sm">
            ({items.length})
          </span>
        </h3>
      </div>

      <div className="flex-1 p-3">
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {items.map((item) => (
              <RoadmapCard
                key={item.id}
                item={item}
                isAdmin={isAdmin}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}

            {items.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No items yet
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  )
}
