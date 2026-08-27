import { devicesApi } from '@/api/devices';
import { Device, ApiResponse } from '@/types';

class DeviceService {
  async getAllDevices(): Promise<ApiResponse<Device[]>> {
    return devicesApi.getAll();
  }

  async getDeviceById(id: string): Promise<ApiResponse<Device>> {
    return devicesApi.getById(id);
  }

  async getDeviceByUuid(uuid: string): Promise<ApiResponse<Device>> {
    return devicesApi.getByUuid(uuid);
  }

  async createDevice(device: Partial<Device>): Promise<ApiResponse<Device>> {
    return devicesApi.create(device);
  }

  async updateDevice(
    id: string,
    updates: Partial<Device>
  ): Promise<ApiResponse<Device>> {
    return devicesApi.update(id, updates);
  }

  async deleteDevice(id: string): Promise<ApiResponse<void>> {
    return devicesApi.delete(id);
  }

  async getOnlineDevices(): Promise<ApiResponse<Device[]>> {
    return devicesApi.getOnlineDevices();
  }

  async refreshDevice(deviceId: string): Promise<ApiResponse<Device>> {
    return devicesApi.getById(deviceId);
  }

  isDeviceOnline(device: Device): boolean {
    return device.status === 'online';
  }

  getDeviceStatusColor(status: string | undefined): string {
    if (!status) return '#6B7280';
    switch (status) {
      case 'online':
        return '#10B981';
      case 'offline':
        return '#6B7280';
      case 'busy':
        return '#F59E0B';
      case 'error':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  }

  getSignalStrengthLabel(signal: number | undefined): string {
    if (signal === undefined || signal === null) return 'Unknown';
    if (signal >= -50) return 'Excellent';
    if (signal >= -60) return 'Good';
    if (signal >= -70) return 'Fair';
    if (signal >= -80) return 'Weak';
    return 'Very Weak';
  }

  getSignalStrengthColor(signal: number | undefined): string {
    if (signal === undefined || signal === null) return '#6B7280';
    if (signal >= -50) return '#10B981';
    if (signal >= -60) return '#34D399';
    if (signal >= -70) return '#F59E0B';
    if (signal >= -80) return '#F97316';
    return '#EF4444';
  }

  formatLastSeen(lastSeen: string | undefined): string {
    if (!lastSeen) return 'Never';
    try {
      const date = new Date(lastSeen);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${diffDays}d ago`;
    } catch {
      return 'Unknown';
    }
  }
}

export const deviceService = new DeviceService();