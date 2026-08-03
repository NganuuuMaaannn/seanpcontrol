# SeanPControl Hardware Documentation

## Overview

SeanPControl uses an ESP32 DevKit V1 connected to the motherboard's front panel header through PC817 optocouplers to control desktop computers.

## Components

### ESP32 DevKit V1

- **Processor**: Dual-core Xtensa LX6
- **WiFi**: 802.11 b/g/n
- **Bluetooth**: 4.2
- **Flash**: 4MB
- **Pins**: 38 GPIO pins

### PC817 Optocoupler

- **Input**: 1.2V forward voltage
- **Output**: 80V max collector-emitter voltage
- **Isolation**: 5000V
- **Purpose**: Electrical isolation between ESP32 and motherboard

## GPIO Assignments

| GPIO | Function | Press Duration | Description |
|------|----------|----------------|-------------|
| GPIO26 | Power Button | 300ms | Momentary press to power on/off |
| GPIO27 | Reset Button | 300ms | Momentary press to reset |
| GPIO25 | Force Shutdown | 5000ms | Long press to force shutdown |

## Circuit Diagram

### Power Button Connection

```
ESP32 GPIO26 ──────┐
                    │
                 PC817
                    │
Motherboard Power ──┘
Header Pin
```

### Reset Button Connection

```
ESP32 GPIO27 ──────┐
                    │
                 PC817
                    │
Motherboard Reset ──┘
Header Pin
```

### Force Shutdown Connection

```
ESP32 GPIO25 ──────┐
                    │
                 PC817
                    │
Motherboard Power ──┘
Header Pin
```

## Pin Configuration

### Front Panel Header

Most motherboards have a standard front panel header with the following pins:

- **PWR_SW**: Power switch
- **RESET_SW**: Reset switch
- **PWR_LED**: Power LED
- **HDD_LED**: Hard drive LED
- **SPEAKER**: Speaker

### Connection Steps

1. **Identify the front panel header** on your motherboard
2. **Locate the PWR_SW pins** (usually 2 pins)
3. **Connect GPIO26** to one pin through PC817
4. **Connect the other pin** to GND through PC817
5. **Repeat for RESET_SW** with GPIO27
6. **Repeat for forced shutdown** with GPIO25

## PC817 Optocoupler Circuit

### Input Side (ESP32)

```
GPIO26 ──────[330Ω]──────[PC817 Anode]
                          [PC817 Cathode]────── GND
```

### Output Side (Motherboard)

```
Motherboard PWR_SW Pin ──────[PC817 Collector]
                              [PC817 Emitter]────── GND
```

## Schematic

```
+3.3V ──────[330Ω]──────[PC817 Input Anode]
                         [PC817 Input Cathode]────── GPIO26

Motherboard PWR_SW Pin ──────[PC817 Output Collector]
                              [PC817 Output Emitter]────── GND
```

## PCB Design

### Components

- ESP32 DevKit V1
- 3x PC817 Optocouplers
- 3x 330Ω Resistors
- 3x Pin Headers
- 1x Power Supply (5V/1A)

### Layout

```
┌─────────────────────────────────────┐
│                                     │
│  ┌─────────┐    ┌─────────────┐    │
│  │  ESP32  │    │  PC817 x3   │    │
│  │ DevKit  │    │             │    │
│  └─────────┘    └─────────────┘    │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  Pin Headers (Front Panel) │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

## Bill of Materials (BOM)

| Component | Quantity | Description |
|-----------|----------|-------------|
| ESP32 DevKit V1 | 1 | Main controller |
| PC817 Optocoupler | 3 | Electrical isolation |
| 330Ω Resistor | 3 | Current limiting |
| Pin Header (2-pin) | 3 | Front panel connection |
| Power Supply | 1 | 5V/1A USB |
| PCB | 1 | Custom or protoboard |
| Wires | Several | Connections |

## Assembly Instructions

### Step 1: Prepare the PCB

1. Design the PCB layout using KiCad or similar
2. Order the PCB from a manufacturer
3. Gather all components

### Step 2: Solder Components

1. Solder the ESP32 DevKit V1 socket
2. Solder the PC817 optocouplers
3. Solder the resistors
4. Solder the pin headers

### Step 3: Connect Wires

1. Connect GPIO26 to PC817 #1 input
2. Connect GPIO27 to PC817 #2 input
3. Connect GPIO25 to PC817 #3 input
4. Connect PC817 outputs to pin headers

### Step 4: Test

1. Connect ESP32 to computer via USB
2. Upload test firmware
3. Verify GPIO outputs with multimeter
4. Test with motherboard

## Testing

### GPIO Test

```cpp
void setup() {
  pinMode(26, OUTPUT);
  pinMode(27, OUTPUT);
  pinMode(25, OUTPUT);
}

void loop() {
  digitalWrite(26, HIGH);
  delay(100);
  digitalWrite(26, LOW);
  delay(1000);
  
  digitalWrite(27, HIGH);
  delay(100);
  digitalWrite(27, LOW);
  delay(1000);
  
  digitalWrite(25, HIGH);
  delay(100);
  digitalWrite(25, LOW);
  delay(1000);
}
```

### Multimeter Test

1. Set multimeter to continuity mode
2. Touch probes to PC817 output pins
3. Press button in firmware
4. Verify continuity changes

## Troubleshooting

### Common Issues

1. **No response from motherboard**
   - Check connections
   - Verify GPIO pins
   - Test PC817 optocouplers

2. **Intermittent operation**
   - Check power supply
   - Verify ground connections
   - Check for loose wires

3. **Wrong button pressed**
   - Verify GPIO assignments
   - Check pin mappings
   - Review schematic

### Debug Steps

1. Test ESP32 GPIO directly
2. Test PC817 optocouplers
3. Test motherboard connections
4. Check firmware configuration

## Safety

### Electrical Safety

- **Isolation**: PC817 provides 5000V isolation
- **Current Limiting**: Resistors limit current
- **Low Voltage**: ESP32 operates at 3.3V

### Precautions

- **Power Off**: Always power off before making connections
- **Anti-Static**: Use anti-static precautions
- **Double Check**: Verify connections before powering on

## Future Improvements

### Short Term

- [ ] Add status LEDs
- [ ] Add reset button
- [ ] Add case/enclosure

### Medium Term

- [ ] Add Wake-on-LAN support
- [ ] Add temperature monitoring
- [ ] Add fan control

### Long Term

- [ ] Add multiple device support
- [ ] Add USB hub
- [ ] Add OLED display

## Contributing

1. Follow the existing schematic
2. Document all changes
3. Test thoroughly
4. Submit a pull request

## License

This project is licensed under the MIT License.