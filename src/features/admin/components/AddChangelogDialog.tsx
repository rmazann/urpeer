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
import {
  createChangelogEntry,
  type CreateChangelogState,
} from '@/features/changelog/actions/create-changelog'
import { toast } from 'sonner'

export const AddChangelogDialog = () => {
  const [open, setOpen] = useState(false)
  const [state, formAction, isPending] = useActionState<CreateChangelogState, FormData>(
    createChangelogEntry,
    null
  )

  useEffect(() => {
    if (state?.success) {
      toast.success('Changelog entry created!')
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
          New Entry
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Changelog Entry</DialogTitle>
          <DialogDescription>
            Write a new changelog entry. It will be saved as a draft.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="What's new?"
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
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="feature">New Feature</SelectItem>
                <SelectItem value="improvement">Improvement</SelectItem>
                <SelectItem value="bugfix">Bug Fix</SelectItem>
                <SelectItem value="breaking">Breaking Change</SelectItem>
              </SelectContent>
            </Select>
            {state?.fieldErrors?.category && (
              <p className="text-sm text-destructive">{state.fieldErrors.category[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content (Markdown supported)</Label>
            <Textarea
              id="content"
              name="content"
              placeholder="Describe the changes..."
              rows={10}
              required
              className="font-mono text-sm"
            />
            {state?.fieldErrors?.content && (
              <p className="text-sm text-destructive">{state.fieldErrors.content[0]}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Creating...' : 'Create Draft'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
