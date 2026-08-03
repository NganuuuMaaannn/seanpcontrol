# SeanPControl Bill of Materials

## Components

| # | Component | Quantity | Description | Source |
|---|-----------|----------|-------------|--------|
| 1 | ESP32 DevKit V1 | 1 | Main controller | Amazon/AliExpress |
| 2 | PC817 Optocoupler | 3 | Electrical isolation | Amazon/AliExpress |
| 3 | 330Ω Resistor | 3 | Current limiting | Amazon/AliExpress |
| 4 | Pin Header (2-pin) | 3 | Front panel connection | Amazon/AliExpress |
| 5 | USB Cable (Type-B) | 1 | ESP32 programming | Amazon/AliExpress |
| 6 | Power Supply (5V/1A) | 1 | ESP32 power | Amazon/AliExpress |
| 7 | PCB | 1 | Custom or protoboard | PCBWay/JLCPCB |
| 8 | Dupont Wires | 10 | Connections | Amazon/AliExpress |
| 9 | Enclosure | 1 | Protection | Amazon/3D Print |

## Detailed Specifications

### 1. ESP32 DevKit V1

- **Processor**: Dual-core Xtensa LX6 @ 240MHz
- **WiFi**: 802.11 b/g/n (2.4GHz)
- **Bluetooth**: 4.2 (BLE)
- **Flash**: 4MB
- **RAM**: 520KB SRAM
- **GPIO**: 34 programmable pins
- **Operating Voltage**: 3.3V
- **Input Voltage**: 7-12V
- **Dimensions**: 25.4mm x 48.2mm

### 2. PC817 Optocoupler

- **Input Forward Voltage**: 1.2V
- **Input Forward Current**: 50mA
- **Output Collector-Emitter Voltage**: 80V max
- **Output Collector Current**: 50mA max
- **Isolation Voltage**: 5000V
- **Package**: DIP-4
- **Operating Temperature**: -30°C to +100°C

### 3. 330Ω Resistor

- **Resistance**: 330Ω
- **Tolerance**: ±5%
- **Power Rating**: 1/4W
- **Package**: Axial

### 4. Pin Header (2-pin)

- **Pin Spacing**: 2.54mm (0.1")
- **Pin Count**: 2
- **Type**: Through-hole

### 5. USB Cable (Type-B)

- **Type**: USB Type-B to Type-A
- **Length**: 1 meter
- **Purpose**: Programming and power

### 6. Power Supply (5V/1A)

- **Output Voltage**: 5V DC
- **Output Current**: 1A
- **Input Voltage**: 100-240V AC
- **Connector**: USB Type-A

### 7. PCB

- **Material**: FR4
- **Layers**: 2
- **Thickness**: 1.6mm
- **Copper Weight**: 1oz
- **Surface Finish**: HASL

### 8. Dupont Wires

- **Type**: Male-to-Male
- **Length**: 20cm
- **Quantity**: 10
- **Color**: Assorted

### 9. Enclosure

- **Material**: Plastic or 3D printed
- **Dimensions**: 50mm x 80mm x 30mm
- **Mounting**: Screw mounts or snap-fit

## Optional Components

| Component | Quantity | Description | Purpose |
|-----------|----------|-------------|---------|
| OLED Display | 1 | 0.96" SSD1306 | Status display |
| LEDs | 3 | 3mm Green/Red | Status indicators |
| Button | 1 | Tactile switch | Manual reset |
| Capacitor | 3 | 100nF Ceramic | Decoupling |
| Screw Terminal | 3 | 2-pin | Easy connections |

## Cost Estimate

| Component | Quantity | Unit Price | Total |
|-----------|----------|------------|-------|
| ESP32 DevKit V1 | 1 | $5.00 | $5.00 |
| PC817 Optocoupler | 3 | $0.10 | $0.30 |
| 330Ω Resistor | 3 | $0.01 | $0.03 |
| Pin Header | 3 | $0.05 | $0.15 |
| USB Cable | 1 | $2.00 | $2.00 |
| Power Supply | 1 | $5.00 | $5.00 |
| PCB | 1 | $2.00 | $2.00 |
| Dupont Wires | 10 | $0.20 | $2.00 |
| Enclosure | 1 | $3.00 | $3.00 |
| **Total** | | | **$19.48** |

## Sourcing

### Amazon

- ESP32 DevKit V1
- PC817 Optocoupler
- Resistors
- Pin Headers
- USB Cable
- Power Supply
- Dupont Wires

### AliExpress

- ESP32 DevKit V1 (cheaper)
- PC817 Optocoupler
- Resistors
- Pin Headers
- Dupont Wires

### PCBWay/JLCPCB

- Custom PCBs
- Stencil
- Assembly

## Assembly Tools

### Required

- Soldering Iron (25-40W)
- Solder (60/40 or lead-free)
- Wire Cutters
- Wire Strippers
- Multimeter

### Recommended

- Soldering Station
- Hot Air Rework Station
- PCB Holder
- Magnifying Glass
- Tweezers

## Assembly Notes

### Soldering Order

1. Pin headers (if using)
2. Resistors
3. PC817 optocouplers
4. ESP32 socket (if using)

### Testing

1. Visual inspection
2. Continuity test
3. Power test
4. GPIO test
5. Integration test

## Safety Notes

- **ESD Protection**: Use anti-static wrist strap
- **Ventilation**: Work in well-ventilated area
- **Eye Protection**: Wear safety glasses
- **Heat**: Be careful with hot soldering iron

## Contributing

1. Update this document with new components
2. Add sourcing links
3. Include assembly tips
4. Submit a pull request

## License

This project is licensed under the MIT License.