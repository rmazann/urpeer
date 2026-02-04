'use client'

import { useState, useTransition } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable'
import { RoadmapColumn } from './RoadmapColumn'
import { RoadmapCard } from './RoadmapCard'
import { EditRoadmapDialog } from './EditRoadmapDialog'
import { DeleteRoadmapDialog } from './DeleteRoadmapDialog'
import type { RoadmapItemWithFeedback } from '@/lib/supabase/types'
import type { RoadmapByStatus } from '../actions/get-roadmap'
import { updateRoadmapItemStatus, reorderRoadmapItems } from '../actions/update-roadmap-item'
import { toast } from 'sonner'

type RoadmapBoardProps = {
  initialItems: RoadmapByStatus
  isAdmin: boolean
}

type ColumnId = 'planned' | 'in_progress' | 'completed'

const columns: { id: ColumnId; title: string }[] = [
  { id: 'planned', title: 'Planned' },
  { id: 'in_progress', title: 'In Progress' },
  { id: 'completed', title: 'Completed' },
]

export const RoadmapBoard = ({ initialItems, isAdmin }: RoadmapBoardProps) => {
  const [items, setItems] = useState<RoadmapByStatus>(initialItems)
  const [activeItem, setActiveItem] = useState<RoadmapItemWithFeedback | null>(null)
  const [editItem, setEditItem] = useState<RoadmapItemWithFeedback | null>(null)
  const [deleteItem, setDeleteItem] = useState<RoadmapItemWithFeedback | null>(null)
  const [, startTransition] = useTransition()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const findContainer = (id: string): ColumnId | null => {
    if (items.planned.some((item) => item.id === id)) return 'planned'
    if (items['in_progress'].some((item) => item.id === id)) return 'in_progress'
    if (items.completed.some((item) => item.id === id)) return 'completed'
    return null
  }

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const containerId = findContainer(active.id as string)
    if (containerId) {
      const item = items[containerId].find((i) => i.id === active.id)
      setActiveItem(item || null)
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeContainer = findContainer(active.id as string)
    const overId = over.id as string

    // Check if dropping on a column
    let overContainer: ColumnId | null = null
    if (['planned', 'in_progress', 'completed'].includes(overId)) {
      overContainer = overId as ColumnId
    } else {
      overContainer = findContainer(overId)
    }

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return
    }

    // Move item between containers
    setItems((prev) => {
      const activeItems = [...prev[activeContainer]]
      const overItems = [...prev[overContainer]]

      const activeIndex = activeItems.findIndex((i) => i.id === active.id)
      const [movedItem] = activeItems.splice(activeIndex, 1)

      // Update the item's status
      const updatedItem = { ...movedItem, status: overContainer }
      overItems.push(updatedItem)

      return {
        ...prev,
        [activeContainer]: activeItems,
        [overContainer]: overItems,
      }
    })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveItem(null)

    if (!over) return

    const activeContainer = findContainer(active.id as string)
    const overId = over.id as string

    let overContainer: ColumnId | null = null
    if (['planned', 'in_progress', 'completed'].includes(overId)) {
      overContainer = overId as ColumnId
    } else {
      overContainer = findContainer(overId)
    }

    if (!activeContainer || !overContainer) return

    // Handle reordering within same container
    if (activeContainer === overContainer && active.id !== over.id) {
      setItems((prev) => {
        const containerItems = [...prev[activeContainer]]
        const oldIndex = containerItems.findIndex((i) => i.id === active.id)
        const newIndex = containerItems.findIndex((i) => i.id === over.id)

        const reordered = arrayMove(containerItems, oldIndex, newIndex)

        return {
          ...prev,
          [activeContainer]: reordered,
        }
      })
    }

    // Persist changes to database
    startTransition(async () => {
      const allItems = [
        ...items.planned.map((item, idx) => ({ id: item.id, display_order: idx, status: 'planned' })),
        ...items['in_progress'].map((item, idx) => ({ id: item.id, display_order: idx, status: 'in_progress' })),
        ...items.completed.map((item, idx) => ({ id: item.id, display_order: idx, status: 'completed' })),
      ]

      // Find the moved item and update its status
      const movedItem = allItems.find((i) => i.id === active.id)
      if (movedItem && overContainer && movedItem.status !== overContainer) {
        const result = await updateRoadmapItemStatus(
          active.id as string,
          overContainer,
          movedItem.display_order
        )
        if (!result.success) {
          toast.error(result.error || 'Failed to update item')
          // Revert to initial state
          setItems(initialItems)
          return
        }
      }

      // Reorder items
      const result = await reorderRoadmapItems(
        allItems.map((i) => ({ id: i.id, display_order: i.display_order }))
      )
      if (!result.success) {
        toast.error(result.error || 'Failed to reorder items')
      }
    })
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((column) => (
            <RoadmapColumn
              key={column.id}
              id={column.id}
              title={column.title}
              items={items[column.id]}
              isAdmin={isAdmin}
              onEdit={setEditItem}
              onDelete={setDeleteItem}
            />
          ))}
        </div>

        <DragOverlay>
          {activeItem && (
            <RoadmapCard item={activeItem} isAdmin={false} />
          )}
        </DragOverlay>
      </DndContext>

      {editItem && (
        <EditRoadmapDialog
          item={editItem}
          open={!!editItem}
          onOpenChange={(open) => !open && setEditItem(null)}
        />
      )}

      {deleteItem && (
        <DeleteRoadmapDialog
          item={deleteItem}
          open={!!deleteItem}
          onOpenChange={(open) => !open && setDeleteItem(null)}
        />
      )}
    </>
  )
}
