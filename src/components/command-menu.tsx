'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  MessageSquare,
  Map,
  FileText,
  User,
  LayoutDashboard,
  FolderKanban,
  Settings,
} from 'lucide-react'

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'

type CommandMenuProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  role?: string
}

export const CommandMenu = ({ open, onOpenChange, role }: CommandMenuProps) => {
  const router = useRouter()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(!open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [open, onOpenChange])

  const runCommand = React.useCallback(
    (command: () => void) => {
      onOpenChange(false)
      command()
    },
    [onOpenChange]
  )

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Navigation">
          <CommandItem
            onSelect={() => runCommand(() => router.push('/feedback'))}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            <span>Feedback</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push('/roadmap'))}
          >
            <Map className="mr-2 h-4 w-4" />
            <span>Roadmap</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push('/changelog'))}
          >
            <FileText className="mr-2 h-4 w-4" />
            <span>Changelog</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push('/profile'))}
          >
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </CommandItem>
        </CommandGroup>

        {role === 'admin' && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Admin">
              <CommandItem
                onSelect={() => runCommand(() => router.push('/admin'))}
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => router.push('/admin/feedback'))}
              >
                <FolderKanban className="mr-2 h-4 w-4" />
                <span>Feedback Management</span>
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => router.push('/admin/changelog'))}
              >
                <FileText className="mr-2 h-4 w-4" />
                <span>Changelog Management</span>
              </CommandItem>
            </CommandGroup>
          </>
        )}

        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem
            onSelect={() => runCommand(() => router.push('/profile?tab=settings'))}
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
