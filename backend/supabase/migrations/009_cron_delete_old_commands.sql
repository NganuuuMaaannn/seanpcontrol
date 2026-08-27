-- Enable pg_cron extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a function to delete commands older than 3 days
CREATE OR REPLACE FUNCTION delete_old_commands()
RETURNS void
LANGUAGE sql
AS $$
  DELETE FROM commands
  WHERE created_at < NOW() - INTERVAL '3 days';
$$;

-- Schedule the cron job to run every day at midnight
SELECT cron.schedule(
  'delete-old-commands',
  '0 0 * * *',
  $$SELECT delete_old_commands()$$
);
