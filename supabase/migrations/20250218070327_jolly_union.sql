/*
  # Add email field to profile tables

  1. Changes
    - Add email column to profiles table
    - Add email column to admin_profiles table
    - Add unique constraints for emails
    - Add trigger to automatically populate email from auth.users

  2. Security
    - Maintain RLS protection
    - Ensure email uniqueness
    - Automatically sync email with auth.users
*/

-- Add email column to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS email text UNIQUE;

-- Add email column to admin_profiles
ALTER TABLE admin_profiles
ADD COLUMN IF NOT EXISTS email text UNIQUE;

-- Create function to sync email from auth.users
CREATE OR REPLACE FUNCTION sync_email_from_auth()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    user_email text;
BEGIN
    -- Get email from auth.users
    SELECT email INTO user_email
    FROM auth.users
    WHERE id = NEW.user_id;

    -- Set email in the profile
    NEW.email = user_email;
    
    RETURN NEW;
END;
$$;

-- Create triggers for both tables
DROP TRIGGER IF EXISTS sync_profiles_email ON profiles;
CREATE TRIGGER sync_profiles_email
    BEFORE INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION sync_email_from_auth();

DROP TRIGGER IF EXISTS sync_admin_profiles_email ON admin_profiles;
CREATE TRIGGER sync_admin_profiles_email
    BEFORE INSERT ON admin_profiles
    FOR EACH ROW
    EXECUTE FUNCTION sync_email_from_auth();

-- Update existing records
UPDATE profiles p
SET email = u.email
FROM auth.users u
WHERE p.user_id = u.id
AND p.email IS NULL;

UPDATE admin_profiles ap
SET email = u.email
FROM auth.users u
WHERE ap.user_id = u.id
AND ap.email IS NULL;