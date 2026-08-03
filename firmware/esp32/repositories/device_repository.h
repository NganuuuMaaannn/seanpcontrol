#ifndef DEVICE_REPOSITORY_H
#define DEVICE_REPOSITORY_H

#include <Arduino.h>
#include <ArduinoJson.h>
#include "../network/http_client.h"
#include "../models/device.h"

class DeviceRepository {
private:
  HttpClient* httpClient;

public:
  DeviceRepository(HttpClient* client);

  bool updateDevice(const Device& device);
  bool updateDeviceStatus(const String& uuid, DeviceStatus status);
  bool updateDeviceHeartbeat(const String& uuid);
  bool updateDeviceWifiSignal(const String& uuid, int signal);
  bool updateDeviceIpAddress(const String& uuid, const String& ip);
};

#endif // DEVICE_REPOSITORY_H