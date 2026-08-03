# SeanPControl Mobile Documentation

## Overview

The SeanPControl mobile app is built with React Native and Expo, following clean architecture principles for maintainability and scalability.

## Architecture

### Layers

1. **Screens Layer**: UI components for each screen
2. **Components Layer**: Reusable UI components
3. **Hooks Layer**: Custom React hooks for state management
4. **Services Layer**: Business logic for device and command operations
5. **API Layer**: HTTP client for Supabase API
6. **Types Layer**: TypeScript interfaces for all data structures
7. **Constants Layer**: Configuration and theme constants

### Project Structure

```
mobile/
├── app/
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── dashboard.tsx
│   ├── device-details.tsx
│   ├── command-history.tsx
│   └── settings.tsx
├── components/
│   ├── DeviceCard.tsx
│   ├── CommandButton.tsx
│   ├── CommandHistory.tsx
│   ├── ScreenHeader.tsx
│   ├── LoadingSpinner.tsx
│   └── ErrorMessage.tsx
├── hooks/
│   ├── useDevices.ts
│   ├── useCommands.ts
│   └── useDeviceCommands.ts
├── services/
│   ├── device_service.ts
│   └── command_service.ts
├── api/
│   ├── supabase.ts
│   ├── devices.ts
│   ├── commands.ts
│   └── logs.ts
├── types/
│   └── index.ts
├── constants/
│   ├── api.ts
│   └── theme.ts
└── assets/
```

## Screens

### Home Screen (`index.tsx`)

Landing page with app introduction and "Get Started" button.

### Dashboard Screen (`dashboard.tsx`)

Lists all devices with status, signal strength, and quick power button.

### Device Details Screen (`device-details.tsx`)

Shows device details, control buttons, and command history.

### Command History Screen (`command-history.tsx`)

Displays command history for a specific device.

### Settings Screen (`settings.tsx`)

App settings and account management.

## Components

### DeviceCard

Displays device information with status indicator and power button.

```tsx
<DeviceCard
  device={device}
  onPress={handleDevicePress}
  onPowerPress={handlePowerPress}
/>
```

### CommandButton

Button for sending commands to devices.

```tsx
<CommandButton
  command="power"
  onPress={handlePowerPress}
  disabled={device.status !== 'online'}
  size="large"
/>
```

### CommandHistory

Displays command history list.

```tsx
<CommandHistory commands={commands} limit={10} />
```

### ScreenHeader

Screen header with back button support.

```tsx
<ScreenHeader
  title="Device Details"
  showBackButton
  rightComponent={<RefreshButton />}
/>
```

### LoadingSpinner

Loading indicator with optional message.

```tsx
<LoadingSpinner message="Loading devices..." />
```

### ErrorMessage

Error display with retry button.

```tsx
<ErrorMessage message={error} onRetry={refreshDevices} />
```

## Hooks

### useDevices

Manages device list state.

```tsx
const { devices, loading, error, refreshDevices } = useDevices();
```

### useCommands

Manages command list state for a specific device.

```tsx
const { commands, loading, error, sendCommand } = useCommands(deviceId);
```

### useDeviceCommands

Manages command operations for a specific device.

```tsx
const {
  commands,
  sendPowerCommand,
  sendResetCommand,
  sendShutdownCommand,
} = useDeviceCommands(deviceId);
```

## Services

### DeviceService

Handles device operations.

```typescript
class DeviceService {
  async getAllDevices(): Promise<ApiResponse<Device[]>>;
  async getDeviceById(id: string): Promise<ApiResponse<Device>>;
  async updateDevice(id: string, updates: Partial<Device>): Promise<ApiResponse<Device>>;
  isDeviceOnline(device: Device): boolean;
  getDeviceStatusColor(status: string): string;
  formatLastSeen(lastSeen: string): string;
}
```

### CommandService

Handles command operations.

