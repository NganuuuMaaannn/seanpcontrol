#include "device_service.h"

DeviceService::DeviceService(DeviceRepository* repo, WifiClient* wifi)
    : deviceRepo(repo), wifiClient(wifi) {}

bool DeviceService::initialize(const String& uuid, const String& name, const String& version) {
  device.setUuid(uuid);
  device.setName(name);
  device.setFirmwareVersion(version);
  device.setStatus(DEVICE_ONLINE);
  device.setWifiSignal(wifiClient->getSignalStrength());
  device.setIpAddress(wifiClient->getIpAddress());

  if (DEBUG_SERIAL) {
    Serial.printf("[DEVICE_SERVICE] Initialized device: %s (%s)\n", name.c_str(), uuid.c_str());
  }

  return deviceRepo->updateDevice(device);
}

void DeviceService::updateStatus() {
  updateDeviceInfo();

  if (wifiClient->isConnected()) {
    device.setStatus(DEVICE_ONLINE);
  } else {
    device.setStatus(DEVICE_OFFLINE);
  }

  deviceRepo->updateDevice(device);
}

void DeviceService::updateHeartbeat() {
  updateDeviceInfo();
  deviceRepo->updateDeviceHeartbeat(device.getUuid());

  if (DEBUG_SERIAL) {
    Serial.println("[DEVICE_SERVICE] Heartbeat sent");
  }
}

void DeviceService::updateSignalStrength() {
  int signal = wifiClient->getSignalStrength();
  device.setWifiSignal(signal);
  deviceRepo->updateDeviceWifiSignal(device.getUuid(), signal);
}

void DeviceService::updateDeviceInfo() {
  device.setWifiSignal(wifiClient->getSignalStrength());
  device.setIpAddress(wifiClient->getIpAddress());
}

Device& DeviceService::getDevice() {
  return device;
}

String DeviceService::getDeviceUuid() const {
  return device.getUuid();
}