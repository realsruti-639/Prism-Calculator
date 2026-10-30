/*
# Create calculations history table

1. New Tables
- `calculations`
  - `id` (uuid, primary key, generated automatically)
  - `expression` (text, not null) - the expression the user typed, e.g. "e^(2) × cos(π/4)"
  - `result` (text, not null) - the formatted result shown on screen, e.g. "5.2248"
  - `created_at` (timestamptz, defaults to now) - when the calculation was run

2. Security
- Enables row level security on `calculations`.
- Grants SELECT, INSERT and DELETE to `anon` and `authenticated` so the calculator can load, save and clear history without sign-in.
- Policies are intentionally open because the history is a single shared calculator log with no accounts.
- No UPDATE access is granted because history entries are never edited.

3. Notes
- A descending index on `created_at` keeps the newest-first history query fast.
*/

CREATE TABLE IF NOT EXISTS calculations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expression text NOT NULL,
  result text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE calculations ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, DELETE ON calculations TO anon, authenticated;

CREATE INDEX IF NOT EXISTS calculations_created_at_idx ON calculations (created_at DESC);

DROP POLICY IF EXISTS "anon_select_calculations" ON calculations;
CREATE POLICY "anon_select_calculations" ON calculations FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_calculations" ON calculations;
CREATE POLICY "anon_insert_calculations" ON calculations FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_calculations" ON calculations;
CREATE POLICY "anon_delete_calculations" ON calculations FOR DELETE
  TO anon, authenticated USING (true);
