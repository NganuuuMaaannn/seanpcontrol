-- SeanPControl Database Schema
-- This file contains the complete database schema for the SeanPControl IoT platform.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- DEVICES TABLE
-- Stores information about ESP32 devices
-- ============================================
CREATE TABLE devices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
    device_name VARCHAR(255) NOT NULL,
    device_serial VARCHAR(100) UNIQUE,
    firmware_version VARCHAR(50) NOT NULL DEFAULT '1.0.0',
    status VARCHAR(20) NOT NULL DEFAULT 'offline'
        CHECK (status IN ('offline', 'online', 'busy', 'error')),
    wifi_signal INTEGER DEFAULT -100,
    ip_address VARCHAR(45),
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- COMMANDS TABLE
-- Stores commands sent to devices
-- ============================================
CREATE TABLE commands (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    command VARCHAR(50) NOT NULL
        CHECK (command IN ('power', 'reset', 'shutdown', 'restart', 'wake', 'status', 'heartbeat')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'executing', 'completed', 'failed')),
    requested_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    executed_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- LOGS TABLE
-- Stores execution logs for commands
-- ============================================
CREATE TABLE logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    command VARCHAR(50) NOT NULL,
    success BOOLEAN NOT NULL DEFAULT false,
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_devices_uuid ON devices(uuid);
CREATE INDEX idx_devices_status ON devices(status);
CREATE INDEX idx_devices_last_seen ON devices(last_seen);

CREATE INDEX idx_commands_device_id ON commands(device_id);
CREATE INDEX idx_commands_status ON commands(status);
CREATE INDEX idx_commands_created_at ON commands(created_at);

CREATE INDEX idx_logs_device_id ON logs(device_id);
CREATE INDEX idx_logs_created_at ON logs(created_at);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
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

-- Auto-set last_seen on status update
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

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE commands ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

-- Devices policies
CREATE POLICY "Users can view all devices"
    ON devices FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can update devices they own"
    ON devices FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Service role can manage all devices"
    ON devices FOR ALL
    TO service_role
    USING (true);

-- Commands policies
CREATE POLICY "Users can view all commands"
    ON commands FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can create commands"
    ON commands FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = requested_by);

CREATE POLICY "Service role can manage all commands"
    ON commands FOR ALL
    TO service_role
    USING (true);

-- Logs policies
CREATE POLICY "Users can view all logs"
    ON logs FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Service role can manage all logs"
    ON logs FOR ALL
    TO service_role
    USING (true);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to get device by UUID
CREATE OR REPLACE FUNCTION get_device_by_uuid(device_uuid UUID)
RETURNS SETOF devices AS $$
    SELECT * FROM devices WHERE uuid = device_uuid;
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to get pending commands for a device
CREATE OR REPLACE FUNCTION get_pending_commands(device_uuid UUID)
RETURNS SETOF commands AS $$
    SELECT c.*
    FROM commands c
    JOIN devices d ON c.device_id = d.id
    WHERE d.uuid = device_uuid
    AND c.status = 'pending'
    ORDER BY c.created_at ASC;
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to mark command as executed
CREATE OR REPLACE FUNCTION mark_command_executed(command_id UUID)
RETURNS void AS $$
    UPDATE commands
    SET status = 'completed',
        executed_at = NOW()
    WHERE id = command_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to mark command as failed
CREATE OR REPLACE FUNCTION mark_command_failed(command_id UUID, error_message TEXT)
RETURNS void AS $$
    UPDATE commands
    SET status = 'failed',
        executed_at = NOW()
    WHERE id = command_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to update device heartbeat
CREATE OR REPLACE FUNCTION update_device_heartbeat(device_uuid UUID)
RETURNS void AS $$
    UPDATE devices
    SET last_seen = NOW(),
        updated_at = NOW()
    WHERE uuid = device_uuid;
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to insert command log
CREATE OR REPLACE FUNCTION insert_command_log(
    p_device_id UUID,
    p_command VARCHAR(50),
    p_success BOOLEAN,
    p_message TEXT
)
RETURNS void AS $$
    INSERT INTO logs (device_id, command, success, message)
    VALUES (p_device_id, p_command, p_success, p_message);
$$ LANGUAGE sql SECURITY DEFINER;