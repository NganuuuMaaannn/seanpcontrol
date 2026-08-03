#ifndef LOG_H
#define LOG_H

#include <Arduino.h>

enum LogLevel {
  LOG_INFO,
  LOG_WARNING,
  LOG_ERROR,
  LOG_SUCCESS
};

struct LogEntry {
  String id;
  String deviceId;
  String command;
  bool success;
  String message;
  LogLevel level;
  String timestamp;
};

class Log {
private:
  LogEntry entry;

public:
  Log();

  void setId(const String& id);
  void setDeviceId(const String& deviceId);
  void setCommand(const String& command);
  void setSuccess(bool success);
  void setMessage(const String& message);
  void setLevel(LogLevel level);
  void setTimestamp(const String& timestamp);

  String getId() const;
  String getDeviceId() const;
  String getCommand() const;
  bool getSuccess() const;
  String getMessage() const;
  LogLevel getLevel() const;
  String getTimestamp() const;

  static String levelToString(LogLevel level);
  String toJson() const;
};

#endif // LOG_H