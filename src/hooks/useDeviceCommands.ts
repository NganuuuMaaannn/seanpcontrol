import { useState, useEffect, useCallback, useRef } from 'react';
import { commandService } from '@/services/command_service';
import { Command, CommandType } from '@/types';

interface UseDeviceCommandsReturn {
  commands: Command[];
  loading: boolean;
  error: string | null;
  sending: boolean;
  refreshCommands: () => Promise<void>;
  sendCommand: (command: CommandType) => Promise<boolean>;
  sendPowerCommand: () => Promise<boolean>;
  sendResetCommand: () => Promise<boolean>;
  sendShutdownCommand: () => Promise<boolean>;
  sendRestartCommand: () => Promise<boolean>;
  sendWakeCommand: () => Promise<boolean>;
  sendStatusCommand: () => Promise<boolean>;
}

export function useDeviceCommands(deviceId: string): UseDeviceCommandsReturn {
  const [commands, setCommands] = useState<Command[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sendingRef = useRef(false);

  const fetchCommands = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await commandService.getRecentCommands(deviceId, 20);

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
    async (command: CommandType): Promise<boolean> => {
      if (sendingRef.current) return false;
      sendingRef.current = true;
      setSending(true);
      try {
        const response = await commandService.sendCommand(deviceId, command);
        if (response.error) {
          return false;
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
        await refreshCommands();
        return true;
      } catch (err: any) {
        return false;
      } finally {
        await new Promise(resolve => setTimeout(resolve, 5000));
        sendingRef.current = false;
        setSending(false);
      }
    },
    [deviceId, refreshCommands]
  );

  const sendPowerCommand = useCallback(
    async (): Promise<boolean> => sendCommand('power'),
    [sendCommand]
  );

  const sendResetCommand = useCallback(
    async (): Promise<boolean> => sendCommand('reset'),
    [sendCommand]
  );

  const sendShutdownCommand = useCallback(
    async (): Promise<boolean> => sendCommand('shutdown'),
    [sendCommand]
  );

  const sendRestartCommand = useCallback(
    async (): Promise<boolean> => sendCommand('restart'),
    [sendCommand]
  );

  const sendWakeCommand = useCallback(
    async (): Promise<boolean> => sendCommand('wake'),
    [sendCommand]
  );

  const sendStatusCommand = useCallback(
    async (): Promise<boolean> => sendCommand('status'),
    [sendCommand]
  );

  useEffect(() => {
    fetchCommands();
  }, [fetchCommands]);

  return {
    commands,
    loading,
    sending,
    error,
    refreshCommands,
    sendCommand,
    sendPowerCommand,
    sendResetCommand,
    sendShutdownCommand,
    sendRestartCommand,
    sendWakeCommand,
    sendStatusCommand,
  };
}