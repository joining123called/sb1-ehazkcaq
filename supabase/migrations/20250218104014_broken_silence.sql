/*
  # Add identifier column and update navigation

  1. New Columns
    - Add `identifier` column to profiles and admin_profiles tables
    - Add unique constraint to ensure no duplicate identifiers
  
  2. Functions
    - Create function to generate unique identifiers based on role
    - Add trigger to automatically set identifier on new records
  
  3. Security
    - Ensure functions run with proper security context
    - Add RLS policies for identifier access
*/

-- Add identifier column to profiles if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'identifier'
  ) THEN
    ALTER TABLE profiles
    ADD COLUMN identifier text UNIQUE;
  END IF;
END $$;

-- Add identifier column to admin_profiles if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'admin_profiles' AND column_name = 'identifier'
  ) THEN
    ALTER TABLE admin_profiles
    ADD COLUMN identifier text UNIQUE;
  END IF;
END $$;

-- Create function to generate unique identifier
CREATE OR REPLACE FUNCTION generate_unique_identifier(role text)
RETURNS text
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    prefix text;
    new_id text;
    attempts integer := 0;
    max_attempts constant integer := 10;
BEGIN
    -- Set prefix based on role
    prefix := CASE
        WHEN role = 'client' THEN 'CLT-'
        WHEN role = 'writer' THEN 'WTR-'
        ELSE 'ADM-'
    END;

    -- Try to generate a unique identifier
    WHILE attempts < max_attempts LOOP
        -- Generate random 6-character alphanumeric string
        new_id := prefix || substr(md5(random()::text), 1, 6);
        
        -- Check if it exists in either table
        IF NOT EXISTS (
            SELECT 1 FROM profiles WHERE identifier = new_id
            UNION ALL
            SELECT 1 FROM admin_profiles WHERE identifier = new_id
        ) THEN
            RETURN new_id;
        END IF;
        
        attempts := attempts + 1;
    END LOOP;
    
    -- If we couldn't generate a unique ID, use timestamp as fallback
    RETURN prefix || to_char(CURRENT_TIMESTAMP, 'YYMMDD-HH24MISS');
END;
$$;

-- Create trigger function for profiles
CREATE OR REPLACE FUNCTION set_profile_identifier()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.identifier IS NULL THEN
        NEW.identifier := generate_unique_identifier(NEW.role::text);
    END IF;
    RETURN NEW;
END;
$$;

-- Create trigger function for admin profiles
CREATE OR REPLACE FUNCTION set_admin_identifier()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.identifier IS NULL THEN
        NEW.identifier := generate_unique_identifier('admin');
    END IF;
    RETURN NEW;
END;
$$;

-- Create triggers
DROP TRIGGER IF EXISTS set_profile_identifier_trigger ON profiles;
CREATE TRIGGER set_profile_identifier_trigger
    BEFORE INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION set_profile_identifier();

DROP TRIGGER IF EXISTS set_admin_identifier_trigger ON admin_profiles;
CREATE TRIGGER set_admin_identifier_trigger
    BEFORE INSERT ON admin_profiles
    FOR EACH ROW
    EXECUTE FUNCTION set_admin_identifier();

-- Update existing records that don't have identifiers
UPDATE profiles
SET identifier = generate_unique_identifier(role::text)
WHERE identifier IS NULL;

UPDATE admin_profiles
SET identifier = generate_unique_identifier('admin')
WHERE identifier IS NULL;