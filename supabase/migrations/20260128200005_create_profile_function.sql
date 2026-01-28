-- Create a function to ensure profile exists (bypasses RLS with SECURITY DEFINER)
CREATE OR REPLACE FUNCTION ensure_profile_exists(
  p_user_id UUID,
  p_email TEXT,
  p_full_name TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (p_user_id, p_email, COALESCE(p_full_name, p_email), 'voter')
  ON CONFLICT (id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to setup workspace for user (bypasses RLS with SECURITY DEFINER)
CREATE OR REPLACE FUNCTION setup_user_workspace(
  p_user_id UUID,
  p_workspace_id UUID
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET workspace_id = p_workspace_id, role = 'admin'
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION ensure_profile_exists TO authenticated;
GRANT EXECUTE ON FUNCTION setup_user_workspace TO authenticated;
