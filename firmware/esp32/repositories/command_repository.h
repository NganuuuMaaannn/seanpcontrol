#ifndef COMMAND_REPOSITORY_H
#define COMMAND_REPOSITORY_H

#include <Arduino.h>
#include <ArduinoJson.h>
#include "../network/http_client.h"
#include "../models/command.h"

class CommandRepository {
private:
  HttpClient* httpClient;

public:
  CommandRepository(HttpClient* client);

  Command fetchPendingCommand(const String& deviceId);
  bool updateCommandStatus(const String& commandId, CommandStatus status);
  bool markCommandExecuted(const String& commandId);
  bool markCommandFailed(const String& commandId, const String& error);
};

#endif // COMMAND_REPOSITORY_H