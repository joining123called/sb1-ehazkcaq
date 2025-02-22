/*
  # Add additional profile fields

  1. Changes
    - Add bio, avatar_url, and preferences columns to profiles table
    - Add bio, avatar_url, and preferences columns to admin_profiles table
    - Add metadata fields like phone, address, timezone
    - Add validation checks for phone numbers and email formats

  2. Security
    - Maintain existing RLS policies
    - Add validation constraints
*/

-- Add fields to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS avatar_url text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'UTC',
ADD COLUMN IF NOT EXISTS preferences jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS last_login timestamptz,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active',
ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false,
ADD CONSTRAINT phone_format CHECK (phone ~ '^[+]?[0-9\s-()]+$'),
ADD CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Add fields to admin_profiles table
ALTER TABLE admin_profiles
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS avatar_url text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS department text,
ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'UTC',
ADD COLUMN IF NOT EXISTS permissions jsonb DEFAULT '{"canManageUsers": true}'::jsonb,
ADD COLUMN IF NOT EXISTS last_login timestamptz,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active',
ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false,
ADD CONSTRAINT admin_phone_format CHECK (phone ~ '^[+]?[0-9\s-()]+$'),
ADD CONSTRAINT admin_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Create function to update last_login
CREATE OR REPLACE FUNCTION update_last_login()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.last_login = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- Create triggers for last_login
DROP TRIGGER IF EXISTS update_profiles_last_login ON profiles;
CREATE TRIGGER update_profiles_last_login
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    WHEN (OLD.last_login IS DISTINCT FROM NEW.last_login)
    EXECUTE FUNCTION update_last_login();

DROP TRIGGER IF EXISTS update_admin_profiles_last_login ON admin_profiles;
CREATE TRIGGER update_admin_profiles_last_login
    BEFORE UPDATE ON admin_profiles
    FOR EACH ROW
    WHEN (OLD.last_login IS DISTINCT FROM NEW.last_login)
    EXECUTE FUNCTION update_last_login();

-- Add indexes for frequently queried fields
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_admin_profiles_email ON admin_profiles(email);
CREATE INDEX IF NOT EXISTS idx_admin_profiles_status ON admin_profiles(status);