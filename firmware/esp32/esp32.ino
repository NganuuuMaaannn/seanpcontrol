// SeanPControl Firmware for ESP32
// Self-registering: app sends config, ESP32 registers in Supabase

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <WebServer.h>
#include <Preferences.h>

// ---- PIN CONFIG ----
#define GPIO_POWER    26
#define GPIO_RESET    27
#define LED_GREEN     33
#define LED_RED       32
#define BTN_RESET     25

// ---- HOTSPOT CONFIG ----
#define AP_SSID       "SeanPControl-Setup"
#define AP_PASS       "12345678"

// ---- GLOBALS ----
Preferences preferences;
WebServer server(80);
bool wifiConfigured = false;
bool setupMode = false;
String wifiSSID = "";
String wifiPassword = "";
String deviceUuid = "";
String deviceId = "";
String supabaseUrl = "";
String supabaseKey = "";
String deviceName = "";
String userId = "";

unsigned long lastPoll = 0;
unsigned long lastHeartbeat = 0;
unsigned long lastLedBlink = 0;
bool ledState = false;
bool deviceRegistered = false;

unsigned long resetPressStart = 0;
bool resetPressed = false;

enum DeviceStatus { STATUS_CONNECTING, STATUS_OK, STATUS_ERROR, STATUS_CONFIG, STATUS_COMMAND };
DeviceStatus currentStatus = STATUS_CONNECTING;

unsigned long greenFlashUntil = 0;
int cmdPhase = 0;
unsigned long cmdPhaseStart = 0;
const unsigned long CMD_PATTERN[] = {500, 100, 100, 100, 100, 100};
const int CMD_PHASES = 6;

// ---- LED ----
void setLedConnecting() { currentStatus = STATUS_CONNECTING; }
void setLedOk() { currentStatus = STATUS_OK; }
void setLedError() { currentStatus = STATUS_ERROR; }
void setLedConfig() { currentStatus = STATUS_CONFIG; }
void setLedCommand() { currentStatus = STATUS_COMMAND; cmdPhase = 0; cmdPhaseStart = millis(); }
void flashGreen(unsigned long ms) { greenFlashUntil = millis() + ms; }

void updateLeds() {
  unsigned long now = millis();

  // Green flash override (heartbeat)
  if (greenFlashUntil > 0 && now < greenFlashUntil) {
    digitalWrite(LED_GREEN, HIGH);
    digitalWrite(LED_RED, LOW);
    return;
  }
  if (greenFlashUntil > 0 && now >= greenFlashUntil) {
    greenFlashUntil = 0;
  }

  switch (currentStatus) {
    case STATUS_CONNECTING:
      if (now - lastLedBlink > 200) {
        lastLedBlink = now;
        ledState = !ledState;
        digitalWrite(LED_RED, ledState ? HIGH : LOW);
        digitalWrite(LED_GREEN, LOW);
      }
      break;
    case STATUS_OK:
      if (now - lastLedBlink > 1000) {
        lastLedBlink = now;
        digitalWrite(LED_RED, HIGH);
        digitalWrite(LED_GREEN, LOW);
        delay(50);
        digitalWrite(LED_RED, LOW);
      }
      break;
    case STATUS_ERROR:
      digitalWrite(LED_RED, HIGH);
      digitalWrite(LED_GREEN, LOW);
      break;
    case STATUS_CONFIG:
      if (now - lastLedBlink > 500) {
        lastLedBlink = now;
        ledState = !ledState;
        digitalWrite(LED_GREEN, ledState ? HIGH : LOW);
        digitalWrite(LED_RED, ledState ? LOW : HIGH);
      }
      break;
    case STATUS_COMMAND:
      {
        unsigned long elapsed = now - cmdPhaseStart;
        if (cmdPhase < CMD_PHASES && elapsed >= CMD_PATTERN[cmdPhase]) {
          cmdPhase++;
          cmdPhaseStart = now;
          if (cmdPhase < CMD_PHASES) {
            digitalWrite(LED_GREEN, (cmdPhase % 2 == 0) ? HIGH : LOW);
          }
        }
        if (cmdPhase >= CMD_PHASES) {
          digitalWrite(LED_GREEN, LOW);
          currentStatus = STATUS_OK;
        }
      }
      break;
  }
}

