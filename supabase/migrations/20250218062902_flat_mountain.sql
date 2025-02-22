/*
  # Update trigger function with security settings

  1. Changes
    - Recreate the update_updated_at_column function with proper security settings
    - Update trigger for profiles table
    
  2. Security
    - Set explicit search path
    - Add SECURITY DEFINER
    - Ensure proper permissions
*/

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Create function with proper security settings
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS
$$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- Create trigger for profiles table
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();