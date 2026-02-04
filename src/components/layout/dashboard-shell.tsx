'use client'

import * as React from 'react'
import { User } from '@supabase/supabase-js'

import { cn } from '@/lib/utils'
import { AppSidebar } from './app-sidebar'
import { AppHeader } from './app-header'
import { MobileNav } from './mobile-nav'
import { useSidebar } from '@/hooks/use-sidebar'

type DashboardShellProps = {
  children: React.ReactNode
  user: User
  role?: string
  onCommandOpen?: () => void
}

export const DashboardShell = ({
  children,
  user,
  role,
  onCommandOpen,
}: DashboardShellProps) => {
  const { isCollapsed } = useSidebar()
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false)

  return (
    <div className="relative min-h-screen">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <AppSidebar role={role} />
      </div>

      {/* Mobile navigation */}
      <MobileNav
        user={user}
        role={role}
        open={mobileNavOpen}
        onOpenChange={setMobileNavOpen}
      />

      {/* Main content */}
      <div
        className={cn(
          'min-h-screen transition-all duration-300',
          'md:pl-16',
          !isCollapsed && 'md:pl-64'
        )}
      >
        <AppHeader user={user} role={role} onCommandOpen={onCommandOpen} />
        <main className="container mx-auto p-6">{children}</main>
      </div>
    </div>
  )
}
