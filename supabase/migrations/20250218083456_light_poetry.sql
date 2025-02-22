/*
  # Add User Identifier System

  1. Changes
    - Add identifier column to profiles and admin_profiles tables
    - Add function to generate unique 6-digit identifier
    - Add trigger to automatically assign identifier on insert

  2. Security
    - Function is security definer to ensure consistent execution
    - Proper error handling for duplicate identifiers
*/

-- Add identifier column to profiles
ALTER TABLE profiles
ADD COLUMN identifier text UNIQUE;

-- Add identifier column to admin_profiles
ALTER TABLE admin_profiles
ADD COLUMN identifier text UNIQUE;

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
        WHEN role = 'client' THEN 'Clt-'
        WHEN role = 'writer' THEN 'Wtr-'
        ELSE 'Adm-'
    END;

    -- Try to generate a unique identifier
    WHILE attempts < max_attempts LOOP
        -- Generate random 6-digit number
        new_id := prefix || LPAD(FLOOR(RANDOM() * 1000000)::text, 6, '0');
        
        -- Check if it exists in profiles
        IF NOT EXISTS (
            SELECT 1 FROM profiles WHERE identifier = new_id
            UNION ALL
            SELECT 1 FROM admin_profiles WHERE identifier = new_id
        ) THEN
            RETURN new_id;
        END IF;
        
        attempts := attempts + 1;
    END LOOP;
    
    RAISE EXCEPTION 'Could not generate unique identifier after % attempts', max_attempts;
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
CREATE TRIGGER set_profile_identifier_trigger
    BEFORE INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION set_profile_identifier();

CREATE TRIGGER set_admin_identifier_trigger
    BEFORE INSERT ON admin_profiles
    FOR EACH ROW
    EXECUTE FUNCTION set_admin_identifier();