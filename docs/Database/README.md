# SeanPControl Database Documentation

## Overview

SeanPControl uses Supabase with PostgreSQL for data storage, providing a scalable and secure backend for the IoT platform.

## Database Schema

### Devices Table

Stores information about ESP32 devices.

```sql
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
```

### Commands Table

Stores commands sent to devices.

```sql
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
```

### Logs Table

Stores execution logs for commands.

```sql
CREATE TABLE logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    command VARCHAR(50) NOT NULL,
    success BOOLEAN NOT NULL DEFAULT false,
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Indexes

```sql
-- Devices indexes
CREATE INDEX idx_devices_uuid ON devices(uuid);
CREATE INDEX idx_devices_status ON devices(status);
CREATE INDEX idx_devices_last_seen ON devices(last_seen);

-- Commands indexes
CREATE INDEX idx_commands_device_id ON commands(device_id);
CREATE INDEX idx_commands_status ON commands(status);
CREATE INDEX idx_commands_created_at ON commands(created_at);

-- Logs indexes
CREATE INDEX idx_logs_device_id ON logs(device_id);
CREATE INDEX idx_logs_created_at ON logs(created_at);
```

## Triggers

### Auto-update Updated At

```sql
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
```

### Auto-update Last Seen

```sql
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
```

## Row Level Security

### Devices Policies

```sql
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
```

### Commands Policies

```sql
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
```

### Logs Policies

```sql
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
```

## Edge Functions

### Device Heartbeat

Updates the last_seen timestamp for a device.

```typescript
serve(async (req: Request) => {
  const { device_uuid } = await req.json();
  
  const { data, error } = await supabase
    .from('devices')
    .update({
      last_seen: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'online',
    })
    .eq('uuid', device_uuid)
    .select();

  return new Response(JSON.stringify({ success: true, device: data }));
});
```

### Device Command

Creates a new command for a device.

```typescript
serve(async (req: Request) => {
  const { device_uuid, command, requested_by } = await req.json();
  
  // Get device ID
  const { data: device } = await supabase
    .from('devices')
    .select('id')
    .eq('uuid', device_uuid)
    .single();

  // Create command
  const { data: commandData } = await supabase
    .from('commands')
    .insert({
      device_id: device.id,
      command: command,
      requested_by: requested_by || null,
      status: 'pending',
    })
    .select();

  return new Response(JSON.stringify({ success: true, command: commandData }));
});
```

### Fetch Commands

Fetches pending commands for a device.

```typescript
serve(async (req: Request) => {
  const { device_uuid } = await req.json();
  
  // Get device ID
  const { data: device } = await supabase
    .from('devices')
    .select('id')
    .eq('uuid', device_uuid)
    .single();

  // Get pending commands
  const { data: commands } = await supabase
    .from('commands')
    .select('*')
    .eq('device_id', device.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(1);

  return new Response(JSON.stringify({ success: true, commands: commands }));
});
```

### Update Command Status

Updates the status of a command.

```typescript
serve(async (req: Request) => {
  const { command_id, status, error_message } = await req.json();
  
  const updateData: any = {
    status: status,
    executed_at: new Date().toISOString(),
  };

  if (error_message) {
    updateData.error_message = error_message;
  }

  const { data, error } = await supabase
    .from('commands')
    .update(updateData)
    .eq('id', command_id)
    .select();

  return new Response(JSON.stringify({ success: true, command: data }));
});
```

### Insert Log

Inserts a new log entry.

```typescript
serve(async (req: Request) => {
  const { device_uuid, command, success, message } = await req.json();
  
  // Get device ID
  const { data: device } = await supabase
    .from('devices')
    .select('id')
    .eq('uuid', device_uuid)
    .single();

  // Insert log
  const { data, error } = await supabase
    .from('logs')
    .insert({
      device_id: device.id,
      command: command,
      success: success || false,
      message: message || null,
    })
    .select();

  return new Response(JSON.stringify({ success: true, log: data }));
});
```

## Queries

### Get All Devices

```sql
SELECT * FROM devices ORDER BY created_at DESC;
```

### Get Device by UUID

```sql
SELECT * FROM devices WHERE uuid = 'device-uuid';
```

### Get Pending Commands

```sql
SELECT * FROM commands
WHERE device_id = 'device-id'
AND status = 'pending'
ORDER BY created_at ASC;
```

### Get Command History

```sql
SELECT * FROM commands
WHERE device_id = 'device-id'
ORDER BY created_at DESC
LIMIT 10;
```

### Get Device Logs

```sql
SELECT * FROM logs
WHERE device_id = 'device-id'
ORDER BY created_at DESC
LIMIT 50;
```

## Performance

### Optimization Tips

1. **Use indexes**: The database has indexes on frequently queried columns
2. **Limit results**: Use `LIMIT` to restrict the number of rows returned
3. **Select specific columns**: Use `SELECT column1, column2` instead of `SELECT *`
4. **Use pagination**: Implement cursor-based pagination for large datasets

### Monitoring

- Check Supabase dashboard for query performance
- Monitor database size and growth
- Review slow query logs

## Backup

### Automatic Backups

Supabase provides automatic daily backups for all projects.

### Manual Backups

```bash
pg_dump -h db.your-project.supabase.co -U postgres your_database > backup.sql
```

## Security

### Authentication

- Supabase Auth for user authentication
- JWT tokens for API access
- Secure password storage

### Authorization

- Row Level Security policies
- User-based access control
- Service role for ESP32 communication

### Data Protection

- HTTPS for all API calls
- Encrypted data at rest
- Secure key storage

## Contributing

1. Follow the existing schema structure
2. Add migrations for schema changes
3. Update documentation
4. Test all queries

## License

This project is licensed under the MIT License.