-- Reset all profiles RLS policies to fix permission issues
-- This migration drops ALL existing policies and recreates them cleanly

-- Drop ALL existing profiles policies
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Public profile data is viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can view their own full profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Recreate all policies with correct permissions

-- 1. SELECT: Everyone can view profiles (for displaying author names)
CREATE POLICY "profiles_select_all"
  ON profiles FOR SELECT
  USING (true);

-- 2. INSERT: Users can only insert their own profile
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 3. UPDATE: Users can only update their own profile
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Verify RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
