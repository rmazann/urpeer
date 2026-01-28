'use client'

import { useTransition } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { RoadmapItemWithFeedback } from '@/lib/supabase/types'
import { deleteRoadmapItem } from '../actions/delete-roadmap-item'
import { toast } from 'sonner'

type DeleteRoadmapDialogProps = {
  item: RoadmapItemWithFeedback
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const DeleteRoadmapDialog = ({ item, open, onOpenChange }: DeleteRoadmapDialogProps) => {
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteRoadmapItem(item.id)

      if (result.success) {
        toast.success('Roadmap item deleted')
        onOpenChange(false)
      } else {
        toast.error(result.error || 'Failed to delete item')
      }
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete roadmap item?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete &quot;{item.title}&quot; from the roadmap.
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {isPending ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
