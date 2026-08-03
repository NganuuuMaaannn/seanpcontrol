CREATE UNIQUE INDEX IF NOT EXISTS idx_one_pending_per_device_command 
ON commands (device_id, command) 
WHERE status = 'pending';