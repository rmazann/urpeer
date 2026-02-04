'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from './theme-toggle'
import { useSidebar } from '@/hooks/use-sidebar'
import { filterNavigationByRole } from '@/lib/navigation'

type AppSidebarProps = {
  role?: string
}

export const AppSidebar = ({ role }: AppSidebarProps) => {
  const pathname = usePathname()
  const { isCollapsed, toggle } = useSidebar()
  const navigation = filterNavigationByRole(role)

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-50 h-screen border-r bg-background transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-14 items-center justify-between border-b px-4">
          {!isCollapsed && (
            <Link href="/feedback" className="flex items-center font-bold">
              <span className="text-xl">Urpeer</span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={cn('h-8 w-8', isCollapsed && 'mx-auto')}
            onClick={toggle}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-6">
            {navigation.map((section, sectionIndex) => (
              <div key={sectionIndex} className="space-y-2">
                {section.title && !isCollapsed && (
                  <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {section.title}
                  </h3>
                )}
                {section.title && isCollapsed && sectionIndex > 0 && (
                  <Separator />
                )}
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

                    return (
                      <Link key={item.href} href={item.href}>
                        <Button
                          variant={isActive ? 'secondary' : 'ghost'}
                          className={cn(
                            'w-full justify-start',
                            isCollapsed && 'justify-center px-2'
                          )}
                        >
                          <Icon className={cn('h-4 w-4', !isCollapsed && 'mr-3')} />
                          {!isCollapsed && (
                            <>
                              <span>{item.title}</span>
                              {item.badge && (
                                <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                                  {item.badge}
                                </span>
                              )}
                            </>
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

        {/* Footer */}
        <div className="border-t p-4">
          <div className={cn('flex items-center', isCollapsed ? 'justify-center' : 'justify-end')}>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </aside>
  )
}
