-- University pages now show a public "Latest Updates" section fed by uni_updates.
-- Allow anonymous visitors to read non-dismissed items.
CREATE POLICY uni_updates_public_read ON uni_updates
  FOR SELECT TO anon USING (status <> 'dismissed');
