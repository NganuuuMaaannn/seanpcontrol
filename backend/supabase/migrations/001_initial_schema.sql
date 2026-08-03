-- SeanPControl Migration 001: Initial Schema
-- This migration creates the initial database schema.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- DEVICES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS devices (
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
-- ============================================
CREATE TABLE IF NOT EXISTS commands (
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
-- ============================================
CREATE TABLE IF NOT EXISTS logs (
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
CREATE INDEX IF NOT EXISTS idx_devices_uuid ON devices(uuid);
CREATE INDEX IF NOT EXISTS idx_devices_status ON devices(status);
CREATE INDEX IF NOT EXISTS idx_devices_last_seen ON devices(last_seen);

CREATE INDEX IF NOT EXISTS idx_commands_device_id ON commands(device_id);
CREATE INDEX IF NOT EXISTS idx_commands_status ON commands(status);
CREATE INDEX IF NOT EXISTS idx_commands_created_at ON commands(created_at);

CREATE INDEX IF NOT EXISTS idx_logs_device_id ON logs(device_id);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs(created_at);