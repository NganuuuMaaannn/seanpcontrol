import { API_CONFIG, API_ENDPOINTS } from '@/constants/api';
import { ApiResponse } from '@/types';

class SupabaseClient {
  private baseUrl: string;
  private anonKey: string;
  private timeout: number;
  private maxRetries: number;

  constructor() {
    this.baseUrl = API_CONFIG.SUPABASE_URL;
    this.anonKey = API_CONFIG.SUPABASE_ANON_KEY;
    this.timeout = API_CONFIG.TIMEOUT;
    this.maxRetries = API_CONFIG.MAX_RETRIES;
  }

  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      apikey: this.anonKey,
      Authorization: `Bearer ${this.anonKey}`,
    };
  }

  private async request<T>(
    method: string,
    endpoint: string,
    body?: any
  ): Promise<ApiResponse<T>> {
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          method,
          headers: this.getHeaders(),
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          return {
            data: null,
            error: errorData.message || `HTTP error ${response.status}`,
          };
        }

        const data = await response.json();
        return { data, error: null };
      } catch (error: any) {
        if (attempt === this.maxRetries - 1) {
          return {
            data: null,
            error: error.message || 'Network request failed',
          };
        }
        await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }

    return { data: null, error: 'Max retries exceeded' };
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint);
  }

  async post<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, body);
  }

  async put<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, body);
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint);
  }
}

export const supabaseClient = new SupabaseClient();