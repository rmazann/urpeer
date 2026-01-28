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
import { createFeedback, type CreateFeedbackState } from '../actions/create-feedback'
import { toast } from 'sonner'

type NewFeedbackDialogProps = {
  isAuthenticated: boolean
}

export const NewFeedbackDialog = ({ isAuthenticated }: NewFeedbackDialogProps) => {
  const [open, setOpen] = useState(false)
  const [state, formAction, isPending] = useActionState<CreateFeedbackState, FormData>(
    createFeedback,
    null
  )

  useEffect(() => {
    if (state?.success) {
      toast.success('Feedback submitted successfully!')
      requestAnimationFrame(() => setOpen(false))
    } else if (state?.error && !state.fieldErrors) {
      toast.error(state.error)
    }
  }, [state])

  if (!isAuthenticated) {
    return (
      <Button asChild>
        <a href="/login">
          <Plus className="h-4 w-4 mr-2" />
          Submit Feedback
        </a>
      </Button>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Submit Feedback
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Submit New Feedback</DialogTitle>
          <DialogDescription>
            Share your ideas, report bugs, or suggest improvements.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="Brief summary of your feedback"
              required
            />
            {state?.fieldErrors?.title && (
              <p className="text-sm text-destructive">{state.fieldErrors.title[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select name="category" required>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="feature">Feature Request</SelectItem>
                <SelectItem value="improvement">Improvement</SelectItem>
                <SelectItem value="bug">Bug Report</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {state?.fieldErrors?.category && (
              <p className="text-sm text-destructive">{state.fieldErrors.category[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe your feedback in detail..."
              rows={5}
              required
            />
            {state?.fieldErrors?.description && (
              <p className="text-sm text-destructive">{state.fieldErrors.description[0]}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
