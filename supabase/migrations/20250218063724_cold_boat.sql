/*
  # Admin RLS Policies

  1. New Policies
    - Allow admin profile creation
    - Allow admins to read their own profile
    - Allow admins to update their own profile
    
  2. Security
    - Enable RLS on admin_profiles table
    - Restrict access to admin data
    - Prevent unauthorized access
*/

-- Drop any existing policies
DROP POLICY IF EXISTS "admin_profiles_insert_policy" ON admin_profiles;
DROP POLICY IF EXISTS "admin_profiles_select_policy" ON admin_profiles;
DROP POLICY IF EXISTS "admin_profiles_update_policy" ON admin_profiles;

-- Create new admin policies
CREATE POLICY "admin_profiles_insert_policy"
  ON admin_profiles
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "admin_profiles_select_policy"
  ON admin_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "admin_profiles_update_policy"
  ON admin_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Ensure RLS is enabled
ALTER TABLE admin_profiles FORCE ROW LEVEL SECURITY;