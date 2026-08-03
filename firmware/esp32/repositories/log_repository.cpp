#include "log_repository.h"

LogRepository::LogRepository(HttpClient* client) : httpClient(client) {}

bool LogRepository::insertLog(const Log& logEntry) {
  String endpoint = "logs";

  JsonDocument doc;
  doc["device_id"] = logEntry.getDeviceId();
  doc["command"] = logEntry.getCommand();
  doc["success"] = logEntry.getSuccess();
  doc["message"] = logEntry.getMessage();
  doc["created_at"] = logEntry.getTimestamp();

  String body;
  serializeJson(doc, body);

  HttpResponse response = httpClient->post(endpoint, body);

  if (!response.success) {
    if (DEBUG_SERIAL) {
      Serial.printf("[LOG_REPO] Failed to insert log: %s\n", response.error.c_str());
    }
    return false;
  }

  return true;
}

bool LogRepository::insertCommandLog(const String& deviceId, const String& command,
                                     bool success, const String& message) {
  Log logEntry;
  logEntry.setDeviceId(deviceId);
  logEntry.setCommand(command);
  logEntry.setSuccess(success);
  logEntry.setMessage(message);
  logEntry.setLevel(success ? LOG_SUCCESS : LOG_ERROR);
  logEntry.setTimestamp("");

  return insertLog(logEntry);
}