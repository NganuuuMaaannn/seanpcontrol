#ifndef COMMAND_H
#define COMMAND_H

#include <Arduino.h>

enum CommandType {
  CMD_POWER,
  CMD_RESET,
  CMD_SHUTDOWN,
  CMD_RESTART,
  CMD_WAKE,
  CMD_STATUS,
  CMD_HEARTBEAT,
  CMD_UNKNOWN
};

enum CommandStatus {
  CMD_PENDING,
  CMD_EXECUTING,
  CMD_COMPLETED,
  CMD_FAILED
};

struct CommandData {
  String id;
  String deviceId;
  CommandType type;
  CommandStatus status;
  String requestedBy;
  String createdAt;
  String executedAt;
};

class Command {
private:
  CommandData data;

public:
  Command();

  void setId(const String& id);
  void setDeviceId(const String& deviceId);
  void setType(CommandType type);
  void setStatus(CommandStatus status);
  void setRequestedBy(const String& user);
  void setCreatedAt(const String& timestamp);
  void setExecutedAt(const String& timestamp);

  String getId() const;
  String getDeviceId() const;
  CommandType getType() const;
  CommandStatus getStatus() const;
  String getRequestedBy() const;
  String getCreatedAt() const;
  String getExecutedAt() const;

  static CommandType stringToType(const String& cmd);
  static String typeToString(CommandType type);
  static String statusToString(CommandStatus status);
  String toJson() const;
};

#endif // COMMAND_H