# SeanPControl

An IoT platform that allows users to remotely control desktop computers anywhere in the world.

## Architecture

```
React Native App
       ↓
  Supabase Cloud
       ↓
   PostgreSQL
       ↓
    REST API
       ↓
     ESP32
       ↓
  PC817 Optocouplers
       ↓
Motherboard Front Panel Header
       ↓
 Desktop Computer
```

## Features

- **Remote Power Control**: Turn on, restart, or shutdown your computer remotely
- **Real-time Status**: Monitor device status and connection quality
- **Command History**: Track all commands sent to your devices
- **Secure Authentication**: Enterprise-grade security with Supabase
- **Multiple Devices**: Support for multiple ESP32 devices and computers

## Tech Stack

### Firmware
- ESP32 DevKit V1 (38 Pins)
- Arduino Framework
- C++
- WiFi.h
- HTTPClient.h
- ArduinoJson

### Mobile
- React Native
- Expo
- TypeScript

### Backend
- Supabase
- PostgreSQL
- REST API
- Row Level Security
- Authentication

## Project Structure

```
SeanPControl/
├── firmware/
│   └── esp32/
│       ├── src/
│       ├── include/
│       ├── lib/
│       ├── config/
│       ├── services/
│       ├── repositories/
│       ├── controllers/
│       ├── models/
│       ├── network/
│       ├── gpio/
│       ├── utils/
│       └── main.ino
├── mobile/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   ├── api/
│   ├── store/
│   ├── types/
│   ├── constants/
│   ├── assets/
│   └── package.json
├── backend/
│   ├── supabase/
│   │   ├── migrations/
│   │   ├── functions/
│   │   ├── policies/
│   │   ├── triggers/
│   │   └── sql/
│   └── README.md
├── hardware/
│   ├── KiCad/
│   ├── PCB/
│   ├── Schematic/
│   ├── Images/
│   └── BOM/
├── docs/
│   ├── API/
│   ├── Database/
│   ├── Firmware/
│   ├── Hardware/
│   ├── Mobile/
│   └── Architecture/
├── scripts/
├── README.md
├── LICENSE
└── CHANGELOG.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI
- Arduino IDE or PlatformIO
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/SeanPControl.git
   cd SeanPControl
   ```

2. **Install mobile dependencies**
   ```bash
   cd mobile
   npm install
   ```

3. **Configure environment variables**
   - Copy `mobile/config.example.ts` to `mobile/config.ts`
   - Add your Supabase URL and API key

4. **Start the mobile app**
   ```bash
   npm start
   ```

### Firmware Setup

1. **Install Arduino IDE or PlatformIO**

2. **Install ESP32 board support**

3. **Configure the firmware**
   - Edit `firmware/esp32/config/config.h`
   - Add your WiFi credentials
   - Add your Supabase URL and API key
   - Add your device UUID

4. **Upload the firmware**
   - Connect ESP32 to your computer
   - Select the correct board and port
   - Upload the code

### Backend Setup

1. **Create a Supabase project**

2. **Run the migrations**
   - Go to SQL Editor in Supabase dashboard
   - Run `backend/supabase/migrations/001_initial_schema.sql`
   - Run `backend/supabase/migrations/002_triggers.sql`

3. **Deploy the edge functions**
   ```bash
   cd backend/supabase
   supabase functions deploy device-heartbeat
   supabase functions deploy device-command
   supabase functions deploy fetch-commands
   supabase functions deploy update-command-status
   supabase functions deploy insert-log
   ```

4. **Configure RLS policies**
   - Run `backend/supabase/policies/rls_policies.sql`

## Usage

1. **Power on your computer**
   - Open the SeanPControl app
   - Select your device
   - Tap the "Power" button

2. **Check device status**
   - View the device card on the dashboard
   - Check the status indicator and signal strength

3. **View command history**
   - Go to device details
   - Scroll down to see command history

## GPIO Assignments

| GPIO | Function | Press Duration |
|------|----------|----------------|
| GPIO26 | Power Button | 300ms |
| GPIO27 | Reset Button | 300ms |
| GPIO25 | Force Shutdown | 5000ms |

## Supported Commands

| Command | Description |
|---------|-------------|
| power | Press the power button |
| reset | Press the reset button |
| shutdown | Force shutdown the computer |
| restart | Force restart the computer |
| wake | Wake the computer (same as power) |
| status | Get device status |
| heartbeat | Send heartbeat signal |

## Error Handling

The system is designed to never crash and handle all errors gracefully:

- **WiFi Reconnection**: Automatic reconnection with exponential backoff
- **HTTP Retries**: Failed requests are retried up to 3 times
- **Error Logging**: All errors are logged to the database
- **Graceful Degradation**: System continues operating even when some components fail

## Future Features

- [ ] Multiple ESP32 devices
- [ ] Multiple computers
- [ ] OTA firmware updates
- [ ] Wake-on-LAN support
- [ ] Desktop client
- [ ] Next.js dashboard
- [ ] File transfer
- [ ] Remote monitoring (CPU, RAM, Disk)
- [ ] Windows service
- [ ] Push notifications
- [ ] Device pairing
- [ ] QR code pairing
- [ ] Dark mode

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Arduino](https://www.arduino.cc/) - IoT development platform
- [Expo](https://expo.dev/) - React Native development platform
- [Supabase](https://supabase.com/) - Open source Firebase alternative
- [ESP32](https://www.espressif.com/en/products/socs/esp32) - WiFi+BT+BLE MCU module