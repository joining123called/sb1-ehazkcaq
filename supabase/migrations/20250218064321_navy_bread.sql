/*
  # Admin Management Capabilities

  1. New Policies
    - Allow admins to view all profiles
    - Allow admins to update user profiles
    - Allow admins to manage user roles
    
  2. Security
    - Maintain existing user policies
    - Add admin-specific policies
    - Ensure proper access control
*/

-- Add policies for admin access to profiles table
CREATE POLICY "admins_read_all_profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "admins_update_all_profiles"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE user_id = auth.uid()
    )
  );

-- Add policies for admin access to admin_profiles table
CREATE POLICY "admins_read_admin_profiles"
  ON admin_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE user_id = auth.uid()
    )
  );

-- Add function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE user_id = auth.uid()
  );
END;
$$;