/*
  # Simplify RLS policies to prevent recursion

  1. Changes
    - Drop all existing policies
    - Create new, non-recursive policies using simpler logic
    - Implement role-based access without nested queries
    
  2. Security
    - Maintain proper access control
    - Prevent infinite recursion
    - Allow necessary operations while maintaining security
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;

-- Create new, simplified policies
CREATE POLICY "allow_profile_creation"
  ON profiles
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "read_own_profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "read_writer_profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (role = 'writer');

CREATE POLICY "read_client_profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (role = 'client');

CREATE POLICY "update_own_profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Ensure RLS is enabled
ALTER TABLE profiles FORCE ROW LEVEL SECURITY;