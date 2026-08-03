#ifndef DEVICE_SERVICE_H
#define DEVICE_SERVICE_H

#include <Arduino.h>
#include "../models/device.h"
#include "../repositories/device_repository.h"
#include "../network/wifi_client.h"

class DeviceService {
private:
  DeviceRepository* deviceRepo;
  WifiClient* wifiClient;
  Device device;

  void updateDeviceInfo();

public:
  DeviceService(DeviceRepository* repo, WifiClient* wifi);

  bool initialize(const String& uuid, const String& name, const String& version);
  void updateStatus();
  void updateHeartbeat();
  void updateSignalStrength();

  Device& getDevice();
  String getDeviceUuid() const;
};

#endif // DEVICE_SERVICE_H