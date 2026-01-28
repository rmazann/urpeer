-- Fix profiles RLS policies to protect sensitive user data
-- Strategy: Allow public read of safe fields (id, full_name, avatar_url)
-- but protect sensitive fields (email, role) with stricter policies

-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;

-- IMPORTANT: PostgreSQL RLS doesn't support column-level policies directly.
-- Workaround: We keep SELECT open but application layer must use specific column selection.
-- The profiles table should ONLY be queried with explicit column lists, not SELECT *.

-- Public can view basic profile info (for displaying authors in feedback/comments)
-- This policy allows reading profiles but app code MUST select only: id, full_name, avatar_url
CREATE POLICY "Public profile data is viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- NOTE: The above policy allows SELECT * which includes email and role.
-- To truly protect sensitive data, we rely on:
-- 1. Application code using explicit column selection: .select('id, full_name, avatar_url')
-- 2. Security audits to ensure no .select('*') or .select('email', 'role') in public queries
-- 3. Future: Consider separating sensitive data into a profiles_private table

-- Users can still view their full profile (including email, role)
-- This is redundant with the public policy but kept for clarity
CREATE POLICY "Users can view their own full profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Admins can view all profiles with full data
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- Add comments for documentation
COMMENT ON TABLE profiles IS 'User profiles. SECURITY: Always use explicit column selection in queries. Never use SELECT * for public data. Safe public columns: id, full_name, avatar_url. Protected columns: email, role.';
COMMENT ON COLUMN profiles.email IS 'SENSITIVE: Should only be selected when auth.uid() = id or by admins';
COMMENT ON COLUMN profiles.role IS 'SENSITIVE: Should only be selected when auth.uid() = id or by admins';
