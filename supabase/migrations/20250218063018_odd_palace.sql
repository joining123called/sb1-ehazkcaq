/*
  # Fix profile access and creation policies

  1. Changes
    - Simplify profile access policies
    - Ensure profile creation works during registration
    - Clean up duplicate policies
    
  2. Security
    - Maintain RLS while allowing necessary access
    - Ensure proper profile creation during signup
*/

-- Drop potentially conflicting policies
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;
DROP POLICY IF EXISTS "Allow public profile creation during registration" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can read profiles" ON profiles;

-- Create simplified policies
CREATE POLICY "Allow profile creation during registration"
  ON profiles
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow users to read profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Ensure RLS is enabled
ALTER TABLE profiles FORCE ROW LEVEL SECURITY;