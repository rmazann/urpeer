'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { MoreHorizontal, Pencil, Trash2, CheckCircle, Clock, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { updateFeedbackStatus, updateFeedback } from '../actions/update-feedback'
import { deleteFeedback } from '../actions/delete-feedback'
import { toast } from 'sonner'

type AdminActionsDropdownProps = {
  feedbackId: string
  currentStatus: string
  currentTitle: string
  currentDescription: string
  currentCategory: string
  isAdmin: boolean
  isAuthor: boolean
}

const statusOptions = [
  { value: 'open', label: 'Open', icon: Clock },
  { value: 'under_review', label: 'Under Review', icon: Clock },
  { value: 'planned', label: 'Planned', icon: Clock },
  { value: 'in_progress', label: 'In Progress', icon: Clock },
  { value: 'completed', label: 'Completed', icon: CheckCircle },
  { value: 'closed', label: 'Closed', icon: XCircle },
]

export const AdminActionsDropdown = ({
  feedbackId,
  currentStatus,
  currentTitle,
  currentDescription,
  currentCategory,
  isAdmin,
  isAuthor,
}: AdminActionsDropdownProps) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editData, setEditData] = useState({
    title: currentTitle,
    description: currentDescription,
    category: currentCategory,
  })

  const canEdit = isAdmin || isAuthor
  const canDelete = isAdmin || isAuthor
  const canChangeStatus = isAdmin

  if (!canEdit && !canDelete && !canChangeStatus) {
    return null
  }

  const handleStatusChange = (status: string) => {
    startTransition(async () => {
      const result = await updateFeedbackStatus(feedbackId, status)
      if (result.success) {
        toast.success('Status updated')
      } else {
        toast.error(result.error || 'Failed to update status')
      }
    })
  }

  const handleEdit = () => {
    startTransition(async () => {
      const result = await updateFeedback(feedbackId, editData)
      if (result.success) {
        toast.success('Feedback updated')
        setShowEditDialog(false)
      } else {
        toast.error(result.error || 'Failed to update feedback')
      }
    })
  }

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteFeedback(feedbackId)
      if (result.success) {
        toast.success('Feedback deleted')
        router.push('/feedback')
      } else {
        toast.error(result.error || 'Failed to delete feedback')
      }
      setShowDeleteDialog(false)
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {canChangeStatus && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Clock className="h-4 w-4 mr-2" />
                Change Status
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {statusOptions.map((status) => (
                  <DropdownMenuItem
                    key={status.value}
                    onClick={() => handleStatusChange(status.value)}
                    disabled={isPending || currentStatus === status.value}
                  >
                    <status.icon className="h-4 w-4 mr-2" />
                    {status.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          )}

          {canEdit && (
            <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
          )}

          {canDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Feedback</DialogTitle>
            <DialogDescription>Make changes to this feedback item.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editData.title}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
              <Select
                value={editData.category}
                onValueChange={(v) => setEditData({ ...editData, category: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="feature">Feature Request</SelectItem>
                  <SelectItem value="improvement">Improvement</SelectItem>
                  <SelectItem value="bug">Bug Report</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                rows={5}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleEdit} disabled={isPending}>
                {isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete feedback?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this feedback
              along with all its votes and comments.
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
    </>
  )
}
