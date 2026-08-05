-- Allow anonymous inserts for device registration (ESP32 uses anon key)
-- The user_id is validated by the app before sending to ESP32

ALTER TABLE devices ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_devices_user_id ON devices(user_id);

ALTER TABLE devices ENABLE ROW LEVEL SECURITY;

-- Allow anyone with anon key to insert (ESP32 registers devices)
DROP POLICY IF EXISTS "Allow anon insert" ON devices;
CREATE POLICY "Allow anon insert" ON devices
  FOR INSERT WITH CHECK (true);

-- Users can only view their own devices
DROP POLICY IF EXISTS "Users can view own devices" ON devices;
CREATE POLICY "Users can view own devices" ON devices
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- Users can update their own devices
DROP POLICY IF EXISTS "Users can update own devices" ON devices;
CREATE POLICY "Users can update own devices" ON devices
  FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

-- Users can delete their own devices
DROP POLICY IF EXISTS "Users can delete own devices" ON devices;
CREATE POLICY "Users can delete own devices" ON devices
  FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);
