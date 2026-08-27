-- Auto-set executed_at when command status changes to completed or failed
CREATE OR REPLACE FUNCTION update_command_executed_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status IN ('completed', 'failed') AND OLD.status NOT IN ('completed', 'failed') THEN
    NEW.executed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_command_executed_at
  BEFORE UPDATE ON commands
  FOR EACH ROW
  EXECUTE FUNCTION update_command_executed_at();