// ---- HANDLERS ----
void handleScan() {
  int n = WiFi.scanNetworks();
  DynamicJsonDocument doc(2048);
  JsonArray arr = doc.to<JsonArray>();
  for (int i = 0; i < n; i++) {
    JsonObject obj = arr.createNestedObject();
    obj["ssid"] = WiFi.SSID(i);
    obj["rssi"] = WiFi.RSSI(i);
    obj["secure"] = WiFi.encryptionType(i) != WIFI_AUTH_OPEN;
  }
  String json;
  serializeJson(doc, json);
  server.send(200, "application/json", json);
  WiFi.scanDelete();
}

void handleSetup() {
  if (server.hasArg("plain")) {
    DynamicJsonDocument doc(1024);
    if (!deserializeJson(doc, server.arg("plain"))) {
      wifiSSID = doc["ssid"].as<String>();
      wifiPassword = doc["pass"].as<String>();
      deviceUuid = doc["uuid"].as<String>();
      userId = doc["userid"].as<String>();
      supabaseUrl = doc["supabaseurl"].as<String>();
      supabaseKey = doc["supabasekey"].as<String>();
      deviceName = doc["devicename"].as<String>();

      // Save everything
      preferences.begin("config", false);
      preferences.putString("ssid", wifiSSID);
      preferences.putString("password", wifiPassword);
      preferences.putString("uuid", deviceUuid);
      preferences.putString("userid", userId);
      preferences.putString("supabaseurl", supabaseUrl);
      preferences.putString("supabasekey", supabaseKey);
      preferences.putString("devicename", deviceName);
      preferences.putBool("configured", true);
      preferences.end();

      Serial.println("All config saved!");
      Serial.print("UUID: "); Serial.println(deviceUuid);
      Serial.print("User: "); Serial.println(userId);

      server.send(200, "application/json", "{\"ok\":true}");
      delay(1000);
      ESP.restart();
    } else {
      server.send(400, "application/json", "{\"error\":\"invalid json\"}");
    }
  } else {
    server.send(400, "application/json", "{\"error\":\"no data\"}");
  }
}

void handleSave() {
  if (server.hasArg("plain")) {
    DynamicJsonDocument doc(512);
    if (!deserializeJson(doc, server.arg("plain"))) {
      wifiSSID = doc["ssid"].as<String>();
      wifiPassword = doc["pass"].as<String>();

      preferences.begin("config", false);
      preferences.putString("ssid", wifiSSID);
      preferences.putString("password", wifiPassword);
      preferences.putBool("configured", true);
      preferences.end();

      server.send(200, "application/json", "{\"ok\":true}");
      Serial.println("WiFi saved, restarting...");
      delay(1000);
      ESP.restart();
    } else {
      server.send(400, "application/json", "{\"error\":\"invalid json\"}");
    }
  } else {
    server.send(400, "application/json", "{\"error\":\"no data\"}");
  }
}

void handleStatus() {
  DynamicJsonDocument doc(256);
  doc["setup_mode"] = setupMode;
  doc["wifi_connected"] = WiFi.status() == WL_CONNECTED;
  String json;
  serializeJson(doc, json);
  server.send(200, "application/json", json);
}

// ---- CONFIG MODE ----
void startConfigMode() {
  Serial.println("Starting config mode...");
  setupMode = true;

  WiFi.mode(WIFI_AP);
  WiFi.softAP(AP_SSID, AP_PASS);
  delay(500);
  Serial.print("AP IP: ");
  Serial.println(WiFi.softAPIP());

  server.on("/scan", HTTP_GET, handleScan);
  server.on("/save", HTTP_POST, handleSave);
  server.on("/setup", HTTP_POST, handleSetup);
  server.on("/status", HTTP_GET, handleStatus);
  server.begin();

  setLedConfig();
  Serial.println("Connect to hotspot and open 192.168.4.1");
}

