'use client'

import { useState, useTransition } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { MoreHorizontal, Pencil, Trash2, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { CommentWithAuthor } from '@/lib/supabase/types'
import { updateComment } from '../actions/update-comment'
import { deleteComment } from '../actions/delete-comment'
import { toast } from 'sonner'

type CommentItemProps = {
  comment: CommentWithAuthor
  feedbackId: string
  currentUserId?: string
  isAdmin: boolean
}

export const CommentItem = ({
  comment,
  feedbackId,
  currentUserId,
  isAdmin,
}: CommentItemProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isPending, startTransition] = useTransition()

  const isAuthor = currentUserId === comment.author_id
  const canEdit = isAuthor
  const canDelete = isAuthor || isAdmin

  const authorName = comment.profiles?.full_name || 'Anonymous'
  const authorInitials = authorName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
  const timeAgo = comment.created_at
    ? formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })
    : 'Unknown'

  const handleSaveEdit = () => {
    if (editContent.trim() === comment.content) {
      setIsEditing(false)
      return
    }

    startTransition(async () => {
      const result = await updateComment(comment.id, feedbackId, editContent.trim())
      if (result.success) {
        toast.success('Comment updated')
        setIsEditing(false)
      } else {
        toast.error(result.error || 'Failed to update comment')
      }
    })
  }

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteComment(comment.id, feedbackId)
      if (result.success) {
        toast.success('Comment deleted')
      } else {
        toast.error(result.error || 'Failed to delete comment')
      }
      setShowDeleteDialog(false)
    })
  }

  const handleCancelEdit = () => {
    setEditContent(comment.content)
    setIsEditing(false)
  }

  return (
    <div className="flex gap-3 py-4">
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarImage src={comment.profiles?.avatar_url || undefined} alt={authorName} />
        <AvatarFallback className="text-xs">{authorInitials}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">{authorName}</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">{timeAgo}</span>
            {comment.updated_at && comment.updated_at !== comment.created_at && (
              <span className="text-muted-foreground text-xs">(edited)</span>
            )}
          </div>

          {(canEdit || canDelete) && !isEditing && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {canEdit && (
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                )}
                {canDelete && (
                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {isEditing ? (
          <div className="mt-2 space-y-2">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={3}
              disabled={isPending}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSaveEdit}
                disabled={isPending || !editContent.trim()}
              >
                <Check className="h-4 w-4 mr-1" />
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancelEdit}
                disabled={isPending}
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="mt-1 text-sm whitespace-pre-wrap">{comment.content}</p>
        )}
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete comment?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this comment.
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
    </div>
  )
}
