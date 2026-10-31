/*
# Scope calculation history to each signed-in user

1. Modified Tables
- `calculations`
  - New column `user_id` (uuid). It links each row to the account that created it, defaults to the currently signed-in user, and is removed automatically if that account is deleted.
  - Existing rows are kept. They have no owner, so no account can read them through the app.

2. Security
- Removed the open policies that let anyone read, add, and delete every row.
- Removed direct access for the anonymous (signed-out) role.
- Added owner-only SELECT, INSERT, and DELETE policies for signed-in users. Each one checks that user_id matches the signed-in user.
- No UPDATE access, matching the previous design.

3. Notes
- Guest history is kept in the browser and does not use this table.
- A new index on user_id and created_at keeps each user's newest-first history fast.
*/

ALTER TABLE calculations ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();

CREATE INDEX IF NOT EXISTS calculations_user_created_idx ON calculations (user_id, created_at DESC);

REVOKE SELECT, INSERT, DELETE ON calculations FROM anon;
GRANT SELECT, INSERT, DELETE ON calculations TO authenticated;

DROP POLICY IF EXISTS "anon_select_calculations" ON calculations;
DROP POLICY IF EXISTS "anon_insert_calculations" ON calculations;
DROP POLICY IF EXISTS "anon_delete_calculations" ON calculations;

DROP POLICY IF EXISTS "select_own_calculations" ON calculations;
CREATE POLICY "select_own_calculations" ON calculations FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_calculations" ON calculations;
CREATE POLICY "insert_own_calculations" ON calculations FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_calculations" ON calculations;
CREATE POLICY "delete_own_calculations" ON calculations FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
