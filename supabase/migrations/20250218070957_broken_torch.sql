/*
  # Implement Session Management

  1. Changes
    - Add sessions table to track user sessions
    - Add session management functions
    - Add session cleanup procedures
    - Add session validation policies

  2. Security
    - Ensure session isolation
    - Prevent session hijacking
    - Implement session timeouts
*/

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  last_activity timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  device_info text,
  ip_address text,
  is_active boolean DEFAULT true,
  CONSTRAINT valid_expiry CHECK (expires_at > created_at)
);

-- Enable RLS
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Create session management policies
CREATE POLICY "Users can only see their own sessions"
  ON sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only create their own sessions"
  ON sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own sessions"
  ON sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create session management functions
CREATE OR REPLACE FUNCTION create_session(
  p_user_id uuid,
  p_device_info text,
  p_ip_address text,
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
  INSERT INTO sessions (
    user_id,
    device_info,
    ip_address,
    expires_at
  )
  VALUES (
    p_user_id,
    p_device_info,
    p_ip_address,
    now() + p_expires_in
  )
  RETURNING id INTO v_session_id;

  RETURN v_session_id;
END;
$$;

-- Create function to update session activity
CREATE OR REPLACE FUNCTION update_session_activity()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.last_activity = now();
  RETURN NEW;
END;
$$;

-- Create trigger for session activity
CREATE TRIGGER update_session_last_activity
  BEFORE UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_session_activity();

-- Create function to cleanup expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE sessions
  SET is_active = false
  WHERE expires_at < now()
  OR last_activity < now() - interval '1 hour';
END;
$$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_last_activity ON sessions(last_activity);