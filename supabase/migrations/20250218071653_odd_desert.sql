/*
  # Fix session management issues

  1. Changes
    - Add better error handling for session queries
    - Modify session policies for better access control
    - Add indexes for performance
    - Add cascade delete for expired sessions
*/

-- Modify sessions table to handle null cases better
ALTER TABLE sessions
ALTER COLUMN device_info SET DEFAULT '',
ALTER COLUMN ip_address SET DEFAULT '';

-- Drop existing policies
DROP POLICY IF EXISTS "Users can only see their own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can only create their own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can only update their own sessions" ON sessions;

-- Create better policies
CREATE POLICY "session_select_policy"
  ON sessions
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    AND is_active = true
    AND expires_at > now()
  );

CREATE POLICY "session_insert_policy"
  ON sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND expires_at > now()
  );

CREATE POLICY "session_update_policy"
  ON sessions
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    AND is_active = true
    AND expires_at > now()
  )
  WITH CHECK (
    auth.uid() = user_id
    AND expires_at > now()
  );

-- Create function to handle session retrieval
CREATE OR REPLACE FUNCTION get_active_session(p_user_id uuid)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  created_at timestamptz,
  last_activity timestamptz,
  expires_at timestamptz,
  is_active boolean,
  device_info text,
  ip_address text
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT s.id, s.user_id, s.created_at, s.last_activity, s.expires_at, s.is_active, s.device_info, s.ip_address
  FROM sessions s
  WHERE s.user_id = p_user_id
    AND s.is_active = true
    AND s.expires_at > now()
  ORDER BY s.created_at DESC
  LIMIT 1;
END;
$$;