# SeanPControl Architecture

## System Overview

SeanPControl is an IoT platform that allows users to remotely control desktop computers anywhere in the world.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    React Native App                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Dashboard │  │   Device    │  │   Command   │        │
│  │   Screen    │  │   Details   │  │   History   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Cloud                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ PostgreSQL  │  │   REST API  │  │   Edge      │        │
│  │ Database    │  │             │  │   Functions │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    ESP32 Device                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   WiFi      │  │   HTTP      │  │   GPIO      │        │
│  │   Client    │  │   Client    │  │   Handler   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Hardware Layer                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   PC817     │  │   Motherboard│  │   Desktop   │        │
│  │   Optocouplers│ │   Front Panel│  │   Computer  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### Command Execution Flow

1. **User Action**: User taps a button in the mobile app
2. **API Request**: App sends command to Supabase API
3. **Database Insert**: Command is inserted into the database
4. **ESP32 Polling**: ESP32 polls for pending commands
5. **Command Retrieval**: ESP32 fetches the pending command
6. **GPIO Execution**: ESP32 executes the GPIO command
7. **Status Update**: ESP32 updates command status
8. **Log Insert**: ESP32 inserts execution log
9. **App Update**: App receives updated status via polling

### Device Status Flow

1. **Heartbeat**: ESP32 sends periodic heartbeats
2. **Status Update**: Device status is updated in database
3. **App Polling**: App polls for device status
4. **UI Update**: App updates UI with new status

## Components

### Mobile App (React Native)

- **Screens**: Dashboard, Device Details, Command History, Settings
- **Components**: DeviceCard, CommandButton, CommandHistory, etc.
- **Hooks**: useDevices, useCommands, useDeviceCommands
- **Services**: DeviceService, CommandService
- **API**: SupabaseClient, DevicesAPI, CommandsAPI, LogsAPI
- **Types**: TypeScript interfaces for all data structures

### Firmware (ESP32)

- **Config**: Configuration constants
- **Models**: Device, Command, Log data structures
- **GPIO**: Hardware abstraction for button presses
- **Network**: WiFi and HTTP client management
- **Repositories**: Data access layer for Supabase API
- **Services**: Business logic for commands and device management
- **Controllers**: Application layer that coordinates services
- **Utils**: Utility functions for logging and time

### Backend (Supabase)

- **Database**: PostgreSQL with UUID support
- **Migrations**: Schema and trigger migrations
- **Edge Functions**: Serverless functions for device communication
- **RLS Policies**: Row Level Security for data protection
- **Triggers**: Automatic timestamp updates

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

## Scalability

### Horizontal Scaling

- Supabase handles database scaling
- Edge functions scale automatically
- ESP32 devices are independent

### Vertical Scaling

- Database indexing for performance
- Connection pooling
- Caching strategies

## Monitoring

### Logging

- Device logs in database
- Function logs in Supabase
- Error tracking

### Metrics

- Device uptime
- Command success rate
- Response times

### Alerts

- Device offline alerts
- Error rate alerts
- Performance alerts

## Future Improvements

### Short Term

- [ ] Add user authentication
- [ ] Implement push notifications
- [ ] Add device pairing

### Medium Term

- [ ] Add OTA firmware updates
- [ ] Implement Wake-on-LAN
- [ ] Add desktop client

### Long Term

- [ ] Add file transfer
- [ ] Implement remote monitoring
- [ ] Add Windows service