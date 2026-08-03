# SeanPControl Firmware

This directory contains the ESP32 firmware for SeanPControl.

## Structure

```
firmware/
└── esp32/
    ├── src/
    ├── include/
    ├── lib/
    ├── config/
    │   └── config.h
    ├── services/
    │   ├── command_service.h
    │   ├── command_service.cpp
    │   ├── device_service.h
    │   ├── device_service.cpp
    │   ├── heartbeat_service.h
    │   └── heartbeat_service.cpp
    ├── repositories/
    │   ├── device_repository.h
    │   ├── device_repository.cpp
    │   ├── command_repository.h
    │   ├── command_repository.cpp
    │   ├── log_repository.h
    │   └── log_repository.cpp
    ├── controllers/
    │   ├── device_controller.h
    │   └── device_controller.cpp
    ├── models/
    │   ├── device.h
    │   ├── command.h
    │   └── log.h
    ├── network/
    │   ├── wifi_client.h
    │   ├── wifi_client.cpp
    │   ├── http_client.h
    │   └── http_client.cpp
    ├── gpio/
    │   ├── gpio_handler.h
    │   └── gpio_handler.cpp
    ├── utils/
    │   ├── logger.h
    │   ├── logger.cpp
    │   ├── time_utils.h
    │   └── time_utils.cpp
    ├── main.ino
    └── platformio.ini
```

## Configuration

Edit `config/config.h` to configure your device:

```cpp
// WiFi Configuration
#define WIFI_SSID "YOUR_WIFI_SSID"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"

// Supabase Configuration
#define SUPABASE_URL "YOUR_SUPABASE_URL"
#define SUPABASE_ANON_KEY "YOUR_SUPABASE_ANON_KEY"

// Device Configuration
#define DEVICE_UUID "YOUR_DEVICE_UUID"
#define DEVICE_NAME "SeanPControl Device"
```

## GPIO Assignments

| GPIO | Function | Press Duration |
|------|----------|----------------|
| GPIO26 | Power Button | 300ms |
| GPIO27 | Reset Button | 300ms |
| GPIO25 | Force Shutdown | 5000ms |

## Building

### Arduino IDE

1. Install Arduino IDE
2. Install ESP32 board support
3. Open `main.ino`
4. Select board: ESP32 Dev Module
5. Upload

### PlatformIO

```bash
cd firmware/esp32
pio run
pio run --target upload
```

## Architecture

### Clean Architecture

The firmware follows clean architecture principles:

- **Models**: Data structures for Device, Command, and Log
- **Repositories**: Data access layer for Supabase API
- **Services**: Business logic for commands and device management
- **Controllers**: Application layer that coordinates services
- **GPIO**: Hardware abstraction for button presses
- **Network**: WiFi and HTTP client management
- **Utils**: Utility functions for logging and time

### Data Flow

```
Controller
    ↓
Service
    ↓
Repository
    ↓
HTTP Client
    ↓
Supabase API
```

## Error Handling

The firmware is designed to never crash:

- **WiFi Reconnection**: Automatic reconnection with exponential backoff
- **HTTP Retries**: Failed requests are retried up to 3 times
- **Error Logging**: All errors are logged to the database
- **Graceful Degradation**: System continues operating even when some components fail

## Debugging

### Serial Monitor

1. Open Arduino IDE Serial Monitor
2. Set baud rate to 115200
3. View debug messages

### Debug Output

```cpp
#define DEBUG_SERIAL true
#define DEBUG_BAUD_RATE 115200
```

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