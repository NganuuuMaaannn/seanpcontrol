# SeanPControl Firmware Documentation

## Overview

The ESP32 firmware for SeanPControl follows clean architecture principles to ensure maintainability, scalability, and testability.

## Architecture

### Layers

1. **Models Layer**: Data structures for Device, Command, and Log
2. **Repositories Layer**: Data access layer for Supabase API
3. **Services Layer**: Business logic for commands and device management
4. **Controllers Layer**: Application layer that coordinates services
5. **GPIO Layer**: Hardware abstraction for button presses
6. **Network Layer**: WiFi and HTTP client management
7. **Utils Layer**: Utility functions for logging and time

### Dependency Injection

The firmware uses dependency injection to decouple components:

```cpp
// Create dependencies
WifiClient wifiClient;
HttpClient httpClient;
GpioHandler gpioHandler;

// Create repositories
DeviceRepository deviceRepo(&httpClient);
CommandRepository commandRepo(&httpClient);
LogRepository logRepo(&httpClient);

// Create services
DeviceService deviceService(&deviceRepo, &wifiClient);
CommandService commandService(&commandRepo, &logRepo, &gpioHandler, DEVICE_UUID);
HeartbeatService heartbeatService(&deviceService);

// Create controller
DeviceController deviceController(&deviceService, &commandService,
                                  &heartbeatService, &wifiClient);
```

## Models

### Device

Represents an ESP32 device.

```cpp
class Device {
private:
  DeviceInfo info;

public:
  void setUuid(const String& uuid);
  void setName(const String& name);
  void setStatus(DeviceStatus status);
  // ... other setters and getters
  String toJson() const;
};
```

### Command

Represents a command sent to a device.

```cpp
class Command {
private:
  CommandData data;

public:
  void setId(const String& id);
  void setType(CommandType type);
  void setStatus(CommandStatus status);
  // ... other setters and getters
  static CommandType stringToType(const String& cmd);
  String toJson() const;
};
```

### Log

Represents an execution log entry.

```cpp
class Log {
private:
  LogEntry entry;

public:
  void setDeviceId(const String& deviceId);
  void setCommand(const String& command);
  void setSuccess(bool success);
  // ... other setters and getters
  String toJson() const;
};
```

## GPIO Handler

Manages hardware button presses.

```cpp
class GpioHandler {
public:
  bool begin();
  void pressPowerButton();    // 300ms press on GPIO26
  void pressResetButton();    // 300ms press on GPIO27
  void pressForceShutdown();  // 5000ms press on GPIO25
};
```

## Network Layer

### WiFi Client

Handles WiFi connection and reconnection.

```cpp
class WifiClient {
public:
  bool begin();
  bool isConnected();
  String getIpAddress();
  int getSignalStrength();
  void update();  // Call in loop() for reconnection
};
```

### HTTP Client

Handles HTTP requests to Supabase API.

```cpp
class HttpClient {
public:
  bool begin();
  HttpResponse get(const String& endpoint);
  HttpResponse post(const String& endpoint, const String& body);
  HttpResponse put(const String& endpoint, const String& body);
  HttpResponse del(const String& endpoint);
};
```

## Repositories

### Device Repository

Handles device data operations.

```cpp
class DeviceRepository {
public:
  bool updateDevice(const Device& device);
  bool updateDeviceStatus(const String& uuid, DeviceStatus status);
  bool updateDeviceHeartbeat(const String& uuid);
  bool updateDeviceWifiSignal(const String& uuid, int signal);
  bool updateDeviceIpAddress(const String& uuid, const String& ip);
};
```

### Command Repository

Handles command data operations.

```cpp
class CommandRepository {
public:
  Command fetchPendingCommand(const String& deviceId);
  bool updateCommandStatus(const String& commandId, CommandStatus status);
  bool markCommandExecuted(const String& commandId);
  bool markCommandFailed(const String& commandId, const String& error);
};
```

### Log Repository

Handles log data operations.

```cpp
class LogRepository {
public:
  bool insertLog(const Log& logEntry);
  bool insertCommandLog(const String& deviceId, const String& command,
                        bool success, const String& message);
};
```

## Services

### Device Service

Manages device state and status.

```cpp
class DeviceService {
public:
  bool initialize(const String& uuid, const String& name, const String& version);
  void updateStatus();
  void updateHeartbeat();
  void updateSignalStrength();
};
```

### Command Service

Manages command execution.

```cpp
class CommandService {
public:
  void pollCommands();
  bool executeCommandById(const String& commandId);
};
```

### Heartbeat Service

Manages periodic heartbeats.

```cpp
class HeartbeatService {
public:
  void update();  // Call in loop()
  void setInterval(unsigned long intervalMs);
};
```

## Controller

Coordinates all services.

```cpp
class DeviceController {
public:
  bool initialize();
  void update();  // Call in loop()
  void handleCommands();
  void updateDeviceStatus();
  void sendHeartbeat();
};
```

## Main Loop

```cpp
void setup() {
  // Initialize components
  gpioHandler.begin();
  httpClient.begin();
  deviceController.initialize();
}

void loop() {
  deviceController.update();
  delay(10);
}
```

## Error Handling

### WiFi Reconnection

```cpp
void WifiClient::update() {
  if (!isConnected()) {
    unsigned long currentTime = millis();
    if (currentTime - lastReconnectAttempt > WIFI_RECONNECT_INTERVAL_MS) {
      lastReconnectAttempt = currentTime;
      reconnectAttempts++;
      connectToWifi();
    }
  }
}
```

### HTTP Retries

```cpp
HttpResponse HttpClient::executeRequest(HttpMethod method, const String& url, const String& body) {
  for (int attempt = 0; attempt < maxRetries; attempt++) {
    // Try request
    if (httpCode > 0) {
      return response;
    }
    delay(retryDelayMs);
  }
  return response;
}
```

### Graceful Degradation

The firmware continues operating even when some components fail:

```cpp
void DeviceController::update() {
  wifiClient->update();  // Always try to reconnect

  if (!wifiClient->isConnected()) {
    return;  // Skip if not connected
  }

  // Continue with other operations
}
```

## Debugging

### Serial Output

```cpp
#define DEBUG_SERIAL true
#define DEBUG_BAUD_RATE 115200

// In code:
if (DEBUG_SERIAL) {
  Serial.println("[INFO] Device initialized");
}
```

### Log Levels

- `[INFO]`: General information
- `[WARNING]`: Warning messages
- `[ERROR]`: Error messages
- `[SUCCESS]`: Success messages
- `[DEBUG]`: Debug information

## Performance

### Memory Management

- Use `String` class for dynamic strings
- Avoid memory leaks with proper cleanup
- Use `JsonDocument` for JSON parsing

### Power Consumption

- Deep sleep mode when not in use
- WiFi power management
- GPIO power optimization

## Testing

### Unit Tests

```bash
cd firmware/esp32
pio test
```

### Integration Tests

1. Flash firmware to ESP32
2. Connect to WiFi
3. Send commands from mobile app
4. Verify GPIO outputs

## Contributing

1. Follow the existing code style
2. Add comments for complex logic
3. Test on real hardware
4. Submit a pull request

## License

This project is licensed under the MIT License.