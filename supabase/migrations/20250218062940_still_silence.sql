/*
  # Fix profile creation and policies

  1. Changes
    - Add policy for public profile creation
    - Ensure profile creation works during registration
    - Add policy for authenticated users to read profiles
    
  2. Security
    - Allow unauthenticated users to create profiles during registration
    - Maintain RLS for other operations
*/

-- Allow public access for profile creation during registration
CREATE POLICY "Allow public profile creation during registration"
  ON profiles
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Ensure authenticated users can read their profiles
CREATE POLICY "Authenticated users can read profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Ensure RLS is enabled
ALTER TABLE profiles FORCE ROW LEVEL SECURITY;