#ifndef TIME_UTILS_H
#define TIME_UTILS_H

#include <Arduino.h>

class TimeUtils {
public:
  static String getTimestamp();
  static String getIsoTimestamp();
  static unsigned long getMillis();
  static String formatDuration(unsigned long ms);
};

#endif // TIME_UTILS_H