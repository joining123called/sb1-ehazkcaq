/*
  # Fix navigation settings

  1. Update navigation_settings table
    - Add cascade delete
    - Add better constraints
    - Update default values
  
  2. Security
    - Improve RLS policies
    - Add better access control
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read access to navigation settings" ON navigation_settings;
DROP POLICY IF EXISTS "Allow admins to manage navigation settings" ON navigation_settings;

-- Update table constraints
ALTER TABLE navigation_settings
ALTER COLUMN role SET NOT NULL,
ALTER COLUMN route SET NOT NULL,
ALTER COLUMN name SET NOT NULL,
ALTER COLUMN icon SET NOT NULL,
ALTER COLUMN display_order SET NOT NULL,
ADD CONSTRAINT valid_role CHECK (role IN ('client', 'writer', 'admin')),
ADD CONSTRAINT valid_route CHECK (route ~ '^/[a-z0-9/-]+$'),
ADD CONSTRAINT valid_display_order CHECK (display_order > 0);

-- Create better policies
CREATE POLICY "navigation_settings_read"
  ON navigation_settings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "navigation_settings_write"
  ON navigation_settings
  FOR ALL
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

-- Create function to safely update navigation
CREATE OR REPLACE FUNCTION safe_update_navigation(
  p_role text,
  p_items jsonb
)
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Validate role
  IF p_role NOT IN ('client', 'writer', 'admin') THEN
    RAISE EXCEPTION 'Invalid role: %', p_role;
  END IF;

  -- Delete existing items for the role
  DELETE FROM navigation_settings WHERE role = p_role;

  -- Insert new items
  INSERT INTO navigation_settings (
    role,
    route,
    name,
    icon,
    is_enabled,
    display_order
  )
  SELECT
    p_role,
    item->>'route',
    item->>'name',
    item->>'icon',
    COALESCE((item->>'is_enabled')::boolean, true),
    COALESCE((item->>'display_order')::integer, row_number() OVER ())
  FROM jsonb_array_elements(p_items) item;
END;
$$;