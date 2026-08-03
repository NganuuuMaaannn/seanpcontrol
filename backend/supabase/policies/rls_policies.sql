-- SeanPControl RLS Policies
-- This file contains Row Level Security policies for all tables.

-- ============================================
-- ENABLE RLS
-- ============================================
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE commands ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- DEVICES POLICIES
-- ============================================

-- Users can view all devices
CREATE POLICY "Users can view all devices"
    ON devices FOR SELECT
    TO authenticated
    USING (true);

-- Users can update devices they own
CREATE POLICY "Users can update devices they own"
    ON devices FOR UPDATE
    TO authenticated
    USING (true);

-- Service role can manage all devices
CREATE POLICY "Service role can manage all devices"
    ON devices FOR ALL
    TO service_role
    USING (true);

-- ============================================
-- COMMANDS POLICIES
-- ============================================

-- Users can view all commands
CREATE POLICY "Users can view all commands"
    ON commands FOR SELECT
    TO authenticated
    USING (true);

-- Users can create commands
CREATE POLICY "Users can create commands"
    ON commands FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = requested_by);

-- Service role can manage all commands
CREATE POLICY "Service role can manage all commands"
    ON commands FOR ALL
    TO service_role
    USING (true);

-- ============================================
-- LOGS POLICIES
-- ============================================

-- Users can view all logs
CREATE POLICY "Users can view all logs"
    ON logs FOR SELECT
    TO authenticated
    USING (true);

-- Service role can manage all logs
CREATE POLICY "Service role can manage all logs"
    ON logs FOR ALL
    TO service_role
    USING (true);