'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { RoadmapItemWithFeedback } from '@/lib/supabase/types'
import { updateRoadmapItem } from '../actions/update-roadmap-item'
import { toast } from 'sonner'

type EditRoadmapDialogProps = {
  item: RoadmapItemWithFeedback
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const EditRoadmapDialog = ({ item, open, onOpenChange }: EditRoadmapDialogProps) => {
  const [isPending, startTransition] = useTransition()
  const [formData, setFormData] = useState({
    title: item.title,
    description: item.description || '',
    eta: item.eta || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    startTransition(async () => {
      const result = await updateRoadmapItem(item.id, {
        title: formData.title,
        description: formData.description || undefined,
        eta: formData.eta || undefined,
      })

      if (result.success) {
        toast.success('Roadmap item updated')
        onOpenChange(false)
      } else {
        toast.error(result.error || 'Failed to update item')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Roadmap Item</DialogTitle>
          <DialogDescription>
            Update the details of this roadmap item.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="eta">ETA (e.g., &quot;Q1 2026&quot;, &quot;March 2026&quot;)</Label>
            <Input
              id="eta"
              value={formData.eta}
              onChange={(e) => setFormData({ ...formData, eta: e.target.value })}
              placeholder="Optional"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
