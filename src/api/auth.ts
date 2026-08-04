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
    await AsyncStorage.removeItem('auth_session');
    supabaseClient.setAccessToken(null);
  },

  async loadSession(): Promise<AuthSession | null> {
    try {
      const json = await AsyncStorage.getItem('auth_session');
      if (json) {
        const session: AuthSession = JSON.parse(json);
        supabaseClient.setAccessToken(session.access_token);
        return session;
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
