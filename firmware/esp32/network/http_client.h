#ifndef HTTP_CLIENT_H
#define HTTP_CLIENT_H

#include <Arduino.h>
#include <WiFiClient.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "../config/config.h"

enum HttpMethod {
  HTTP_GET,
  HTTP_POST,
  HTTP_PUT,
  HTTP_DELETE
};

struct HttpResponse {
  int statusCode;
  String body;
  bool success;
  String error;
};

class HttpClient {
private:
  WiFiClient wifiClient;
  int maxRetries;
  int retryDelayMs;

  String buildUrl(const String& endpoint);
  HttpResponse executeRequest(HttpMethod method, const String& url, const String& body = "");

public:
  HttpClient();

  bool begin();
  HttpResponse get(const String& endpoint);
  HttpResponse post(const String& endpoint, const String& body);
  HttpResponse put(const String& endpoint, const String& body);
  HttpResponse del(const String& endpoint);

  void setMaxRetries(int retries);
  void setRetryDelay(int delayMs);
};

#endif // HTTP_CLIENT_H