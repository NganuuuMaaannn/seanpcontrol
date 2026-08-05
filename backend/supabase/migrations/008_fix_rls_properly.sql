-- Fix RLS: allow ESP32 to insert (anon key), app to query (JWT)

-- Make sure user_id column exists
ALTER TABLE devices ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_devices_user_id ON devices(user_id);

-- Enable RLS
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;

-- Drop all old policies
DROP POLICY IF EXISTS "Users can view own devices" ON devices;
DROP POLICY IF EXISTS "Users can insert own devices" ON devices;
DROP POLICY IF EXISTS "Users can update own devices" ON devices;
DROP POLICY IF EXISTS "Users can delete own devices" ON devices;
DROP POLICY IF EXISTS "Allow anon insert" ON devices;

-- ESP32 can insert (uses anon key, no JWT)
CREATE POLICY "device_insert" ON devices
  FOR INSERT WITH CHECK (true);

-- App (logged-in user) can read their own devices
CREATE POLICY "device_select" ON devices
  FOR SELECT USING (auth.uid() = user_id);

-- App can update their own devices
CREATE POLICY "device_update" ON devices
  FOR UPDATE USING (auth.uid() = user_id);

-- App can delete their own devices
CREATE POLICY "device_delete" ON devices
  FOR DELETE USING (auth.uid() = user_id);
