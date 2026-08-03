#include "time_utils.h"
#include <time.h>

String TimeUtils::getTimestamp() {
  time_t now;
  struct tm timeinfo;
  char buffer[30];

  time(&now);
  localtime_r(&now, &timeinfo);
  strftime(buffer, sizeof(buffer), "%Y-%m-%d %H:%M:%S", &timeinfo);

  return String(buffer);
}

String TimeUtils::getIsoTimestamp() {
  time_t now;
  struct tm timeinfo;
  char buffer[30];

  time(&now);
  localtime_r(&now, &timeinfo);
  strftime(buffer, sizeof(buffer), "%Y-%m-%dT%H:%M:%SZ", &timeinfo);

  return String(buffer);
}

unsigned long TimeUtils::getMillis() {
  return millis();
}

String TimeUtils::formatDuration(unsigned long ms) {
  unsigned long seconds = ms / 1000;
  unsigned long minutes = seconds / 60;
  unsigned long hours = minutes / 60;

  seconds %= 60;
  minutes %= 60;

  char buffer[20];
  snprintf(buffer, sizeof(buffer), "%02lu:%02lu:%02lu", hours, minutes, seconds);

  return String(buffer);
}