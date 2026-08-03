#ifndef DEVICE_CONTROLLER_H
#define DEVICE_CONTROLLER_H

#include <Arduino.h>
#include "../services/device_service.h"
#include "../services/command_service.h"
#include "../services/heartbeat_service.h"
#include "../network/wifi_client.h"

class DeviceController {
private:
  DeviceService* deviceService;
  CommandService* commandService;
  HeartbeatService* heartbeatService;
  WifiClient* wifiClient;

  unsigned long lastCommandPoll;
  unsigned long lastStatusUpdate;

public:
  DeviceController(DeviceService* device, CommandService* command,
                   HeartbeatService* heartbeat, WifiClient* wifi);

  bool initialize();
  void update();
  void handleCommands();
  void updateDeviceStatus();
  void sendHeartbeat();
};

#endif // DEVICE_CONTROLLER_H