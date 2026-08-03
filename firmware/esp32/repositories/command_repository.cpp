#include "command_repository.h"

CommandRepository::CommandRepository(HttpClient* client) : httpClient(client) {}

Command CommandRepository::fetchPendingCommand(const String& deviceId) {
  Command command;

  String endpoint = String("commands?device_id=eq.") + deviceId +
                    "&status=eq.pending&order=created_at.asc&limit=1";

  HttpResponse response = httpClient->get(endpoint);

  if (!response.success) {
    if (DEBUG_SERIAL) {
      Serial.printf("[COMMAND_REPO] Failed to fetch pending command: %s\n", response.error.c_str());
    }
    return command;
  }

  if (response.body == "[]" || response.body.isEmpty()) {
    return command;
  }

  JsonDocument doc;
  DeserializationError error = deserializeJson(doc, response.body);

  if (error) {
    if (DEBUG_SERIAL) {
      Serial.printf("[COMMAND_REPO] Failed to parse command response: %s\n", error.c_str());
    }
    return command;
  }

  if (doc.is<JsonArray>() && doc.size() > 0) {
    JsonObject cmd = doc[0];

    command.setId(cmd["id"].as<String>());
    command.setDeviceId(cmd["device_id"].as<String>());
    command.setType(Command::stringToType(cmd["command"].as<String>()));
    command.setStatus(CMD_PENDING);
    command.setRequestedBy(cmd["requested_by"].as<String>());
    command.setCreatedAt(cmd["created_at"].as<String>());
  }

  return command;
}

bool CommandRepository::updateCommandStatus(const String& commandId, CommandStatus status) {
  String endpoint = String("commands?id=eq.") + commandId;

  JsonDocument doc;
  doc["status"] = Command::statusToString(status);

  String body;
  serializeJson(doc, body);

  HttpResponse response = httpClient->put(endpoint, body);

  if (!response.success) {
    if (DEBUG_SERIAL) {
      Serial.printf("[COMMAND_REPO] Failed to update command status: %s\n", response.error.c_str());
    }
    return false;
  }

  return true;
}

bool CommandRepository::markCommandExecuted(const String& commandId) {
  String endpoint = String("commands?id=eq.") + commandId;

  JsonDocument doc;
  doc["status"] = Command::statusToString(CMD_COMPLETED);
  doc["executed_at"] = "now()";

  String body;
  serializeJson(doc, body);

  HttpResponse response = httpClient->put(endpoint, body);

  if (!response.success) {
    if (DEBUG_SERIAL) {
      Serial.printf("[COMMAND_REPO] Failed to mark command as executed: %s\n", response.error.c_str());
    }
    return false;
  }

  return true;
}

bool CommandRepository::markCommandFailed(const String& commandId, const String& error) {
  String endpoint = String("commands?id=eq.") + commandId;

  JsonDocument doc;
  doc["status"] = Command::statusToString(CMD_FAILED);
  doc["executed_at"] = "now()";

  String body;
  serializeJson(doc, body);

  HttpResponse response = httpClient->put(endpoint, body);

  if (!response.success) {
    if (DEBUG_SERIAL) {
      Serial.printf("[COMMAND_REPO] Failed to mark command as failed: %s\n", response.error.c_str());
    }
    return false;
  }

  return true;
}