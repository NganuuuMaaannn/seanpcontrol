#ifndef CONFIG_H
#define CONFIG_H

// WiFi Configuration
#define WIFI_SSID "YOUR_WIFI_SSID"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"
#define WIFI_CONNECT_TIMEOUT_MS 10000
#define WIFI_RECONNECT_INTERVAL_MS 5000

// Supabase Configuration
#define SUPABASE_URL "YOUR_SUPABASE_URL"
#define SUPABASE_ANON_KEY "YOUR_SUPABASE_ANON_KEY"
#define SUPABASE_API_ENDPOINT "/rest/v1/"

// Device Configuration
#define DEVICE_UUID "YOUR_DEVICE_UUID"
#define DEVICE_NAME "SeanPControl Device"
#define FIRMWARE_VERSION "1.0.0"

// Polling Configuration
#define COMMAND_POLL_INTERVAL_MS 2000
#define HEARTBEAT_INTERVAL_MS 30000
#define STATUS_UPDATE_INTERVAL_MS 10000

// GPIO Pin Assignments
#define GPIO_POWER_BUTTON 26
#define GPIO_RESET_BUTTON 27
#define GPIO_FORCE_SHUTDOWN 25

// Button Press Durations (ms)
#define PRESS_DURATION_SHORT 300
#define PRESS_DURATION_LONG 5000

// HTTP Configuration
#define HTTP_TIMEOUT_MS 5000
#define HTTP_MAX_RETRIES 3
#define HTTP_RETRY_DELAY_MS 1000

// Debug Configuration
#define DEBUG_SERIAL true
#define DEBUG_BAUD_RATE 115200

#endif // CONFIG_H