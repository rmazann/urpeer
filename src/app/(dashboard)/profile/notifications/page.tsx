import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { NotificationPreferencesForm } from '@/features/notifications/components/NotificationPreferencesForm'
import { getNotificationPreferences } from '@/features/notifications/actions/update-preferences'
import { PageHeader } from '@/components/layout/page-header'

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
    <div className="max-w-2xl space-y-6">
      <PageHeader
        title="Notification Settings"
        description="Manage your email notification preferences"
      />

      <NotificationPreferencesForm initialPreferences={preferences} />
    </div>
  )
}
