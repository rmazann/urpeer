'use client'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useActionState, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { updateNotificationPreferences } from '../actions/update-preferences'
import type { NotificationPreferences, NotificationPreferencesState } from '../types'

type NotificationPreferencesFormProps = {
  initialPreferences: NotificationPreferences
}

export const NotificationPreferencesForm = ({
  initialPreferences,
}: NotificationPreferencesFormProps) => {
  const [state, formAction, isPending] = useActionState<NotificationPreferencesState, FormData>(
    updateNotificationPreferences,
    null
  )

  const [preferences, setPreferences] = useState(initialPreferences)

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error)
    }
    if (state?.success) {
      toast.success('Notification preferences updated')
    }
  }, [state])

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <form action={formAction}>
      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <CardDescription>
            Choose which email notifications you&apos;d like to receive.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="new_comment" className="text-base">
                New Comments
              </Label>
              <p className="text-sm text-muted-foreground">
                Get notified when someone comments on your feedback
              </p>
            </div>
            <Switch
              id="new_comment"
              name="new_comment"
              checked={preferences.new_comment}
              onCheckedChange={() => handleToggle('new_comment')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="status_change" className="text-base">
                Status Updates
              </Label>
              <p className="text-sm text-muted-foreground">
                Get notified when your feedback status changes
              </p>
            </div>
            <Switch
              id="status_change"
              name="status_change"
              checked={preferences.status_change}
              onCheckedChange={() => handleToggle('status_change')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="weekly_digest" className="text-base">
                Weekly Digest
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive a weekly summary of activity on feedback you&apos;ve voted on
              </p>
            </div>
            <Switch
              id="weekly_digest"
              name="weekly_digest"
              checked={preferences.weekly_digest}
              onCheckedChange={() => handleToggle('weekly_digest')}
            />
          </div>

          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Preferences'}
          </Button>
        </CardContent>
      </Card>
    </form>
  )
}
