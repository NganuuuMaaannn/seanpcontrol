import { supabaseClient } from './supabase';
import { API_ENDPOINTS } from '@/constants/api';
import { Log, ApiResponse } from '@/types';

export const logsApi = {
  async getAll(): Promise<ApiResponse<Log[]>> {
    return supabaseClient.get<Log[]>(
      `${API_ENDPOINTS.LOGS}?select=*&order=created_at.desc`
    );
  },

  async getByDeviceId(deviceId: string): Promise<ApiResponse<Log[]>> {
    return supabaseClient.get<Log[]>(
      `${API_ENDPOINTS.LOGS}?device_id=eq.${deviceId}&select=*&order=created_at.desc`
    );
  },

  async getById(id: string): Promise<ApiResponse<Log>> {
    return supabaseClient.get<Log>(
      `${API_ENDPOINTS.LOGS}?id=eq.${id}&select=*`
    );
  },

  async create(log: Partial<Log>): Promise<ApiResponse<Log>> {
    return supabaseClient.post<Log>(API_ENDPOINTS.LOGS, log);
  },

  async getRecentByDeviceId(
    deviceId: string,
    limit: number = 50
  ): Promise<ApiResponse<Log[]>> {
    return supabaseClient.get<Log[]>(
      `${API_ENDPOINTS.LOGS}?device_id=eq.${deviceId}&select=*&order=created_at.desc&limit=${limit}`
    );
  },
};