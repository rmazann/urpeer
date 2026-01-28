-- Restore missing INSERT and UPDATE policies for profiles table
-- Migration 20260128200002 only updated SELECT policies but didn't preserve INSERT/UPDATE

-- Drop any conflicting policies first (in case they exist from the original schema)
DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Recreate INSERT policy
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Recreate UPDATE policy with both USING and WITH CHECK clauses
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
