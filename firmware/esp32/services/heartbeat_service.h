#ifndef HEARTBEAT_SERVICE_H
#define HEARTBEAT_SERVICE_H

#include <Arduino.h>
#include "device_service.h"

class HeartbeatService {
private:
  DeviceService* deviceService;
  unsigned long lastHeartbeat;
  unsigned long heartbeatInterval;

public:
  HeartbeatService(DeviceService* device);

  void update();
  void setInterval(unsigned long intervalMs);
  bool shouldSendHeartbeat() const;
};

#endif // HEARTBEAT_SERVICE_H