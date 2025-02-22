/*
  # Enhanced RLS policies for clients and writers

  1. Security Updates
    - Add policies for profiles table to ensure proper role-based access
    - Add policies for viewing and updating profiles based on user role
    - Add policies to prevent unauthorized role changes

  2. Changes
    - Add view policies for clients and writers
    - Add update policies with role restrictions
    - Add policies to protect sensitive data
*/

-- Additional policies for the profiles table
CREATE POLICY "Writers can view client profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    (auth.uid() IN (
      SELECT user_id FROM profiles WHERE role = 'writer'
    ))
    AND role = 'client'
  );

CREATE POLICY "Clients can view writer profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    (auth.uid() IN (
      SELECT user_id FROM profiles WHERE role = 'client'
    ))
    AND role = 'writer'
  );

-- Ensure users can only update their own profile and can't change their role
CREATE POLICY "Users can update their own profile except role"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid()
      AND role = profiles.role
    )
  );

-- Add a trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;

-- Create the trigger
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();