```typescript
class CommandService {
  async sendCommand(deviceId: string, command: CommandType): Promise<ApiResponse<Command>>;
  async sendPowerCommand(deviceId: string): Promise<ApiResponse<Command>>;
  async sendResetCommand(deviceId: string): Promise<ApiResponse<Command>>;
  async sendShutdownCommand(deviceId: string): Promise<ApiResponse<Command>>;
  getCommandLabel(command: CommandType): string;
  getCommandColor(command: CommandType): string;
}
```

## API Layer

### SupabaseClient

HTTP client for Supabase API with retry logic.

```typescript
class SupabaseClient {
  async get<T>(endpoint: string): Promise<ApiResponse<T>>;
  async post<T>(endpoint: string, body: any): Promise<ApiResponse<T>>;
  async put<T>(endpoint: string, body: any): Promise<ApiResponse<T>>;
  async delete<T>(endpoint: string): Promise<ApiResponse<T>>;
}
```

### DevicesAPI

Device-specific API operations.

```typescript
export const devicesApi = {
  async getAll(): Promise<ApiResponse<Device[]>>;
  async getById(id: string): Promise<ApiResponse<Device>>;
  async create(device: Partial<Device>): Promise<ApiResponse<Device>>;
  async update(id: string, updates: Partial<Device>): Promise<ApiResponse<Device>>;
};
```

### CommandsAPI

Command-specific API operations.

```typescript
export const commandsApi = {
  async getAll(): Promise<ApiResponse<Command[]>>;
  async getByDeviceId(deviceId: string): Promise<ApiResponse<Command[]>>;
  async create(deviceId: string, command: CommandType): Promise<ApiResponse<Command>>;
  async updateStatus(id: string, status: string): Promise<ApiResponse<Command>>;
};
```

## Types

### Device

```typescript
interface Device {
  id: string;
  uuid: string;
  device_name: string;
  device_serial: string;
  firmware_version: string;
  status: 'offline' | 'online' | 'busy' | 'error';
  wifi_signal: number;
  ip_address: string;
  last_seen: string;
  created_at: string;
  updated_at: string;
}
```

### Command

```typescript
interface Command {
  id: string;
  device_id: string;
  command: CommandType;
  status: CommandStatus;
  requested_by: string;
  created_at: string;
  executed_at: string;
}

type CommandType = 'power' | 'reset' | 'shutdown' | 'restart' | 'wake' | 'status' | 'heartbeat';
type CommandStatus = 'pending' | 'executing' | 'completed' | 'failed';
```

### ApiResponse

```typescript
interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}
```

## Constants

### API Configuration

```typescript
export const API_CONFIG = {
  SUPABASE_URL: 'your-supabase-url',
  SUPABASE_ANON_KEY: 'your-supabase-anon-key',
  TIMEOUT: 10000,
  MAX_RETRIES: 3,
};
```

### Theme

```typescript
export const COLORS = {
  primary: '#3B82F6',
  secondary: '#10B981',
  danger: '#EF4444',
  // ... more colors
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};
```

## Error Handling

### API Errors

```typescript
const response = await devicesApi.getAll();

if (response.error) {
  setError(response.error);
} else if (response.data) {
  setDevices(response.data);
}
```

### Network Errors

```typescript
try {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}`);
  }
} catch (error) {
  console.error('Network error:', error);
}
```

## Performance

### Optimizations

- Use `useCallback` for event handlers
- Use `useMemo` for expensive calculations
- Use `FlatList` for large lists
- Implement proper key extraction

### Caching

- Use React Query for data caching
- Implement optimistic updates
- Use local storage for offline support

## Testing

### Unit Tests

```bash
cd mobile
npm test
```

### Integration Tests

```bash
cd mobile
npm run test:integration
```

### E2E Tests

```bash
cd mobile
npm run test:e2e
```

## Contributing

1. Follow the existing code style
2. Add TypeScript types for new features
3. Write tests for new components
4. Update documentation

## License

This project is licensed under the MIT License.