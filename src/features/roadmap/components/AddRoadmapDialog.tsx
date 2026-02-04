'use client'

import { useActionState, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus } from 'lucide-react'
import { createRoadmapItem, type CreateRoadmapItemState } from '../actions/create-roadmap-item'
import { toast } from 'sonner'

type FeedbackOption = {
  id: string
  title: string
  vote_count: number
}

type AddRoadmapDialogProps = {
  feedbackOptions?: FeedbackOption[]
}

export const AddRoadmapDialog = ({ feedbackOptions = [] }: AddRoadmapDialogProps) => {
  const [open, setOpen] = useState(false)
  const [state, formAction, isPending] = useActionState<CreateRoadmapItemState, FormData>(
    createRoadmapItem,
    null
  )

  useEffect(() => {
    if (state?.success) {
      toast.success('Roadmap item created!')
      requestAnimationFrame(() => setOpen(false))
    } else if (state?.error && !state.fieldErrors) {
      toast.error(state.error)
    }
  }, [state])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add to Roadmap
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Roadmap Item</DialogTitle>
          <DialogDescription>
            Create a new item on the product roadmap.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="Feature or milestone name"
              required
            />
            {state?.fieldErrors?.title && (
              <p className="text-sm text-destructive">{state.fieldErrors.title[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Optional description..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue="planned">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="eta">ETA</Label>
              <Input
                id="eta"
                name="eta"
                placeholder="Q1 2026"
              />
            </div>
          </div>

          {feedbackOptions.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="feedback_id">Link to Feedback (Optional)</Label>
              <Select name="feedback_id">
                <SelectTrigger>
                  <SelectValue placeholder="Select feedback..." />
                </SelectTrigger>
                <SelectContent>
                  {feedbackOptions.map((feedback) => (
                    <SelectItem key={feedback.id} value={feedback.id}>
                      {feedback.title} ({feedback.vote_count} votes)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Creating...' : 'Create Item'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
