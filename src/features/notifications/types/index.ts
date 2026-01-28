export type NotificationPreferences = {
  new_comment: boolean
  status_change: boolean
  weekly_digest: boolean
}

export type NotificationPreferencesState = {
  error?: string
  success?: boolean
} | null
