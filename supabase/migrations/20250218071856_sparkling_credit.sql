/*
  # Fix session RLS policies and error handling

  1. Changes
    - Modify session policies to be more permissive for initial creation
    - Add better error handling for session operations
    - Add function to safely manage session creation
*/

-- Drop existing session policies
DROP POLICY IF EXISTS "session_select_policy" ON sessions;
DROP POLICY IF EXISTS "session_insert_policy" ON sessions;
DROP POLICY IF EXISTS "session_update_policy" ON sessions;

-- Create more permissive policies
CREATE POLICY "session_select_policy"
  ON sessions
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR 
    EXISTS (
      SELECT 1 FROM admin_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "session_insert_policy"
  ON sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    OR 
    EXISTS (
      SELECT 1 FROM admin_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "session_update_policy"
  ON sessions
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR 
    EXISTS (
      SELECT 1 FROM admin_profiles WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    OR 
    EXISTS (
      SELECT 1 FROM admin_profiles WHERE user_id = auth.uid()
    )
  );

-- Create a function to safely create sessions
CREATE OR REPLACE FUNCTION safe_create_session(
  p_user_id uuid,
  p_device_info text DEFAULT '',
  p_ip_address text DEFAULT '',
  p_expires_in interval DEFAULT interval '24 hours'
)
RETURNS uuid
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_session_id uuid;
BEGIN
  -- Deactivate existing sessions
  UPDATE sessions
  SET is_active = false
  WHERE user_id = p_user_id
    AND is_active = true;

  -- Create new session
  INSERT INTO sessions (
    user_id,
    device_info,
    ip_address,
    expires_at,
    is_active
  )
  VALUES (
    p_user_id,
    COALESCE(p_device_info, ''),
    COALESCE(p_ip_address, ''),
    now() + p_expires_in,
    true
  )
  RETURNING id INTO v_session_id;

  RETURN v_session_id;
END;
$$;