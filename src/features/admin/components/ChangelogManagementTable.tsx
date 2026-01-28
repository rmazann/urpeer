'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { MoreHorizontal, ExternalLink, Trash2, Eye, EyeOff, Pencil } from 'lucide-react'
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
import type { ChangelogEntryWithDetails } from '@/lib/supabase/types'
import {
  publishChangelogEntry,
  unpublishChangelogEntry,
  updateChangelogEntry,
} from '@/features/changelog/actions/update-changelog'
import { deleteChangelogEntry } from '@/features/changelog/actions/delete-changelog'
import { toast } from 'sonner'

type ChangelogManagementTableProps = {
  entries: ChangelogEntryWithDetails[]
}

const categoryColors: Record<string, string> = {
  feature: 'bg-green-100 text-green-800',
  improvement: 'bg-blue-100 text-blue-800',
  bugfix: 'bg-orange-100 text-orange-800',
  breaking: 'bg-red-100 text-red-800',
}

export const ChangelogManagementTable = ({ entries }: ChangelogManagementTableProps) => {
  const [isPending, startTransition] = useTransition()
  const [deleteItem, setDeleteItem] = useState<ChangelogEntryWithDetails | null>(null)
  const [editItem, setEditItem] = useState<ChangelogEntryWithDetails | null>(null)
  const [editData, setEditData] = useState({ title: '', content: '', category: '' })

  const handlePublishToggle = (entry: ChangelogEntryWithDetails) => {
    startTransition(async () => {
      const result = entry.published
        ? await unpublishChangelogEntry(entry.id)
        : await publishChangelogEntry(entry.id)

      if (result.success) {
        toast.success(entry.published ? 'Entry unpublished' : 'Entry published')
      } else {
        toast.error(result.error || 'Failed to update entry')
      }
    })
  }

  const handleDelete = () => {
    if (!deleteItem) return

    startTransition(async () => {
      const result = await deleteChangelogEntry(deleteItem.id)
      if (result.success) {
        toast.success('Entry deleted')
      } else {
        toast.error(result.error || 'Failed to delete entry')
      }
      setDeleteItem(null)
    })
  }

  const handleEdit = () => {
    if (!editItem) return

    startTransition(async () => {
      const result = await updateChangelogEntry(editItem.id, editData)
      if (result.success) {
        toast.success('Entry updated')
        setEditItem(null)
      } else {
        toast.error(result.error || 'Failed to update entry')
      }
    })
  }

  const openEditDialog = (entry: ChangelogEntryWithDetails) => {
    setEditData({
      title: entry.title,
      content: entry.content,
      category: entry.category,
    })
    setEditItem(entry)
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No changelog entries found.
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
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Published</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>
                  <div className="font-medium truncate max-w-[300px]">
                    {entry.title}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    by {entry.profiles?.full_name || 'Unknown'}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`border-0 capitalize ${categoryColors[entry.category] || ''}`}
                  >
                    {entry.category}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={entry.published ? 'default' : 'outline'}>
                    {entry.published ? 'Published' : 'Draft'}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {entry.published_at
                    ? format(new Date(entry.published_at), 'MMM d, yyyy')
                    : '-'}
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
                      {entry.published && (
                        <DropdownMenuItem asChild>
                          <Link href={`/changelog/${entry.id}`}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => openEditDialog(entry)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handlePublishToggle(entry)}
                        disabled={isPending}
                      >
                        {entry.published ? (
                          <>
                            <EyeOff className="h-4 w-4 mr-2" />
                            Unpublish
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-2" />
                            Publish
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setDeleteItem(entry)}
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

      {/* Edit Dialog */}
      <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Changelog Entry</DialogTitle>
            <DialogDescription>Update the changelog entry details.</DialogDescription>
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
                  <SelectItem value="feature">Feature</SelectItem>
                  <SelectItem value="improvement">Improvement</SelectItem>
                  <SelectItem value="bugfix">Bug Fix</SelectItem>
                  <SelectItem value="breaking">Breaking Change</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-content">Content (Markdown)</Label>
              <Textarea
                id="edit-content"
                value={editData.content}
                onChange={(e) => setEditData({ ...editData, content: e.target.value })}
                rows={10}
                className="font-mono text-sm"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setEditItem(null)}>
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
      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete changelog entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{deleteItem?.title}&quot;. This action
              cannot be undone.
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
