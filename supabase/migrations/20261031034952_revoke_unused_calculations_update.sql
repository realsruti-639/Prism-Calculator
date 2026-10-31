/*
# Remove unused UPDATE access on calculations

1. Modified Tables
- `calculations`: UPDATE access is removed from the signed-out (anon) and signed-in (authenticated) roles.

2. Security
- History entries are never edited, so no role needs UPDATE. Removing it leaves only the privileges the app uses.

3. Notes
- No rows or policies are changed.
*/

REVOKE UPDATE ON calculations FROM anon, authenticated;
