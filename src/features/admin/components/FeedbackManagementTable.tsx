'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { MoreHorizontal, ExternalLink, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import type { FeedbackWithAuthor } from '@/lib/supabase/types'
import { updateFeedbackStatus } from '@/features/feedback/actions/update-feedback'
import { deleteFeedback } from '@/features/feedback/actions/delete-feedback'
import { toast } from 'sonner'

type FeedbackManagementTableProps = {
  items: FeedbackWithAuthor[]
}

const statusOptions = [
  { value: 'open', label: 'Open' },
  { value: 'under-review', label: 'Under Review' },
  { value: 'planned', label: 'Planned' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'declined', label: 'Declined' },
]

const statusColors: Record<string, string> = {
  open: 'bg-blue-100 text-blue-800',
  'under-review': 'bg-yellow-100 text-yellow-800',
  planned: 'bg-purple-100 text-purple-800',
  'in-progress': 'bg-orange-100 text-orange-800',
  completed: 'bg-green-100 text-green-800',
  declined: 'bg-gray-100 text-gray-800',
}

export const FeedbackManagementTable = ({ items }: FeedbackManagementTableProps) => {
  const [isPending, startTransition] = useTransition()
  const [deleteItem, setDeleteItem] = useState<FeedbackWithAuthor | null>(null)

  const handleStatusChange = (feedbackId: string, status: string) => {
    startTransition(async () => {
      const result = await updateFeedbackStatus(feedbackId, status)
      if (result.success) {
        toast.success('Status updated')
      } else {
        toast.error(result.error || 'Failed to update status')
      }
    })
  }

  const handleDelete = () => {
    if (!deleteItem) return

    startTransition(async () => {
      const result = await deleteFeedback(deleteItem.id)
      if (result.success) {
        toast.success('Feedback deleted')
      } else {
        toast.error(result.error || 'Failed to delete feedback')
      }
      setDeleteItem(null)
    })
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No feedback items found.
      </div>
    )
  }

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Votes</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <Link
                      href={`/feedback/${item.id}`}
                      className="font-medium hover:text-primary truncate max-w-[300px]"
                    >
                      {item.title}
                    </Link>
                    <span className="text-xs text-muted-foreground">
                      by {item.profiles?.full_name || 'Anonymous'}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`border-0 ${statusColors[item.status] || ''}`}
                  >
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell className="capitalize">
                  {item.category || 'other'}
                </TableCell>
                <TableCell>{item.vote_count ?? 0}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {item.created_at
                    ? formatDistanceToNow(new Date(item.created_at), { addSuffix: true })
                    : 'Unknown'}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={`/feedback/${item.id}`}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>Change Status</DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                          {statusOptions.map((status) => (
                            <DropdownMenuItem
                              key={status.value}
                              onClick={() => handleStatusChange(item.id, status.value)}
                              disabled={isPending || item.status === status.value}
                            >
                              {status.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setDeleteItem(item)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete feedback?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{deleteItem?.title}&quot; along with all
              votes and comments. This action cannot be undone.
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
