export interface Session {
  id: string;
  user_id: string;
  created_at: string;
  last_activity: string;
  expires_at: string;
  is_active: boolean;
  device_info?: string;
  ip_address?: string;
  metadata?: Record<string, unknown>;
}