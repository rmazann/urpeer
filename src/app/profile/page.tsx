import { requireAuth } from '@/lib/utils/auth'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Bell, ChevronRight } from 'lucide-react'

const updateProfile = async (formData: FormData): Promise<void> => {
  'use server'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const fullName = formData.get('fullName') as string

  if (!fullName || fullName.length < 2) {
    // In a real app, we'd handle this error better
    return
  }

  await supabase
    .from('profiles')
    .update({ full_name: fullName })
    .eq('id', user.id)

  revalidatePath('/profile')
  revalidatePath('/', 'layout')
}

export default async function ProfilePage() {
  const user = await requireAuth()
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="container mx-auto max-w-2xl py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>Manage your account settings</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={profile?.email || user.email || ''}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                defaultValue={profile?.full_name || ''}
                placeholder="Enter your full name"
                required
                minLength={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Input
                value={profile?.role === 'admin' ? 'Administrator' : 'Voter'}
                disabled
                className="bg-muted"
              />
            </div>
            <Button type="submit">Update Profile</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Manage your notification and display preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Link
            href="/profile/notifications"
            className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
          >
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Notification Settings</p>
                <p className="text-sm text-muted-foreground">
                  Manage your email notification preferences
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
