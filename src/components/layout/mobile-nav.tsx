'use client'

import { User } from '@supabase/supabase-js'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { filterNavigationByRole } from '@/lib/navigation'

type MobileNavProps = {
  user: User
  role?: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

const getInitials = (name: string | undefined): string => {
  if (!name) return 'U'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export const MobileNav = ({ user, role, open, onOpenChange }: MobileNavProps) => {
  const pathname = usePathname()
  const navigation = filterNavigationByRole(role)
  const fullName = user.user_metadata?.full_name as string | undefined

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="border-b p-4">
          <SheetTitle className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.user_metadata?.avatar_url} alt={fullName} />
              <AvatarFallback>{getInitials(fullName)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium">{fullName}</span>
              {role === 'admin' && (
                <Badge variant="secondary" className="mt-0.5">
                  Admin
                </Badge>
              )}
            </div>
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-6">
            {navigation.map((section, sectionIndex) => (
              <div key={sectionIndex} className="space-y-2">
                {section.title && (
                  <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {section.title}
                  </h3>
                )}
                {section.title && sectionIndex > 0 && <Separator />}
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => onOpenChange(false)}
                      >
                        <Button
                          variant={isActive ? 'secondary' : 'ghost'}
                          className="w-full justify-start"
                        >
                          <Icon className="mr-3 h-4 w-4" />
                          <span>{item.title}</span>
                          {item.badge && (
                            <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                              {item.badge}
                            </span>
                          )}
                        </Button>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
