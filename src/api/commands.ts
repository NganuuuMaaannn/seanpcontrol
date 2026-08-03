import { supabaseClient } from './supabase';
import { API_ENDPOINTS } from '@/constants/api';
import { Command, CommandType, ApiResponse } from '@/types';

export const commandsApi = {
  async getAll(): Promise<ApiResponse<Command[]>> {
    return supabaseClient.get<Command[]>(
      `${API_ENDPOINTS.COMMANDS}?select=*&order=created_at.desc`
    );
  },

  async getByDeviceId(deviceId: string): Promise<ApiResponse<Command[]>> {
    return supabaseClient.get<Command[]>(
      `${API_ENDPOINTS.COMMANDS}?device_id=eq.${deviceId}&select=*&order=created_at.desc`
    );
  },

  async getById(id: string): Promise<ApiResponse<Command>> {
    return supabaseClient.get<Command>(
      `${API_ENDPOINTS.COMMANDS}?id=eq.${id}&select=*`
    );
  },

  async create(
    deviceId: string,
    command: CommandType,
    requestedBy?: string
  ): Promise<ApiResponse<Command>> {
    const body: any = {
      device_id: deviceId,
      command,
      status: 'pending',
    };

    if (requestedBy) {
      body.requested_by = requestedBy;
    }

    const result = await supabaseClient.post<Command>(API_ENDPOINTS.COMMANDS, body);

    if (result.error && typeof result.error === 'string' && result.error.includes('duplicate')) {
      return { data: null, error: 'Command already pending' };
    }

    return result;
  },
  async updateStatus(
    id: string,
    status: string
  ): Promise<ApiResponse<Command>> {
    return supabaseClient.put<Command>(
      `${API_ENDPOINTS.COMMANDS}?id=eq.${id}`,
      { status }
    );
  },

  async getPendingByDeviceId(
    deviceId: string
  ): Promise<ApiResponse<Command[]>> {
    return supabaseClient.get<Command[]>(
      `${API_ENDPOINTS.COMMANDS}?device_id=eq.${deviceId}&status=eq.pending&order=created_at.asc`
    );
  },

  async getRecentByDeviceId(
    deviceId: string,
    limit: number = 10
  ): Promise<ApiResponse<Command[]>> {
    return supabaseClient.get<Command[]>(
      `${API_ENDPOINTS.COMMANDS}?device_id=eq.${deviceId}&select=*&order=created_at.desc&limit=${limit}`
    );
  },
};