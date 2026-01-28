-- Add notification preferences to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_notifications JSONB DEFAULT '{
  "new_comment": true,
  "status_change": true,
  "weekly_digest": false
}'::jsonb;

-- Comment for documentation
COMMENT ON COLUMN profiles.email_notifications IS 'JSON object containing email notification preferences: new_comment, status_change, weekly_digest';
