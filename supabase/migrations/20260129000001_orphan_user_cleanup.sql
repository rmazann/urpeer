-- Orphan User Cleanup Function
-- This function identifies and cleans up auth users without corresponding profiles
-- These orphaned users can occur if profile creation fails during signup

-- Function to find orphaned auth users (users without profiles)
CREATE OR REPLACE FUNCTION find_orphaned_auth_users()
RETURNS TABLE (
  user_id uuid,
  email text,
  created_at timestamptz,
  age_hours numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Find auth users that don't have a corresponding profile
  -- Only consider users older than 1 hour to avoid false positives during signup
  RETURN QUERY
  SELECT
    au.id,
    CAST(au.email AS text),
    au.created_at,
    CAST(EXTRACT(EPOCH FROM (NOW() - au.created_at)) / 3600 AS numeric)
  FROM auth.users au
  LEFT JOIN public.profiles p ON p.id = au.id
  WHERE p.id IS NULL
    AND au.created_at < NOW() - INTERVAL '1 hour'
  ORDER BY au.created_at DESC;
END;
$$;

-- Function to cleanup orphaned auth users
-- This should be run manually or via a scheduled job (cron)
CREATE OR REPLACE FUNCTION cleanup_orphaned_auth_users(
  min_age_hours integer DEFAULT 24
)
RETURNS TABLE (
  deleted_user_id uuid,
  deleted_email text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_user_email text;
  v_deleted_count integer := 0;
BEGIN
  -- Only delete users that:
  -- 1. Don't have a profile
  -- 2. Are older than min_age_hours (default 24 hours)
  -- This prevents accidentally deleting users mid-signup

  FOR v_user_id, v_user_email IN
    SELECT
      au.id,
      CAST(au.email AS text)
    FROM auth.users au
    LEFT JOIN public.profiles p ON p.id = au.id
    WHERE p.id IS NULL
      AND au.created_at < NOW() - (min_age_hours || ' hours')::INTERVAL
  LOOP
    -- Delete the orphaned auth user
    DELETE FROM auth.users WHERE id = v_user_id;

    v_deleted_count := v_deleted_count + 1;

    -- Return each deleted user
    deleted_user_id := v_user_id;
    deleted_email := v_user_email;
    RETURN NEXT;

    -- Log the deletion
    RAISE NOTICE 'Deleted orphaned auth user: % (id: %)', v_user_email, v_user_id;
  END LOOP;

  RAISE NOTICE 'Cleanup complete. Deleted % orphaned auth user(s)', v_deleted_count;

  RETURN;
END;
$$;

-- Add helpful comments
COMMENT ON FUNCTION find_orphaned_auth_users() IS
'Returns a list of auth users that do not have corresponding profiles. Only includes users older than 1 hour.';

COMMENT ON FUNCTION cleanup_orphaned_auth_users(integer) IS
'Deletes orphaned auth users (users without profiles) that are older than the specified hours (default 24). Returns the list of deleted users.';

-- Grant execute permissions to service role
GRANT EXECUTE ON FUNCTION find_orphaned_auth_users() TO service_role;
GRANT EXECUTE ON FUNCTION cleanup_orphaned_auth_users(integer) TO service_role;

-- Example usage (commented out - run manually when needed):
--
-- To check for orphaned users:
-- SELECT * FROM find_orphaned_auth_users();
--
-- To cleanup orphaned users older than 24 hours:
-- SELECT * FROM cleanup_orphaned_auth_users(24);
--
-- To cleanup orphaned users older than 1 hour (more aggressive):
-- SELECT * FROM cleanup_orphaned_auth_users(1);
