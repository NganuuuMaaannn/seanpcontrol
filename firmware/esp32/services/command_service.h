#ifndef COMMAND_SERVICE_H
#define COMMAND_SERVICE_H

#include <Arduino.h>
#include "../models/command.h"
#include "../repositories/command_repository.h"
#include "../repositories/log_repository.h"
#include "../gpio/gpio_handler.h"

class CommandService {
private:
  CommandRepository* commandRepo;
  LogRepository* logRepo;
  GpioHandler* gpioHandler;
  String deviceId;

  bool executeCommand(const Command& command);

public:
  CommandService(CommandRepository* cmdRepo, LogRepository* logRepo,
                 GpioHandler* gpio, const String& devId);

  void pollCommands();
  bool executeCommandById(const String& commandId);
};

#endif // COMMAND_SERVICE_H