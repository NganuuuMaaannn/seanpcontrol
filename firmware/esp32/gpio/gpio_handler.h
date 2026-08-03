#ifndef GPIO_HANDLER_H
#define GPIO_HANDLER_H

#include <Arduino.h>
#include "../config/config.h"

class GpioHandler {
private:
  bool initialized;

  void pressButton(int pin, int durationMs);

public:
  GpioHandler();

  bool begin();
  bool isInitialized() const;

  void pressPowerButton();
  void pressResetButton();
  void pressForceShutdown();

  void setPinMode(int pin, int mode);
  bool readPin(int pin);
  void writePin(int pin, int value);
};

#endif // GPIO_HANDLER_H