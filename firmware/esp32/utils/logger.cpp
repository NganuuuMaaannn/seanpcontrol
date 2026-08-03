#include "logger.h"

void Logger::info(const char* message) {
  if (DEBUG_SERIAL) {
    Serial.printf("[INFO] %s\n", message);
  }
}

void Logger::warning(const char* message) {
  if (DEBUG_SERIAL) {
    Serial.printf("[WARNING] %s\n", message);
  }
}

void Logger::error(const char* message) {
  if (DEBUG_SERIAL) {
    Serial.printf("[ERROR] %s\n", message);
  }
}

void Logger::success(const char* message) {
  if (DEBUG_SERIAL) {
    Serial.printf("[SUCCESS] %s\n", message);
  }
}

void Logger::debug(const char* message) {
  if (DEBUG_SERIAL) {
    Serial.printf("[DEBUG] %s\n", message);
  }
}

void Logger::info(const String& message) {
  info(message.c_str());
}

void Logger::warning(const String& message) {
  warning(message.c_str());
}

void Logger::error(const String& message) {
  error(message.c_str());
}

void Logger::success(const String& message) {
  success(message.c_str());
}

void Logger::debug(const String& message) {
  debug(message.c_str());
}

void Logger::log(const char* tag, const char* message) {
  if (DEBUG_SERIAL) {
    Serial.printf("[%s] %s\n", tag, message);
  }
}

void Logger::log(const char* tag, const String& message) {
  log(tag, message.c_str());
}