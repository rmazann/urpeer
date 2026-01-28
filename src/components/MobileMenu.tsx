'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

type MobileMenuProps = {
  isAdmin: boolean
  isLoggedIn: boolean
  userName?: string
}

export const MobileMenu = ({ isAdmin, isLoggedIn, userName }: MobileMenuProps) => {
  const [open, setOpen] = useState(false)

  const closeMenu = () => setOpen(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden p-2">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[280px]">
        <SheetHeader>
          <SheetTitle>
            <Link href="/" onClick={closeMenu} className="text-xl font-bold">
              Urpeer
            </Link>
          </SheetTitle>
        </SheetHeader>

        <nav className="flex flex-col gap-4 mt-8">
          <Link
            href="/feedback"
            onClick={closeMenu}
            className="text-lg font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Feedback
          </Link>
          <Link
            href="/roadmap"
            onClick={closeMenu}
            className="text-lg font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Roadmap
          </Link>
          <Link
            href="/changelog"
            onClick={closeMenu}
            className="text-lg font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Changelog
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              onClick={closeMenu}
              className="text-lg font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Admin
            </Link>
          )}

          <div className="border-t my-4" />

          {isLoggedIn ? (
            <>
              <Link
                href="/profile"
                onClick={closeMenu}
                className="text-lg font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Profile {userName && `(${userName})`}
              </Link>
              <form action="/api/auth/logout" method="POST">
                <Button variant="outline" className="w-full" type="submit">
                  Logout
                </Button>
              </form>
            </>
          ) : (
            <div className="flex flex-col gap-2">
              <Link href="/login" onClick={closeMenu}>
                <Button variant="outline" className="w-full">
                  Login
                </Button>
              </Link>
              <Link href="/signup" onClick={closeMenu}>
                <Button className="w-full">Sign Up</Button>
              </Link>
            </div>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
