/*
# Create profiles ledger linked to sign-in accounts

1. New Tables
- `profiles`
  - `id` (uuid, primary key). Same value as the account's id in the built-in sign-in table, and removed when that account is deleted.
  - `email` (text). Copied from the account when the profile is created.
  - `is_premium` (boolean, default false). Controls whether the account has Pro access.
  - `updated_at` (timestamptz). Set automatically whenever the row changes.

2. Automation
- A trigger creates a profile with Pro access set to false for every new account.
- Existing accounts are backfilled with a profile so none are left without one.

3. Security
- Row level security is on. Signed-in users can read only their own profile row.
- Signed-in users have no insert, update, or delete access, so they cannot grant themselves Pro access.
- The trigger functions are not callable by any client role.

4. Notes
- Pro access is granted only by server-side code or an administrator, never by the app's browser code.
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  is_premium boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON profiles TO authenticated;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_account_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, is_premium)
  VALUES (NEW.id, NEW.email, false)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_account_profile() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_account_profile();

CREATE OR REPLACE FUNCTION public.set_profile_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.set_profile_updated_at() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_profile_updated_at();

INSERT INTO profiles (id, email, is_premium)
SELECT id, email, false FROM auth.users
ON CONFLICT (id) DO NOTHING;
