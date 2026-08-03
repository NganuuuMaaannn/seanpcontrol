#include "device_repository.h"

DeviceRepository::DeviceRepository(HttpClient* client) : httpClient(client) {}

bool DeviceRepository::updateDevice(const Device& device) {
  String endpoint = String("devices?uuid=eq.") + device.getUuid();

  JsonDocument doc;
  doc["device_name"] = device.getName();
  doc["firmware_version"] = device.getFirmwareVersion();
  doc["status"] = device.statusToString();
  doc["wifi_signal"] = device.getWifiSignal();
  doc["ip_address"] = device.getIpAddress();
  doc["last_seen"] = device.getLastSeen();
  doc["updated_at"] = device.getUpdatedAt();

  String body;
  serializeJson(doc, body);

  HttpResponse response = httpClient->put(endpoint, body);

  if (!response.success) {
    if (DEBUG_SERIAL) {
      Serial.printf("[DEVICE_REPO] Failed to update device: %s\n", response.error.c_str());
    }
    return false;
  }

  return true;
}

bool DeviceRepository::updateDeviceStatus(const String& uuid, DeviceStatus status) {
  DeviceStatus currentStatus = status;
  Device device;
  device.setUuid(uuid);
  device.setStatus(currentStatus);
  device.setLastSeen("");

  String endpoint = String("devices?uuid=eq.") + uuid;

  JsonDocument doc;
  doc["status"] = Device().statusToString();

  String body;
  serializeJson(doc, body);

  HttpResponse response = httpClient->put(endpoint, body);

  if (!response.success) {
    if (DEBUG_SERIAL) {
      Serial.printf("[DEVICE_REPO] Failed to update device status: %s\n", response.error.c_str());
    }
    return false;
  }

  return true;
}

bool DeviceRepository::updateDeviceHeartbeat(const String& uuid) {
  String endpoint = String("devices?uuid=eq.") + uuid;

  JsonDocument doc;
  doc["last_seen"] = "now()";
  doc["updated_at"] = "now()";

  String body;
  serializeJson(doc, body);

  HttpResponse response = httpClient->put(endpoint, body);

  if (!response.success) {
    if (DEBUG_SERIAL) {
      Serial.printf("[DEVICE_REPO] Failed to update heartbeat: %s\n", response.error.c_str());
    }
    return false;
  }

  return true;
}

bool DeviceRepository::updateDeviceWifiSignal(const String& uuid, int signal) {
  String endpoint = String("devices?uuid=eq.") + uuid;

  JsonDocument doc;
  doc["wifi_signal"] = signal;

  String body;
  serializeJson(doc, body);

  HttpResponse response = httpClient->put(endpoint, body);

  if (!response.success) {
    if (DEBUG_SERIAL) {
      Serial.printf("[DEVICE_REPO] Failed to update WiFi signal: %s\n", response.error.c_str());
    }
    return false;
  }

  return true;
}

bool DeviceRepository::updateDeviceIpAddress(const String& uuid, const String& ip) {
  String endpoint = String("devices?uuid=eq.") + uuid;

  JsonDocument doc;
  doc["ip_address"] = ip;

  String body;
  serializeJson(doc, body);

  HttpResponse response = httpClient->put(endpoint, body);

  if (!response.success) {
    if (DEBUG_SERIAL) {
      Serial.printf("[DEVICE_REPO] Failed to update IP address: %s\n", response.error.c_str());
    }
    return false;
  }

  return true;
}