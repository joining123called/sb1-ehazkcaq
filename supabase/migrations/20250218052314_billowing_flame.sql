/*
  # Add insert policies for profiles

  1. Changes
    - Add policy to allow users to create their own profile
    - Add policy to allow admins to create their own profile

  2. Security
    - Users can only insert their own profile data
    - Admins can only insert their own profile data
*/

-- Policy for profiles table
CREATE POLICY "Users can create their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy for admin_profiles table
CREATE POLICY "Admins can create their own profile"
  ON admin_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);