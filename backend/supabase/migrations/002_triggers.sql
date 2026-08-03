-- SeanPControl Migration 002: Triggers
-- This migration creates database triggers.

-- ============================================
-- AUTO-UPDATE UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_devices_updated_at
    BEFORE UPDATE ON devices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- AUTO-UPDATE LAST_SEEN TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_last_seen()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'online' THEN
        NEW.last_seen = NOW();
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_devices_last_seen
    BEFORE UPDATE ON devices
    FOR EACH ROW
    EXECUTE FUNCTION update_last_seen();