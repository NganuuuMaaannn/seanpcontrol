import { supabaseClient } from './supabase';
import { API_ENDPOINTS } from '@/constants/api';
import { Device, ApiResponse } from '@/types';

export const devicesApi = {
  async getAll(): Promise<ApiResponse<Device[]>> {
    return supabaseClient.get<Device[]>(
      `${API_ENDPOINTS.DEVICES}?select=*&order=created_at.desc`
    );
  },

  async getById(id: string): Promise<ApiResponse<Device>> {
    return supabaseClient.get<Device>(
      `${API_ENDPOINTS.DEVICES}?id=eq.${id}&select=*`
    );
  },

  async getByUuid(uuid: string): Promise<ApiResponse<Device>> {
    return supabaseClient.get<Device>(
      `${API_ENDPOINTS.DEVICES}?uuid=eq.${uuid}&select=*`
    );
  },

  async create(device: Partial<Device>): Promise<ApiResponse<Device>> {
    return supabaseClient.post<Device>(API_ENDPOINTS.DEVICES, device);
  },

  async update(
    id: string,
    updates: Partial<Device>
  ): Promise<ApiResponse<Device>> {
    return supabaseClient.put<Device>(
      `${API_ENDPOINTS.DEVICES}?id=eq.${id}`,
      updates
    );
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    return supabaseClient.delete<void>(
      `${API_ENDPOINTS.DEVICES}?id=eq.${id}`
    );
  },

  async getOnlineDevices(): Promise<ApiResponse<Device[]>> {
    return supabaseClient.get<Device[]>(
      `${API_ENDPOINTS.DEVICES}?status=eq.online&order=device_name.asc`
    );
  },
};