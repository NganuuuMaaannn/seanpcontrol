#include "config/config.h"
#include "gpio/gpio_handler.h"
#include "network/wifi_client.h"
#include "network/http_client.h"
#include "repositories/device_repository.h"
#include "repositories/command_repository.h"
#include "repositories/log_repository.h"
#include "services/device_service.h"
#include "services/command_service.h"
#include "services/heartbeat_service.h"
#include "controllers/device_controller.h"
#include "utils/logger.h"

// Global instances
WifiClient wifiClient;
HttpClient httpClient;
GpioHandler gpioHandler;

DeviceRepository deviceRepo(&httpClient);
CommandRepository commandRepo(&httpClient);
LogRepository logRepo(&httpClient);

DeviceService deviceService(&deviceRepo, &wifiClient);
CommandService commandService(&commandRepo, &logRepo, &gpioHandler, DEVICE_UUID);
HeartbeatService heartbeatService(&deviceService);

DeviceController deviceController(&deviceService, &commandService,
                                  &heartbeatService, &wifiClient);

void setup() {
  if (DEBUG_SERIAL) {
    Serial.begin(DEBUG_BAUD_RATE);
    delay(1000);
    Logger::info("=================================");
    Logger::info("SeanPControl Firmware Starting...");
    Logger::info("=================================");
    Logger::log("VERSION", FIRMWARE_VERSION);
  }

  if (!gpioHandler.begin()) {
    Logger::error("Failed to initialize GPIO handler");
    while (true) {
      delay(1000);
    }
  }

  Logger::info("GPIO handler initialized");

  if (!httpClient.begin()) {
    Logger::error("Failed to initialize HTTP client");
    while (true) {
      delay(1000);
    }
  }

  Logger::info("HTTP client initialized");

  if (!deviceController.initialize()) {
    Logger::error("Failed to initialize device controller");
    Logger::info("Retrying in 5 seconds...");
    delay(5000);
    if (!deviceController.initialize()) {
      Logger::error("Device controller initialization failed permanently");
      while (true) {
        delay(1000);
      }
    }
  }

  Logger::success("Device initialized successfully");
  Logger::log("UUID", DEVICE_UUID);
  Logger::log("NAME", DEVICE_NAME);
  Logger::log("IP", wifiClient.getIpAddress());
  Logger::log("SIGNAL", String(wifiClient.getSignalStrength()) + " dBm");
}

void loop() {
  deviceController.update();
  delay(10);
}