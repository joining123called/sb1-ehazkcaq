/*
  # Initial Schema Setup for Academic Platform

  1. Tables
    - profiles
      - id (uuid, primary key)
      - user_id (uuid, references auth.users)
      - role (enum: client, writer)
      - full_name (text)
      - created_at (timestamp)
      - updated_at (timestamp)
    
    - admin_profiles
      - id (uuid, primary key)
      - user_id (uuid, references auth.users)
      - full_name (text)
      - created_at (timestamp)
      - updated_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for user access
*/

-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('client', 'writer');

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  role user_role NOT NULL,
  full_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create admin_profiles table
CREATE TABLE IF NOT EXISTS admin_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  full_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for admin_profiles
CREATE POLICY "Admins can view own profile"
  ON admin_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can update own profile"
  ON admin_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);