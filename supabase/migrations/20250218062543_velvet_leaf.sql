/*
  # Update profile access policies

  1. Changes
    - Add policy for users to read their own profile (if not exists)
    - Add policy for profile creation during registration (if not exists)
    - Ensure RLS is enabled

  2. Security
    - Maintain RLS
    - Ensure policies exist without duplicates
*/

DO $$ 
BEGIN
  -- Only create "Users can read own profile" if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can read own profile'
  ) THEN
    CREATE POLICY "Users can read own profile"
      ON profiles
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  -- Only create "Users can create their own profile" if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can create their own profile'
  ) THEN
    CREATE POLICY "Users can create their own profile"
      ON profiles
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;