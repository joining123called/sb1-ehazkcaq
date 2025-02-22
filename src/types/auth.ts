export type UserRole = 'client' | 'writer';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  fullName: string;
  role: UserRole;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  role: UserRole;
  identifier: string;
  created_at: string;
  updated_at: string;
}