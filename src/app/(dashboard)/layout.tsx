'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'

import { DashboardShell } from '@/components/layout/dashboard-shell'
import { CommandMenu } from '@/components/command-menu'
import { createClient } from '@/lib/supabase/client'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [user, setUser] = React.useState<User | null>(null)
  const [role, setRole] = React.useState<string | undefined>(undefined)
  const [loading, setLoading] = React.useState(true)
  const [commandOpen, setCommandOpen] = React.useState(false)

  React.useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)

      // Fetch profile to get role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, workspace_id')
        .eq('id', user.id)
        .single()

      if (!profile?.workspace_id) {
        router.push('/onboarding')
        return
      }

      setRole(profile.role)
      setLoading(false)
    }

    checkAuth()
  }, [router])

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <>
      <DashboardShell
        user={user}
        role={role}
        onCommandOpen={() => setCommandOpen(true)}
      >
        {children}
      </DashboardShell>
      <CommandMenu open={commandOpen} onOpenChange={setCommandOpen} role={role} />
    </>
  )
}
