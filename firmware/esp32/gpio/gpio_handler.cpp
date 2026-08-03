#include "gpio_handler.h"

GpioHandler::GpioHandler() : initialized(false) {}

bool GpioHandler::begin() {
  if (initialized) {
    return true;
  }

  pinMode(GPIO_POWER_BUTTON, OUTPUT);
  pinMode(GPIO_RESET_BUTTON, OUTPUT);
  pinMode(GPIO_FORCE_SHUTDOWN, OUTPUT);

  digitalWrite(GPIO_POWER_BUTTON, LOW);
  digitalWrite(GPIO_RESET_BUTTON, LOW);
  digitalWrite(GPIO_FORCE_SHUTDOWN, LOW);

  initialized = true;

  if (DEBUG_SERIAL) {
    Serial.println("[GPIO] Handler initialized successfully");
  }

  return true;
}

bool GpioHandler::isInitialized() const {
  return initialized;
}

void GpioHandler::pressButton(int pin, int durationMs) {
  if (!initialized) {
    if (DEBUG_SERIAL) {
      Serial.println("[GPIO] Handler not initialized");
    }
    return;
  }

  if (DEBUG_SERIAL) {
    Serial.printf("[GPIO] Pressing button on pin %d for %dms\n", pin, durationMs);
  }

  digitalWrite(pin, HIGH);
  delay(durationMs);
  digitalWrite(pin, LOW);

  if (DEBUG_SERIAL) {
    Serial.printf("[GPIO] Button released on pin %d\n", pin);
  }
}

void GpioHandler::pressPowerButton() {
  pressButton(GPIO_POWER_BUTTON, PRESS_DURATION_SHORT);
}

void GpioHandler::pressResetButton() {
  pressButton(GPIO_RESET_BUTTON, PRESS_DURATION_SHORT);
}

void GpioHandler::pressForceShutdown() {
  pressButton(GPIO_FORCE_SHUTDOWN, PRESS_DURATION_LONG);
}

void GpioHandler::setPinMode(int pin, int mode) {
  pinMode(pin, mode);
}

bool GpioHandler::readPin(int pin) {
  return digitalRead(pin) == HIGH;
}

void GpioHandler::writePin(int pin, int value) {
  digitalWrite(pin, value);
}