# Changelog

All notable changes to SeanPControl will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-08-03

### Added

- Initial release of SeanPControl IoT platform
- ESP32 firmware with clean architecture
- React Native mobile app with Expo
- Supabase backend with PostgreSQL
- Device management and control
- Command execution and monitoring
- Real-time device status
- Command history tracking
- WiFi reconnection handling
- Error logging and monitoring

### Firmware

- GPIO handler for button presses
- WiFi client with auto-reconnection
- HTTP client with retry logic
- Device, Command, and Log models
- Repository pattern for data access
- Service layer for business logic
- Controller for application coordination
- Utility functions for logging and time

### Mobile

- Dashboard screen with device list
- Device details screen with controls
- Command history screen
- Settings screen
- Custom hooks for state management
- API client with retry logic
- Device and Command services
- Reusable UI components

### Backend

- Database schema with UUID support
- Row Level Security policies
- Edge functions for device communication
- Triggers for automatic updates
- Indexes for performance optimization

### Documentation

- Comprehensive README
- Architecture documentation
- API documentation
- Hardware documentation
- Firmware documentation
- Mobile documentation