#include "wifi_client.h"

WifiClient::WifiClient()
    : status(WIFI_DISCONNECTED),
      lastReconnectAttempt(0),
      reconnectAttempts(0) {}

bool WifiClient::begin() {
  if (DEBUG_SERIAL) {
    Serial.println("[WIFI] Initializing WiFi client...");
  }

  WiFi.mode(WIFI_STA);
  WiFi.disconnect();
  delay(100);

  return connectToWifi();
}

bool WifiClient::connectToWifi() {
  if (DEBUG_SERIAL) {
    Serial.printf("[WIFI] Connecting to %s...\n", WIFI_SSID);
  }

  status = WIFI_CONNECTING;
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  unsigned long startTime = millis();
  while (WiFi.status() != WL_CONNECTED) {
    if (millis() - startTime > WIFI_CONNECT_TIMEOUT_MS) {
      if (DEBUG_SERIAL) {
        Serial.println("[WIFI] Connection timeout");
      }
      status = WIFI_FAILED;
      return false;
    }
    delay(100);
  }

  status = WIFI_CONNECTED;
  reconnectAttempts = 0;

  if (DEBUG_SERIAL) {
    Serial.printf("[WIFI] Connected! IP: %s\n", WiFi.localIP().toString().c_str());
    Serial.printf("[WIFI] Signal strength: %d dBm\n", WiFi.RSSI());
  }

  return true;
}

bool WifiClient::isConnected() {
  return WiFi.status() == WL_CONNECTED;
}

WifiStatus WifiClient::getStatus() {
  if (WiFi.status() == WL_CONNECTED) {
    status = WIFI_CONNECTED;
  } else if (WiFi.status() == WL_DISCONNECTED) {
    status = WIFI_DISCONNECTED;
  }
  return status;
}

String WifiClient::getIpAddress() {
  if (isConnected()) {
    return WiFi.localIP().toString();
  }
  return "0.0.0.0";
}

int WifiClient::getSignalStrength() {
  if (isConnected()) {
    return WiFi.RSSI();
  }
  return -100;
}

void WifiClient::update() {
  if (!isConnected()) {
    unsigned long currentTime = millis();
    if (currentTime - lastReconnectAttempt > WIFI_RECONNECT_INTERVAL_MS) {
      lastReconnectAttempt = currentTime;
      reconnectAttempts++;

      if (DEBUG_SERIAL) {
        Serial.printf("[WIFI] Reconnection attempt %d\n", reconnectAttempts);
      }

      connectToWifi();
    }
  }
}

void WifiClient::disconnect() {
  WiFi.disconnect();
  status = WIFI_DISCONNECTED;

  if (DEBUG_SERIAL) {
    Serial.println("[WIFI] Disconnected");
  }
}

void WifiClient::reset() {
  disconnect();
  reconnectAttempts = 0;
  delay(100);
  begin();
}

String WifiClient::statusToString(WifiStatus status) {
  switch (status) {
    case WIFI_DISCONNECTED:
      return "disconnected";
    case WIFI_CONNECTING:
      return "connecting";
    case WIFI_CONNECTED:
      return "connected";
    case WIFI_FAILED:
      return "failed";
    default:
      return "unknown";
  }
}