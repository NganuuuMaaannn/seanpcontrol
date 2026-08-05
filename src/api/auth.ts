import { supabaseClient } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiResponse } from '@/types';

interface AuthSession {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
  };
}

export const authApi = {
  async signUp(email: string, password: string): Promise<ApiResponse<AuthSession>> {
    const result = await supabaseClient.signUp(email, password);
    if (result.error) {
      return { data: null, error: result.error };
    }
    if (result.data) {
      await this.saveSession(result.data);
    }
    return result;
  },

  async signIn(email: string, password: string): Promise<ApiResponse<AuthSession>> {
    const result = await supabaseClient.signIn(email, password);
    if (result.error) {
      return { data: null, error: result.error };
    }
    if (result.data) {
      await this.saveSession(result.data);
    }
    return result;
  },

  async signOut(): Promise<void> {
    await AsyncStorage.multiRemove(['auth_session', 'username']);
    supabaseClient.setAccessToken(null);
  },

  async loadSession(): Promise<AuthSession | null> {
    try {
      const json = await AsyncStorage.getItem('auth_session');
      if (json) {
        let session: AuthSession = JSON.parse(json);

        // Check if token is expired
        if (this.isTokenExpired(session.access_token)) {
          // Try to refresh
          const refreshed = await this.refreshToken(session.refresh_token);
          if (refreshed) {
            session = refreshed;
            await this.saveSession(session);
          } else {
            // Refresh failed, clear session
            await this.signOut();
            return null;
          }
        }

        supabaseClient.setAccessToken(session.access_token);
        return session;
      }
    } catch {}
    return null;
  },

  isTokenExpired(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return true;
      const payload = JSON.parse(atob(parts[1]));
      const exp = payload.exp * 1000; // convert to ms
      return Date.now() >= exp;
    } catch {
      return true;
    }
  },

  async refreshToken(refreshToken: string): Promise<AuthSession | null> {
    try {
      const res = await fetch(`${supabaseClient['baseUrl']}/auth/v1/token?grant_type=refresh_token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: supabaseClient['anonKey'],
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (res.ok) {
        const data = await res.json();
        return {
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          user: data.user,
        };
      }
    } catch {}
    return null;
  },

  async saveSession(session: AuthSession): Promise<void> {
    await AsyncStorage.setItem('auth_session', JSON.stringify(session));
    supabaseClient.setAccessToken(session.access_token);
  },

  async getUserId(): Promise<string | null> {
    // First try in-memory token
    let token = supabaseClient.getAccessToken();

    // If no token, try loading from storage
    if (!token) {
      const session = await this.loadSession();
      if (session) {
        token = session.access_token;
      }
    }

    if (!token) return null;

    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payload = JSON.parse(atob(parts[1]));
      return payload.sub || null;
    } catch {
      return null;
    }
  },

  async getUsername(): Promise<string | null> {
    return AsyncStorage.getItem('username');
  },

  async saveUsername(username: string): Promise<void> {
    await AsyncStorage.setItem('username', username);
  },
};
