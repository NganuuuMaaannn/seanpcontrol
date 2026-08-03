import { useState, useEffect, useCallback } from 'react';
import { commandService } from '@/services/command_service';
import { Command, CommandType, ApiResponse } from '@/types';

interface UseCommandsReturn {
  commands: Command[];
  loading: boolean;
  error: string | null;
  refreshCommands: () => Promise<void>;
  sendCommand: (deviceId: string, command: CommandType) => Promise<boolean>;
  sendPowerCommand: (deviceId: string) => Promise<boolean>;
  sendResetCommand: (deviceId: string) => Promise<boolean>;
  sendShutdownCommand: (deviceId: string) => Promise<boolean>;
}

export function useCommands(deviceId?: string): UseCommandsReturn {
  const [commands, setCommands] = useState<Command[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCommands = useCallback(async () => {
    if (!deviceId) {
      setCommands([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await commandService.getCommandsByDeviceId(deviceId);

      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setCommands(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch commands');
    } finally {
      setLoading(false);
    }
  }, [deviceId]);

  const refreshCommands = useCallback(async () => {
    await fetchCommands();
  }, [fetchCommands]);

  const sendCommand = useCallback(
    async (targetDeviceId: string, command: CommandType): Promise<boolean> => {
      try {
        const response = await commandService.sendCommand(targetDeviceId, command);

        if (response.error) {
          console.error('Failed to send command:', response.error);
          return false;
        }

        await refreshCommands();
        return true;
      } catch (err: any) {
        console.error('Failed to send command:', err);
        return false;
      }
    },
    [refreshCommands]
  );

  const sendPowerCommand = useCallback(
    async (targetDeviceId: string): Promise<boolean> => {
      return sendCommand(targetDeviceId, 'power');
    },
    [sendCommand]
  );

  const sendResetCommand = useCallback(
    async (targetDeviceId: string): Promise<boolean> => {
      return sendCommand(targetDeviceId, 'reset');
    },
    [sendCommand]
  );

  const sendShutdownCommand = useCallback(
    async (targetDeviceId: string): Promise<boolean> => {
      return sendCommand(targetDeviceId, 'shutdown');
    },
    [sendCommand]
  );

  useEffect(() => {
    fetchCommands();
  }, [fetchCommands]);

  return {
    commands,
    loading,
    error,
    refreshCommands,
    sendCommand,
    sendPowerCommand,
    sendResetCommand,
    sendShutdownCommand,
  };
}