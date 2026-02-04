'use client'

import { User } from '@supabase/supabase-js'
import { Menu, Search } from 'lucide-react'
import { usePathname } from 'next/navigation'

import { Button } from '@/components/ui/button'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { UserNav } from './user-nav'
import { useSidebar } from '@/hooks/use-sidebar'
import { Fragment } from 'react'

type AppHeaderProps = {
  user: User
  role?: string
  onCommandOpen?: () => void
}

const generateBreadcrumbs = (pathname: string) => {
  const segments = pathname.split('/').filter(Boolean)
  const breadcrumbs: { label: string; href: string }[] = []

  segments.forEach((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/')
    const label = segment.charAt(0).toUpperCase() + segment.slice(1)
    breadcrumbs.push({ label, href })
  })

  return breadcrumbs
}

export const AppHeader = ({ user, role, onCommandOpen }: AppHeaderProps) => {
  const pathname = usePathname()
  const { toggle } = useSidebar()
  const breadcrumbs = generateBreadcrumbs(pathname)

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center gap-4 px-4">
        {/* Mobile menu toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={toggle}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>

        {/* Breadcrumbs */}
        <div className="flex-1">
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((crumb, index) => (
                <Fragment key={crumb.href}>
                  <BreadcrumbItem>
                    {index === breadcrumbs.length - 1 ? (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={crumb.href}>
                        {crumb.label}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                </Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Command menu trigger */}
        <Button
          variant="outline"
          size="sm"
          className="hidden h-9 gap-2 md:flex"
          onClick={onCommandOpen}
        >
          <Search className="h-4 w-4" />
          <span className="text-muted-foreground">Search...</span>
          <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>

        {/* User navigation */}
        <UserNav user={user} role={role} />
      </div>
    </header>
  )
}
