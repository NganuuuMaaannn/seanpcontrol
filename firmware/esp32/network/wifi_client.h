#ifndef WIFI_CLIENT_H
#define WIFI_CLIENT_H

#include <Arduino.h>
#include <WiFi.h>
#include "../config/config.h"

enum WifiStatus {
  WIFI_DISCONNECTED,
  WIFI_CONNECTING,
  WIFI_CONNECTED,
  WIFI_FAILED
};

class WifiClient {
private:
  WifiStatus status;
  unsigned long lastReconnectAttempt;
  int reconnectAttempts;

  bool connectToWifi();

public:
  WifiClient();

  bool begin();
  bool isConnected();
  WifiStatus getStatus();
  String getIpAddress();
  int getSignalStrength();

  void update();
  void disconnect();
  void reset();

  static String statusToString(WifiStatus status);
};

#endif // WIFI_CLIENT_H