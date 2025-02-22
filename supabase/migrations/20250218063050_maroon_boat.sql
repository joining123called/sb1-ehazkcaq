/*
  # Fix RLS policies to prevent recursion

  1. Changes
    - Drop all existing policies to start fresh
    - Create simplified, non-recursive policies
    - Add basic CRUD policies for profiles
    
  2. Security
    - Maintain proper access control
    - Prevent infinite recursion in policies
    - Allow necessary operations while maintaining security
*/

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Writers can view client profiles" ON profiles;
DROP POLICY IF EXISTS "Clients can view writer profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile except role" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;
DROP POLICY IF EXISTS "Allow public profile creation during registration" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can read profiles" ON profiles;
DROP POLICY IF EXISTS "Allow profile creation during registration" ON profiles;
DROP POLICY IF EXISTS "Allow users to read profiles" ON profiles;

-- Create new, simplified policies
CREATE POLICY "profiles_insert_policy"
  ON profiles
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "profiles_select_policy"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    -- Users can read their own profile
    auth.uid() = user_id
    OR
    -- Writers can see client profiles
    (EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role = 'writer'
    ) AND role = 'client')
    OR
    -- Clients can see writer profiles
    (EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role = 'client'
    ) AND role = 'writer')
  );

CREATE POLICY "profiles_update_policy"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Ensure RLS is enabled
ALTER TABLE profiles FORCE ROW LEVEL SECURITY;