/*
  # Fix navigation and routing

  1. Add navigation settings table
    - Store navigation items per role
    - Allow customization of navigation items
    - Enable/disable specific routes
  
  2. Security
    - Add RLS policies for navigation settings
    - Ensure proper access control
*/

-- Create navigation_settings table
CREATE TABLE IF NOT EXISTS navigation_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role text NOT NULL,
  route text NOT NULL,
  name text NOT NULL,
  icon text NOT NULL,
  is_enabled boolean DEFAULT true,
  display_order integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(role, route)
);

-- Enable RLS
ALTER TABLE navigation_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access to navigation settings"
  ON navigation_settings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow admins to manage navigation settings"
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

-- Insert default navigation settings
INSERT INTO navigation_settings (role, route, name, icon, display_order) VALUES
  -- Client navigation
  ('client', '/dashboard/client', 'Dashboard', 'LayoutDashboard', 1),
  ('client', '/orders', 'My Orders', 'FileText', 2),
  ('client', '/messages', 'Messages', 'MessageSquare', 3),
  ('client', '/payments', 'Payments', 'Wallet', 4),
  
  -- Writer navigation
  ('writer', '/dashboard/writer', 'Dashboard', 'LayoutDashboard', 1),
  ('writer', '/available-orders', 'Available Orders', 'BookOpen', 2),
  ('writer', '/active-projects', 'Active Projects', 'Clock', 3),
  ('writer', '/messages', 'Messages', 'MessageSquare', 4),
  ('writer', '/earnings', 'Earnings', 'Wallet', 5),
  
  -- Admin navigation
  ('admin', '/admin/dashboard', 'Dashboard', 'LayoutDashboard', 1),
  ('admin', '/admin/users', 'Users', 'Users', 2),
  ('admin', '/admin/orders', 'Orders', 'FileText', 3),
  ('admin', '/admin/security', 'Security', 'ShieldCheck', 4);

-- Create function to update navigation settings
CREATE OR REPLACE FUNCTION update_navigation_settings(
  p_role text,
  p_route text,
  p_name text,
  p_icon text,
  p_is_enabled boolean DEFAULT true,
  p_display_order integer DEFAULT NULL
)
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO navigation_settings (role, route, name, icon, is_enabled, display_order)
  VALUES (p_role, p_route, p_name, p_icon, p_is_enabled, COALESCE(p_display_order, 
    (SELECT COALESCE(MAX(display_order), 0) + 1 FROM navigation_settings WHERE role = p_role)
  ))
  ON CONFLICT (role, route)
  DO UPDATE SET
    name = EXCLUDED.name,
    icon = EXCLUDED.icon,
    is_enabled = EXCLUDED.is_enabled,
    display_order = EXCLUDED.display_order,
    updated_at = now();
END;
$$;