#include "http_client.h"

HttpClient::HttpClient() : maxRetries(HTTP_MAX_RETRIES), retryDelayMs(HTTP_RETRY_DELAY_MS) {}

bool HttpClient::begin() {
  if (DEBUG_SERIAL) {
    Serial.println("[HTTP] Initializing HTTP client...");
  }
  return true;
}

String HttpClient::buildUrl(const String& endpoint) {
  String url = SUPABASE_URL;
  url += SUPABASE_API_ENDPOINT;
  url += endpoint;
  return url;
}

HttpResponse HttpClient::executeRequest(HttpMethod method, const String& url, const String& body) {
  HttpResponse response;
  response.success = false;
  response.statusCode = 0;

  for (int attempt = 0; attempt < maxRetries; attempt++) {
    HTTPClient http;
    http.begin(wifiClient, url);
    http.setTimeout(HTTP_TIMEOUT_MS);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("apikey", SUPABASE_ANON_KEY);
    http.addHeader("Authorization", String("Bearer ") + SUPABASE_ANON_KEY);

    int httpCode = 0;

    switch (method) {
      case HTTP_GET:
        httpCode = http.GET();
        break;
      case HTTP_POST:
        httpCode = http.POST(body);
        break;
      case HTTP_PUT:
        httpCode = http.PUT(body);
        break;
      case HTTP_DELETE:
        httpCode = http.sendRequest("DELETE");
        break;
    }

    if (httpCode > 0) {
      response.statusCode = httpCode;
      response.body = http.getString();
      response.success = (httpCode >= 200 && httpCode < 300);

      if (DEBUG_SERIAL) {
        Serial.printf("[HTTP] Request to %s: %d\n", url.c_str(), httpCode);
      }

      http.end();
      return response;
    } else {
      if (DEBUG_SERIAL) {
        Serial.printf("[HTTP] Request failed (attempt %d/%d): %s\n",
                      attempt + 1, maxRettries, http.errorToString(httpCode).c_str());
      }
      response.error = http.errorToString(httpCode);
      http.end();
    }

    if (attempt < maxRetries - 1) {
      delay(retryDelayMs);
    }
  }

  return response;
}

HttpResponse HttpClient::get(const String& endpoint) {
  String url = buildUrl(endpoint);
  return executeRequest(HTTP_GET, url);
}

HttpResponse HttpClient::post(const String& endpoint, const String& body) {
  String url = buildUrl(endpoint);
  return executeRequest(HTTP_POST, url, body);
}

HttpResponse HttpClient::put(const String& endpoint, const String& body) {
  String url = buildUrl(endpoint);
  return executeRequest(HTTP_PUT, url, body);
}

HttpResponse HttpClient::del(const String& endpoint) {
  String url = buildUrl(endpoint);
  return executeRequest(HTTP_DELETE, url);
}

void HttpClient::setMaxRetries(int retries) {
  maxRetries = retries;
}

void HttpClient::setRetryDelay(int delayMs) {
  retryDelayMs = delayMs;
}