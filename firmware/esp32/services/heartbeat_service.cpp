#include "heartbeat_service.h"

HeartbeatService::HeartbeatService(DeviceService* device)
    : deviceService(device),
      lastHeartbeat(0),
      heartbeatInterval(HEARTBEAT_INTERVAL_MS) {}

void HeartbeatService::update() {
  unsigned long currentTime = millis();

  if (currentTime - lastHeartbeat >= heartbeatInterval) {
    lastHeartbeat = currentTime;
    deviceService->updateHeartbeat();
  }
}

void HeartbeatService::setInterval(unsigned long intervalMs) {
  heartbeatInterval = intervalMs;
}

bool HeartbeatService::shouldSendHeartbeat() const {
  unsigned long currentTime = millis();
  return (currentTime - lastHeartbeat >= heartbeatInterval);
}