// ---- WIFI ----
bool connectWiFi() {
  Serial.print("Connecting to ");
  Serial.println(wifiSSID);

  WiFi.mode(WIFI_STA);
  WiFi.begin(wifiSSID.c_str(), wifiPassword.c_str());

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println(" OK");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
    return true;
  }
  Serial.println(" FAILED");
  return false;
}

// ---- SUPABASE ----
bool registerDevice() {
  if (deviceUuid.length() == 0 || supabaseUrl.length() == 0) {
    Serial.println("No UUID or Supabase URL, skipping registration");
    return false;
  }

  Serial.println("Registering device in Supabase...");

  HTTPClient http;
  String url = supabaseUrl + "/rest/v1/devices";

  http.begin(url);
  http.addHeader("apikey", supabaseKey);
  http.addHeader("Authorization", "Bearer " + supabaseKey);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Prefer", "return=representation");

  DynamicJsonDocument body(512);
  body["id"] = deviceUuid;
  body["uuid"] = deviceUuid;
  body["device_name"] = deviceName;
  body["status"] = "online";
  body["user_id"] = userId;
  body["firmware_version"] = "1.0.0";
  body["ip_address"] = WiFi.localIP().toString();
  body["wifi_signal"] = WiFi.RSSI();

  String payload;
  serializeJson(body, payload);

  int code = http.POST(payload);
  String response = http.getString();
  http.end();

  Serial.print("Register response: ");
  Serial.println(code);
  Serial.println(response);

  if (code == 200 || code == 201) {
    deviceId = deviceUuid;
    Serial.println("Device registered!");
    return true;
  }

  // If 409 conflict, device already exists - that's OK
  if (code == 409) {
    deviceId = deviceUuid;
    Serial.println("Device already exists, continuing...");
    return true;
  }

  Serial.println("Registration failed");
  return false;
}

void updateStatus(const char* status) {
  if (WiFi.status() != WL_CONNECTED || deviceUuid.length() == 0 || supabaseUrl.length() == 0) return;

  HTTPClient http;
  String url = supabaseUrl + "/rest/v1/devices?uuid=eq." + deviceUuid;
  http.begin(url);
  http.addHeader("apikey", supabaseKey);
  http.addHeader("Authorization", "Bearer " + supabaseKey);
  http.addHeader("Content-Type", "application/json");

  String payload = "{\"status\":\"" + String(status) + "\",\"last_seen\":\"now()\",\"ip_address\":\"" + WiFi.localIP().toString() + "\",\"wifi_signal\":" + String(WiFi.RSSI()) + "}";
  http.sendRequest("PATCH", payload);
  http.end();
}

void pollCommands() {
  if (WiFi.status() != WL_CONNECTED || deviceUuid.length() == 0 || supabaseUrl.length() == 0) return;

  HTTPClient http;
  String url = supabaseUrl + "/rest/v1/commands?device_id=eq." + deviceUuid + "&status=eq.pending&limit=1";
  http.begin(url);
  http.addHeader("apikey", supabaseKey);
  http.addHeader("Authorization", "Bearer " + supabaseKey);

  int code = http.GET();
  if (code == 200) {
    String body = http.getString();
    http.end();
    if (body == "[]") return;

    DynamicJsonDocument doc(1024);
    if (deserializeJson(doc, body)) return;

    const char* cmdId = doc[0]["id"];
    const char* cmdType = doc[0]["command"];

    Serial.print("CMD: ");
    Serial.println(cmdType);

    if (strcmp(cmdType, "power") == 0) {
      digitalWrite(GPIO_POWER, HIGH);
      setLedCommand();
      delay(500);
      digitalWrite(GPIO_POWER, LOW);
    } else if (strcmp(cmdType, "reset") == 0) {
      digitalWrite(GPIO_RESET, HIGH);
      setLedCommand();
      delay(500);
      digitalWrite(GPIO_RESET, LOW);
    }

    String patchUrl = supabaseUrl + "/rest/v1/commands?id=eq." + cmdId;
    HTTPClient http2;
    http2.begin(patchUrl);
    http2.addHeader("apikey", supabaseKey);
    http2.addHeader("Authorization", "Bearer " + supabaseKey);
    http2.addHeader("Content-Type", "application/json");
    http2.sendRequest("PATCH", "{\"status\":\"completed\",\"executed_at\":\"now()\"}");
    http2.end();
    Serial.println("DONE");
  } else {
    http.end();
  }
}

