// SeanPControl Firmware for ESP32
// Simplified version to avoid memory issues

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// Configuration - EDIT THESE
#define WIFI_SSID "DoinogWIFI_2.4GHz"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"
#define SUPABASE_URL "https://ggqjcyqwevpsbrbcuriv.supabase.co"
#define SUPABASE_KEY "YOUR_SUPABASE_ANON_KEY"
#define DEVICE_UUID "f7d39f0d-6cab-4b96-9c60-37af0da1347b"
#define DEVICE_ID "7c173869-7205-44a7-8ea9-c50d96376e7c"

#define GPIO_POWER 26
#define GPIO_RESET 27
#define GPIO_SHUTDOWN 25

unsigned long lastPoll = 0;
unsigned long lastHeartbeat = 0;

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("SeanPControl Starting...");

  pinMode(GPIO_POWER, OUTPUT);
  pinMode(GPIO_RESET, OUTPUT);
  pinMode(GPIO_SHUTDOWN, OUTPUT);
  digitalWrite(GPIO_POWER, LOW);
  digitalWrite(GPIO_RESET, LOW);
  digitalWrite(GPIO_SHUTDOWN, LOW);
  Serial.println("GPIO OK");

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("WiFi connecting");
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 50) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println(" OK");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println(" FAILED");
    Serial.println("Restarting...");
    delay(3000);
    ESP.restart();
  }

  // Send online status on startup
  updateStatus("online");
  
  Serial.println("Setup done");
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    WiFi.reconnect();
    delay(5000);
    return;
  }

  unsigned long now = millis();

  // Poll commands every 2 seconds
  if (now - lastPoll > 2000) {
    lastPoll = now;
    pollCommands();
  }

  // Heartbeat + status every 30 seconds
  if (now - lastHeartbeat > 30000) {
    lastHeartbeat = now;
    heartbeat();
    updateStatus("online");
  }

  delay(10);
}

void updateStatus(const char* status) {
  HTTPClient http;
  String url = String(SUPABASE_URL) + "/rest/v1/devices?uuid=eq." + DEVICE_UUID;
  
  http.begin(url);
  http.addHeader("apikey", SUPABASE_KEY);
  http.addHeader("Authorization", String("Bearer ") + SUPABASE_KEY);
  http.addHeader("Content-Type", "application/json");
  
  String payload = "{\"status\":\"" + String(status) + "\",\"last_seen\":\"now()\",\"ip_address\":\"" + WiFi.localIP().toString() + "\",\"wifi_signal\":" + String(WiFi.RSSI()) + "}";
  http.sendRequest("PATCH", payload);
  http.end();
}

void pollCommands() {
  HTTPClient http;
  String url = String(SUPABASE_URL) + "/rest/v1/commands?device_id=eq." + DEVICE_ID + "&status=eq.pending&limit=1";
  
  http.begin(url);
  http.addHeader("apikey", SUPABASE_KEY);
  http.addHeader("Authorization", String("Bearer ") + SUPABASE_KEY);
  
  int code = http.GET();
  
  if (code == 200) {
    String body = http.getString();
    http.end();
    
    if (body == "[]") return;
    
    DynamicJsonDocument doc(1024);
    DeserializationError err = deserializeJson(doc, body);
    
    if (err) {
      Serial.println("JSON error");
      return;
    }
    
    const char* cmdId = doc[0]["id"];
    const char* cmdType = doc[0]["command"];
    
    Serial.print("CMD: ");
    Serial.println(cmdType);
    
    // Execute
    if (strcmp(cmdType, "power") == 0) {
      digitalWrite(GPIO_POWER, HIGH);
      delay(300);
      digitalWrite(GPIO_POWER, LOW);
    } else if (strcmp(cmdType, "reset") == 0) {
      digitalWrite(GPIO_RESET, HIGH);
      delay(300);
      digitalWrite(GPIO_RESET, LOW);
    } else if (strcmp(cmdType, "shutdown") == 0 || strcmp(cmdType, "restart") == 0) {
      digitalWrite(GPIO_SHUTDOWN, HIGH);
      delay(5000);
      digitalWrite(GPIO_SHUTDOWN, LOW);
    }
    
    // Update command status
    String patchUrl = String(SUPABASE_URL) + "/rest/v1/commands?id=eq." + cmdId;
    HTTPClient http2;
    http2.begin(patchUrl);
    http2.addHeader("apikey", SUPABASE_KEY);
    http2.addHeader("Authorization", String("Bearer ") + SUPABASE_KEY);
    http2.addHeader("Content-Type", "application/json");
    String payload = "{\"status\":\"completed\",\"executed_at\":\"now()\"}";
    http2.sendRequest("PATCH", payload);
    http2.end();
    
    Serial.println("DONE");
  } else {
    http.end();
  }
}

void heartbeat() {
  HTTPClient http;
  String url = String(SUPABASE_URL) + "/rest/v1/devices?uuid=eq." + DEVICE_UUID;
  
  http.begin(url);
  http.addHeader("apikey", SUPABASE_KEY);
  http.addHeader("Authorization", String("Bearer ") + SUPABASE_KEY);
  http.addHeader("Content-Type", "application/json");
  
  String payload = "{\"last_seen\":\"now()\"}";
  http.sendRequest("PATCH", payload);
  http.end();
  
  Serial.println("HB");
}