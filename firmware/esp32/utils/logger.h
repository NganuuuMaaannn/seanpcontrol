#ifndef LOGGER_H
#define LOGGER_H

#include <Arduino.h>
#include "../config/config.h"

class Logger {
public:
  static void info(const char* message);
  static void warning(const char* message);
  static void error(const char* message);
  static void success(const char* message);
  static void debug(const char* message);

  static void info(const String& message);
  static void warning(const String& message);
  static void error(const String& message);
  static void success(const String& message);
  static void debug(const String& message);

  static void log(const char* tag, const char* message);
  static void log(const char* tag, const String& message);
};

#endif // LOGGER_H