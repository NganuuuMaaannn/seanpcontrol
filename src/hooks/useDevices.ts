import { useState, useEffect, useCallback } from 'react';
import { deviceService } from '@/services/device_service';
import { Device, ApiResponse } from '@/types';

interface UseDevicesReturn {
  devices: Device[];
  loading: boolean;
  error: string | null;
  refreshDevices: () => Promise<void>;
  getDevice: (id: string) => Promise<Device | null>;
}

export function useDevices(): UseDevicesReturn {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDevices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await deviceService.getAllDevices();

      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setDevices(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch devices');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshDevices = useCallback(async () => {
    await fetchDevices();
  }, [fetchDevices]);

  const getDevice = useCallback(async (id: string): Promise<Device | null> => {
    try {
      const response = await deviceService.getDeviceById(id);

      if (response.error) {
        console.error('Failed to get device:', response.error);
        return null;
      }

      return response.data;
    } catch (err: any) {
      console.error('Failed to get device:', err);
      return null;
    }
  }, []);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  return {
    devices,
    loading,
    error,
    refreshDevices,
    getDevice,
  };
}