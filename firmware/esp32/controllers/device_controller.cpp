#include "device_controller.h"

DeviceController::DeviceController(DeviceService* device, CommandService* command,
                                   HeartbeatService* heartbeat, WifiClient* wifi)
    : deviceService(device),
      commandService(command),
      heartbeatService(heartbeat),
      wifiClient(wifi),
      lastCommandPoll(0),
      lastStatusUpdate(0) {}

bool DeviceController::initialize() {
  if (DEBUG_SERIAL) {
    Serial.println("[CONTROLLER] Initializing device controller...");
  }

  if (!wifiClient->isConnected()) {
    if (DEBUG_SERIAL) {
      Serial.println("[CONTROLLER] WiFi not connected, attempting to connect...");
    }
    if (!wifiClient->begin()) {
      if (DEBUG_SERIAL) {
        Serial.println("[CONTROLLER] Failed to connect to WiFi");
      }
      return false;
    }
  }

  if (!deviceService->initialize(DEVICE_UUID, DEVICE_NAME, FIRMWARE_VERSION)) {
    if (DEBUG_SERIAL) {
      Serial.println("[CONTROLLER] Failed to initialize device service");
    }
    return false;
  }

  if (DEBUG_SERIAL) {
    Serial.println("[CONTROLLER] Device controller initialized successfully");
  }

  return true;
}

void DeviceController::update() {
  wifiClient->update();

  if (!wifiClient->isConnected()) {
    if (DEBUG_SERIAL) {
      Serial.println("[CONTROLLER] WiFi disconnected, waiting for reconnection...");
    }
    return;
  }

  unsigned long currentTime = millis();

  if (currentTime - lastCommandPoll >= COMMAND_POLL_INTERVAL_MS) {
    lastCommandPoll = currentTime;
    handleCommands();
  }

  if (currentTime - lastStatusUpdate >= STATUS_UPDATE_INTERVAL_MS) {
    lastStatusUpdate = currentTime;
    updateDeviceStatus();
  }

  heartbeatService->update();
}

void DeviceController::handleCommands() {
  commandService->pollCommands();
}

void DeviceController::updateDeviceStatus() {
  deviceService->updateStatus();
}

void DeviceController::sendHeartbeat() {
  deviceService->updateHeartbeat();
}