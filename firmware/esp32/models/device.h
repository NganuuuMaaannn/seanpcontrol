#ifndef DEVICE_H
#define DEVICE_H

#include <Arduino.h>

enum DeviceStatus {
  DEVICE_OFFLINE,
  DEVICE_ONLINE,
  DEVICE_BUSY,
  DEVICE_ERROR
};

struct DeviceInfo {
  String uuid;
  String name;
  String serial;
  String firmwareVersion;
  DeviceStatus status;
  int wifiSignal;
  String ipAddress;
  String lastSeen;
  String createdAt;
  String updatedAt;
};

class Device {
private:
  DeviceInfo info;

public:
  Device();

  void setUuid(const String& uuid);
  void setName(const String& name);
  void setSerial(const String& serial);
  void setFirmwareVersion(const String& version);
  void setStatus(DeviceStatus status);
  void setWifiSignal(int signal);
  void setIpAddress(const String& ip);
  void setLastSeen(const String& timestamp);
  void setCreatedAt(const String& timestamp);
  void setUpdatedAt(const String& timestamp);

  String getUuid() const;
  String getName() const;
  String getSerial() const;
  String getFirmwareVersion() const;
  DeviceStatus getStatus() const;
  int getWifiSignal() const;
  String getIpAddress() const;
  String getLastSeen() const;
  String getCreatedAt() const;
  String getUpdatedAt() const;

  String statusToString() const;
  String toJson() const;
};

#endif // DEVICE_H