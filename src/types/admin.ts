export interface AdminProfile {
  id: string;
  user_id: string;
  full_name: string;
  identifier: string;
  created_at: string;
  updated_at: string;
}

export interface AdminLoginCredentials {
  email: string;
  password: string;
}

export interface AdminRegisterCredentials {
  email: string;
  password: string;
  fullName: string;
}