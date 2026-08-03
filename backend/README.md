# SeanPControl Backend

This directory contains the Supabase backend configuration for SeanPControl.

## Structure

```
backend/
└── supabase/
    ├── migrations/
    │   ├── 001_initial_schema.sql
    │   └── 002_triggers.sql
    ├── functions/
    │   ├── device-heartbeat/
    │   ├── device-command/
    │   ├── fetch-commands/
    │   ├── update-command-status/
    │   └── insert-log/
    ├── policies/
    │   └── rls_policies.sql
    ├── triggers/
    └── sql/
```

## Database Schema

### Devices Table

Stores information about ESP32 devices.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| uuid | UUID | Device UUID (unique) |
| device_name | VARCHAR(255) | Device name |
| device_serial | VARCHAR(100) | Device serial number |
| firmware_version | VARCHAR(50) | Firmware version |
| status | VARCHAR(20) | Device status (offline, online, busy, error) |
| wifi_signal | INTEGER | WiFi signal strength (dBm) |
| ip_address | VARCHAR(45) | Device IP address |
| last_seen | TIMESTAMP | Last heartbeat timestamp |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

### Commands Table

Stores commands sent to devices.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| device_id | UUID | Reference to devices table |
| command | VARCHAR(50) | Command type |
| status | VARCHAR(20) | Command status |
| requested_by | UUID | User who requested the command |
| created_at | TIMESTAMP | Creation timestamp |
| executed_at | TIMESTAMP | Execution timestamp |

### Logs Table

Stores execution logs for commands.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| device_id | UUID | Reference to devices table |
| command | VARCHAR(50) | Command type |
| success | BOOLEAN | Whether the command succeeded |
| message | TEXT | Log message |
| created_at | TIMESTAMP | Creation timestamp |

## Edge Functions

### device-heartbeat

Updates the last_seen timestamp for a device.

**Request:**
```json
{
  "device_uuid": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "device": [...]
}
```

### device-command

Creates a new command for a device.

**Request:**
```json
{
  "device_uuid": "uuid",
  "command": "power",
  "requested_by": "user-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "command": [...]
}
```

### fetch-commands

Fetches pending commands for a device.

**Request:**
```json
{
  "device_uuid": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "commands": [...]
}
```

### update-command-status

Updates the status of a command.

**Request:**
```json
{
  "command_id": "uuid",
  "status": "completed",
  "error_message": "optional error message"
}
```

**Response:**
```json
{
  "success": true,
  "command": [...]
}
```

### insert-log

Inserts a new log entry.

**Request:**
```json
{
  "device_uuid": "uuid",
  "command": "power",
  "success": true,
  "message": "Command executed successfully"
}
```

**Response:**
```json
{
  "success": true,
  "log": [...]
}
```

## Row Level Security

### Devices Policies

- **Users can view all devices**: Authenticated users can read all devices
- **Users can update devices they own**: Authenticated users can update devices
- **Service role can manage all devices**: Service role has full access

### Commands Policies

- **Users can view all commands**: Authenticated users can read all commands
- **Users can create commands**: Authenticated users can create commands
- **Service role can manage all commands**: Service role has full access

### Logs Policies

- **Users can view all logs**: Authenticated users can read all logs
- **Service role can manage all logs**: Service role has full access

## Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and API keys

### 2. Run Migrations

1. Go to SQL Editor in Supabase dashboard
2. Run `migrations/001_initial_schema.sql`
3. Run `migrations/002_triggers.sql`

### 3. Deploy Edge Functions

```bash
cd backend/supabase
supabase functions deploy device-heartbeat
supabase functions deploy device-command
supabase functions deploy fetch-commands
supabase functions deploy update-command-status
supabase functions deploy insert-log
```

### 4. Configure RLS Policies

Run `policies/rls_policies.sql` in the SQL Editor.

## Development

### Local Development

```bash
cd backend/supabase
supabase start
```

### Testing

```bash
cd backend/supabase
supabase functions serve device-heartbeat
```

## Deployment

### Production

1. Deploy edge functions:
   ```bash
   supabase functions deploy --project-ref your-project-id
   ```

2. Update environment variables in Supabase dashboard

3. Test all functions

## Security

- All API keys are stored in environment variables
- Row Level Security is enabled on all tables
- Service role is used for ESP32 communication
- User authentication is required for all operations

## Monitoring

- Check Supabase dashboard for function logs
- Monitor database performance
- Set up alerts for errors

## Troubleshooting

### Common Issues

1. **Function not found**: Ensure you deployed the function
2. **RLS policy error**: Check that policies are applied correctly
3. **Authentication error**: Verify API keys are correct
4. **Database error**: Check migration status

### Logs

- Check function logs in Supabase dashboard
- Monitor database queries
- Review error messages

## Contributing

1. Follow the existing code style
2. Add tests for new functions
3. Update documentation
4. Submit a pull request

## License

This project is licensed under the MIT License.