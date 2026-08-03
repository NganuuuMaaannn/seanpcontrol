#include "command_service.h"

CommandService::CommandService(CommandRepository* cmdRepo, LogRepository* logRepo,
                               GpioHandler* gpio, const String& devId)
    : commandRepo(cmdRepo), logRepo(logRepo), gpioHandler(gpio), deviceId(devId) {}

void CommandService::pollCommands() {
  Command command = commandRepo->fetchPendingCommand(deviceId);

  if (command.getType() == CMD_UNKNOWN) {
    return;
  }

  if (DEBUG_SERIAL) {
    Serial.printf("[CMD_SERVICE] Received command: %s (ID: %s)\n",
                  Command::typeToString(command.getType()).c_str(),
                  command.getId().c_str());
  }

  commandRepo->updateCommandStatus(command.getId(), CMD_EXECUTING);

  bool success = executeCommand(command);

  if (success) {
    commandRepo->markCommandExecuted(command.getId());
    logRepo->insertCommandLog(deviceId, Command::typeToString(command.getType()),
                              true, "Command executed successfully");
  } else {
    commandRepo->markCommandFailed(command.getId(), "Execution failed");
    logRepo->insertCommandLog(deviceId, Command::typeToString(command.getType()),
                              false, "Command execution failed");
  }
}

bool CommandService::executeCommand(const Command& command) {
  switch (command.getType()) {
    case CMD_POWER:
      gpioHandler->pressPowerButton();
      return true;

    case CMD_RESET:
      gpioHandler->pressResetButton();
      return true;

    case CMD_SHUTDOWN:
    case CMD_RESTART:
      gpioHandler->pressForceShutdown();
      return true;

    case CMD_WAKE:
      gpioHandler->pressPowerButton();
      return true;

    case CMD_STATUS:
      return true;

    case CMD_HEARTBEAT:
      return true;

    default:
      if (DEBUG_SERIAL) {
        Serial.println("[CMD_SERVICE] Unknown command type");
      }
      return false;
  }
}

bool CommandService::executeCommandById(const String& commandId) {
  Command command;
  command.setId(commandId);
  command.setDeviceId(deviceId);

  return executeCommand(command);
}