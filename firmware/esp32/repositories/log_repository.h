#ifndef LOG_REPOSITORY_H
#define LOG_REPOSITORY_H

#include <Arduino.h>
#include <ArduinoJson.h>
#include "../network/http_client.h"
#include "../models/log.h"

class LogRepository {
private:
  HttpClient* httpClient;

public:
  LogRepository(HttpClient* client);

  bool insertLog(const Log& logEntry);
  bool insertCommandLog(const String& deviceId, const String& command,
                        bool success, const String& message);
};

#endif // LOG_REPOSITORY_H