void heartbeat() {
  if (WiFi.status() != WL_CONNECTED) { setLedError(); return; }
  updateStatus("online");
  Serial.println("HB");
  flashGreen(200);
}

// ---- RESET BUTTON ----
void checkResetButton() {
  bool pressed = (digitalRead(BTN_RESET) == LOW);
  if (pressed && !resetPressed) { resetPressStart = millis(); resetPressed = true; }
  if (resetPressed && pressed && (millis() - resetPressStart >= 5000)) {
    Serial.println("Reset!");
    for (int i = 0; i < 10; i++) { digitalWrite(LED_RED, HIGH); delay(100); digitalWrite(LED_RED, LOW); delay(100); }
    preferences.begin("config", false); preferences.clear(); preferences.end();
    ESP.restart();
  }
  if (!pressed) resetPressed = false;
}

// ---- SETUP ----
void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("SeanPControl Starting...");

  pinMode(GPIO_POWER, OUTPUT);
  pinMode(GPIO_RESET, OUTPUT);
  pinMode(LED_GREEN, OUTPUT);
  pinMode(LED_RED, OUTPUT);
  pinMode(BTN_RESET, INPUT_PULLUP);
  digitalWrite(GPIO_POWER, LOW);
  digitalWrite(GPIO_RESET, LOW);
  digitalWrite(LED_GREEN, LOW);
  digitalWrite(LED_RED, HIGH);

  // Load config
  preferences.begin("config", true);
  wifiConfigured = preferences.getBool("configured", false);
  if (wifiConfigured) {
    wifiSSID = preferences.getString("ssid", "");
    wifiPassword = preferences.getString("password", "");
    deviceUuid = preferences.getString("uuid", "");
    userId = preferences.getString("userid", "");
    supabaseUrl = preferences.getString("supabaseurl", "");
    supabaseKey = preferences.getString("supabasekey", "");
    deviceName = preferences.getString("devicename", "SeanPControl Device");
  }
  preferences.end();

  if (!wifiConfigured || wifiSSID.length() == 0) {
    startConfigMode();
    return;
  }

  setLedConnecting();

  if (connectWiFi()) {
    deviceRegistered = registerDevice();
    if (deviceRegistered) {
      updateStatus("online");
      Serial.println("Online!");
      digitalWrite(LED_RED, LOW);
      digitalWrite(LED_GREEN, HIGH);
      delay(2000);
      digitalWrite(LED_GREEN, LOW);
      setLedOk();
    } else {
      setLedError();
      Serial.println("Registration failed");
    }
  } else {
    Serial.println("WiFi failed, entering setup mode...");
    startConfigMode();
  }
}

// ---- LOOP ----
void loop() {
  if (setupMode) {
    server.handleClient();
    updateLeds();
    delay(10);
    return;
  }

  checkResetButton();
  updateLeds();

  if (WiFi.status() != WL_CONNECTED) {
    setLedConnecting();
    WiFi.reconnect();
    delay(5000);
    if (WiFi.status() == WL_CONNECTED) {
      setLedOk();
    } else {
      setLedError();
    }
    return;
  }

  unsigned long now = millis();
  if (now - lastPoll > 2000) { lastPoll = now; pollCommands(); }
  if (now - lastHeartbeat > 30000) { lastHeartbeat = now; heartbeat(); }

  delay(10);
}