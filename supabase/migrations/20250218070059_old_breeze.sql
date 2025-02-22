/*
  # Fix admin profiles policies

  1. Changes
    - Drop existing policies that cause infinite recursion
    - Create simplified policies for admin_profiles table
    - Remove recursive policy checks

  2. Security
    - Maintain RLS protection
    - Ensure admins can only access their own profiles
    - Allow profile creation during registration
*/

-- Drop all existing policies for admin_profiles
DROP POLICY IF EXISTS "admin_profiles_insert_policy" ON admin_profiles;
DROP POLICY IF EXISTS "admin_profiles_select_policy" ON admin_profiles;
DROP POLICY IF EXISTS "admin_profiles_update_policy" ON admin_profiles;
DROP POLICY IF EXISTS "admins_read_admin_profiles" ON admin_profiles;
DROP POLICY IF EXISTS "Admins can view own profile" ON admin_profiles;
DROP POLICY IF EXISTS "Admins can update own profile" ON admin_profiles;
DROP POLICY IF EXISTS "Admins can create their own profile" ON admin_profiles;

-- Create new, simplified policies
CREATE POLICY "allow_admin_profile_creation"
  ON admin_profiles
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "allow_admin_profile_select"
  ON admin_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "allow_admin_profile_update"
  ON admin_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Ensure RLS is enabled
ALTER TABLE admin_profiles FORCE ROW LEVEL SECURITY;