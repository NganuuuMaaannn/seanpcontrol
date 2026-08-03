CREATE OR REPLACE FUNCTION insert_command_if_none_pending(
  p_device_id UUID,
  p_command TEXT
)
RETURNS TABLE (
  id UUID,
  device_id UUID,
  command TEXT,
  status TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM commands
    WHERE commands.device_id = p_device_id
      AND commands.command = p_command
      AND commands.status = 'pending'
  ) THEN
    RETURN;
  END IF;

  RETURN QUERY
  INSERT INTO commands (device_id, command, status)
  VALUES (p_device_id, p_command, 'pending')
  RETURNING commands.id, commands.device_id, commands.command, commands.status, commands.created_at;
END;
$$;