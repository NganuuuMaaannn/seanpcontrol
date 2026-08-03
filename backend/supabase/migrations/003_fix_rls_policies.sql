-- Fix RLS Policies for ESP32 device updates
-- Run this in Supabase SQL Editor

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all devices" ON devices;
DROP POLICY IF EXISTS "Users can update devices they own" ON devices;
DROP POLICY IF EXISTS "Service role can manage all devices" ON devices;

DROP POLICY IF EXISTS "Users can view all commands" ON commands;
DROP POLICY IF EXISTS "Users can create commands" ON commands;
DROP POLICY IF EXISTS "Service role can manage all commands" ON commands;

DROP POLICY IF EXISTS "Users can view all logs" ON logs;
DROP POLICY IF EXISTS "Service role can manage all logs" ON logs;

-- ============================================
-- DEVICES POLICIES
-- ============================================

-- Allow anyone to view devices
CREATE POLICY "Allow all to view devices"
    ON devices FOR SELECT
    USING (true);

-- Allow anyone to update devices (for ESP32 heartbeats)
CREATE POLICY "Allow all to update devices"
    ON devices FOR UPDATE
    USING (true);

-- Allow anyone to insert devices
CREATE POLICY "Allow all to insert devices"
    ON devices FOR INSERT
    WITH CHECK (true);

-- ============================================
-- COMMANDS POLICIES
-- ============================================

-- Allow anyone to view commands
CREATE POLICY "Allow all to view commands"
    ON commands FOR SELECT
    USING (true);

-- Allow anyone to insert commands
CREATE POLICY "Allow all to insert commands"
    ON commands FOR INSERT
    WITH CHECK (true);

-- Allow anyone to update commands
CREATE POLICY "Allow all to update commands"
    ON commands FOR UPDATE
    USING (true);

-- ============================================
-- LOGS POLICIES
-- ============================================

-- Allow anyone to view logs
CREATE POLICY "Allow all to view logs"
    ON logs FOR SELECT
    USING (true);

-- Allow anyone to insert logs
CREATE POLICY "Allow all to insert logs"
    ON logs FOR INSERT
    WITH CHECK (true);