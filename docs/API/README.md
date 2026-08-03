# SeanPControl API Documentation

## Overview

SeanPControl uses Supabase REST API for communication between the mobile app and ESP32 devices.

## Base URL

```
https://your-project.supabase.co
```

## Authentication

All API requests require authentication via API key:

```http
apikey: your-supabase-anon-key
Authorization: Bearer your-supabase-anon-key
```

## Endpoints

### Devices

#### Get All Devices

```http
GET /rest/v1/devices?select=*&order=created_at.desc
```

**Response:**
```json
[
  {
    "id": "uuid",
    "uuid": "device-uuid",
    "device_name": "My Computer",
    "device_serial": "SERIAL123",
    "firmware_version": "1.0.0",
    "status": "online",
    "wifi_signal": -45,
    "ip_address": "192.168.1.100",
    "last_seen": "2026-08-03T12:00:00Z",
    "created_at": "2026-08-03T10:00:00Z",
    "updated_at": "2026-08-03T12:00:00Z"
  }
]
```

#### Get Device by ID

```http
GET /rest/v1/devices?id=eq.{id}&select=*
```

#### Get Device by UUID

```http
GET /rest/v1/devices?uuid=eq.{uuid}&select=*
```

#### Create Device

```http
POST /rest/v1/devices
Content-Type: application/json

{
  "device_name": "My Computer",
  "device_serial": "SERIAL123",
  "firmware_version": "1.0.0"
}
```

#### Update Device

```http
PUT /rest/v1/devices?id=eq.{id}
Content-Type: application/json

{
  "device_name": "Updated Name",
  "status": "online"
}
```

#### Delete Device

```http
DELETE /rest/v1/devices?id=eq.{id}
```

### Commands

#### Get All Commands

```http
GET /rest/v1/commands?select=*&order=created_at.desc
```

**Response:**
```json
[
  {
    "id": "uuid",
    "device_id": "device-uuid",
    "command": "power",
    "status": "completed",
    "requested_by": "user-uuid",
    "created_at": "2026-08-03T12:00:00Z",
    "executed_at": "2026-08-03T12:00:01Z"
  }
]
```

#### Get Commands by Device ID

```http
GET /rest/v1/commands?device_id=eq.{deviceId}&select=*&order=created_at.desc
```

#### Get Command by ID

```http
GET /rest/v1/commands?id=eq.{id}&select=*
```

#### Create Command

```http
POST /rest/v1/commands
Content-Type: application/json

{
  "device_id": "device-uuid",
  "command": "power",
  "requested_by": "user-uuid"
}
```

#### Update Command Status

```http
PUT /rest/v1/commands?id=eq.{id}
Content-Type: application/json

{
  "status": "completed",
  "executed_at": "2026-08-03T12:00:01Z"
}
```

### Logs

#### Get All Logs

```http
GET /rest/v1/logs?select=*&order=created_at.desc
```

**Response:**
```json
[
  {
    "id": "uuid",
    "device_id": "device-uuid",
    "command": "power",
    "success": true,
    "message": "Command executed successfully",
    "created_at": "2026-08-03T12:00:00Z"
  }
]
```

#### Get Logs by Device ID

```http
GET /rest/v1/logs?device_id=eq.{deviceId}&select=*&order=created_at.desc
```

#### Get Log by ID

```http
GET /rest/v1/logs?id=eq.{id}&select=*
```

#### Create Log

```http
POST /rest/v1/logs
Content-Type: application/json

{
  "device_id": "device-uuid",
  "command": "power",
  "success": true,
  "message": "Command executed successfully"
}
```

## Edge Functions

### Device Heartbeat

```http
POST /functions/v1/device-heartbeat
Content-Type: application/json

{
  "device_uuid": "device-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "device": [...]
}
```

### Device Command

```http
POST /functions/v1/device-command
Content-Type: application/json

{
  "device_uuid": "device-uuid",
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

### Fetch Commands

```http
POST /functions/v1/fetch-commands
Content-Type: application/json

{
  "device_uuid": "device-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "commands": [...]
}
```

### Update Command Status

```http
POST /functions/v1/update-command-status
Content-Type: application/json

{
  "command_id": "command-uuid",
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

### Insert Log

```http
POST /functions/v1/insert-log
Content-Type: application/json

{
  "device_uuid": "device-uuid",
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

## Error Responses

### 400 Bad Request

```json
{
  "error": "Invalid request"
}
```

### 401 Unauthorized

```json
{
  "error": "Unauthorized"
}
```

### 404 Not Found

```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal server error"
}
```

## Rate Limiting

- **API Requests**: 100 requests per minute
- **Edge Functions**: 1000 invocations per minute

## Pagination

### Cursor-based Pagination

```http
GET /rest/v1/devices?select=*&order=created_at.desc&limit=10&offset=0
```

### Keyset Pagination

```http
GET /rest/v1/devices?select=*&created_at=lt.2026-08-03T12:00:00Z&order=created_at.desc&limit=10
```

## Filtering

### Exact Match

```http
GET /rest/v1/devices?status=eq.online
```

### Contains

```http
GET /rest/v1/devices?device_name=like.%Computer%
```

### Greater Than

```http
GET /rest/v1/commands?created_at=gt.2026-08-03T00:00:00Z
```

## Sorting

```http
GET /rest/v1/devices?order=device_name.asc
GET /rest/v1/devices?order=created_at.desc
```

## Column Selection

```http
GET /rest/v1/devices?select=id,device_name,status
```

## Counting

```http
GET /rest/v1/devices?select=*
Prefer: count=exact
```

## Examples

### Get Online Devices

```http
GET /rest/v1/devices?status=eq.online&order=device_name.asc
```

### Get Pending Commands

```http
GET /rest/v1/commands?device_id=eq.{deviceId}&status=eq.pending&order=created_at.asc
```

### Get Recent Logs

```http
GET /rest/v1/logs?device_id=eq.{deviceId}&order=created_at.desc&limit=50
```

## Contributing

1. Follow the existing API structure
2. Add proper error handling
3. Update documentation
4. Test all endpoints

## License

This project is licensed under the MIT License.