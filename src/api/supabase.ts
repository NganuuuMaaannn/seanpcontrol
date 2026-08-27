import { API_CONFIG, API_ENDPOINTS } from '@/constants/api';
import { ApiResponse } from '@/types';

class SupabaseClient {
  private baseUrl: string;
  private anonKey: string;
  private timeout: number;
  private maxRetries: number;
  private accessToken: string | null = null;

  constructor() {
    this.baseUrl = API_CONFIG.SUPABASE_URL;
    this.anonKey = API_CONFIG.SUPABASE_ANON_KEY;
    this.timeout = API_CONFIG.TIMEOUT;
    this.maxRetries = API_CONFIG.MAX_RETRIES;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      apikey: this.anonKey,
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    } else {
      headers['Authorization'] = `Bearer ${this.anonKey}`;
    }

    return headers;
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  getAnonKey(): string {
    return this.anonKey;
  }

  private async request<T>(
    method: string,
    endpoint: string,
    body?: any,
    useAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const headers = useAuth ? this.getHeaders() : {
          'Content-Type': 'application/json',
          apikey: this.anonKey,
          'Authorization': `Bearer ${this.anonKey}`,
        };

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          return {
            data: null,
            error: errorData.message || errorData.error_description || `HTTP error ${response.status}`,
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

  // ---- AUTH ----
  async signUp(email: string, password: string): Promise<ApiResponse<any>> {
    return this.request('POST', '/auth/v1/signup', { email, password }, false);
  }

  async signIn(email: string, password: string): Promise<ApiResponse<any>> {
    return this.request('POST', '/auth/v1/token?grant_type=password', { email, password }, false);
  }

  async signOut(): Promise<void> {
    this.accessToken = null;
  }

  async getCurrentUser(): Promise<ApiResponse<any>> {
    if (!this.accessToken) {
      return { data: null, error: 'Not authenticated' };
    }
    return this.request('GET', '/auth/v1/user');
  }

  // ---- REST ----
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint);
  }

  async post<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, body);
  }

  async put<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, body);
  }

  async patch<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', endpoint, body);
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint);
  }
}

export const supabaseClient = new SupabaseClient();