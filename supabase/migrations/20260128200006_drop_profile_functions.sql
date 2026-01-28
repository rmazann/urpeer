-- Drop the profile functions that were created
DROP FUNCTION IF EXISTS ensure_profile_exists(UUID, TEXT, TEXT);
DROP FUNCTION IF EXISTS setup_user_workspace(UUID, UUID);
