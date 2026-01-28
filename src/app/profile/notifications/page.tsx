import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { NotificationPreferencesForm } from '@/features/notifications/components/NotificationPreferencesForm'
import { getNotificationPreferences } from '@/features/notifications/actions/update-preferences'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default async function NotificationSettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const preferences = await getNotificationPreferences()

  if (!preferences) {
    redirect('/login')
  }

  return (
    <div className="container max-w-2xl py-8">
      <Link
        href="/profile"
        className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back to Profile
      </Link>

      <h1 className="mb-6 text-2xl font-bold">Notification Settings</h1>

      <NotificationPreferencesForm initialPreferences={preferences} />
    </div>
  )
}
