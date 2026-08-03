import { commandsApi } from '@/api/commands';
import { Command, CommandType, ApiResponse } from '@/types';

let isSending = false;

class CommandService {
  async getAllCommands(): Promise<ApiResponse<Command[]>> {
    return commandsApi.getAll();
  }

  async getCommandsByDeviceId(deviceId: string): Promise<ApiResponse<Command[]>> {
    return commandsApi.getByDeviceId(deviceId);
  }

  async getCommandById(id: string): Promise<ApiResponse<Command>> {
    return commandsApi.getById(id);
  }

  async sendCommand(
    deviceId: string,
    command: CommandType,
    requestedBy?: string
  ): Promise<ApiResponse<Command>> {
    if (isSending) {
      return { data: null, error: 'Already sending' };
    }
    isSending = true;
    try {
      return await commandsApi.create(deviceId, command, requestedBy);
    } finally {
      setTimeout(() => { isSending = false; }, 5000);
    }
  }

  async updateCommandStatus(
    id: string,
    status: string
  ): Promise<ApiResponse<Command>> {
    return commandsApi.updateStatus(id, status);
  }

  async getPendingCommands(deviceId: string): Promise<ApiResponse<Command[]>> {
    return commandsApi.getPendingByDeviceId(deviceId);
  }

  async getRecentCommands(
    deviceId: string,
    limit: number = 10
  ): Promise<ApiResponse<Command[]>> {
    return commandsApi.getRecentByDeviceId(deviceId, limit);
  }

  async sendPowerCommand(deviceId: string): Promise<ApiResponse<Command>> {
    return this.sendCommand(deviceId, 'power');
  }

  async sendResetCommand(deviceId: string): Promise<ApiResponse<Command>> {
    return this.sendCommand(deviceId, 'reset');
  }

  async sendShutdownCommand(deviceId: string): Promise<ApiResponse<Command>> {
    return this.sendCommand(deviceId, 'shutdown');
  }

  async sendRestartCommand(deviceId: string): Promise<ApiResponse<Command>> {
    return this.sendCommand(deviceId, 'restart');
  }

  async sendWakeCommand(deviceId: string): Promise<ApiResponse<Command>> {
    return this.sendCommand(deviceId, 'wake');
  }

  async sendStatusCommand(deviceId: string): Promise<ApiResponse<Command>> {
    return this.sendCommand(deviceId, 'status');
  }

  getCommandLabel(command: CommandType): string {
    switch (command) {
      case 'power':
        return 'Power';
      case 'reset':
        return 'Reset';
      case 'shutdown':
        return 'Shutdown';
      case 'restart':
        return 'Restart';
      case 'wake':
        return 'Wake';
      case 'status':
        return 'Status';
      case 'heartbeat':
        return 'Heartbeat';
      default:
        return 'Unknown';
    }
  }

  getCommandIcon(command: CommandType): string {
    switch (command) {
      case 'power':
        return 'power';
      case 'reset':
        return 'refresh-cw';
      case 'shutdown':
        return 'power-off';
      case 'restart':
        return 'refresh';
      case 'wake':
        return 'sun';
      case 'status':
        return 'activity';
      case 'heartbeat':
        return 'heart';
      default:
        return 'help-circle';
    }
  }

  getCommandColor(command: CommandType): string {
    switch (command) {
      case 'power':
        return '#10B981';
      case 'reset':
        return '#F59E0B';
      case 'shutdown':
        return '#EF4444';
      case 'restart':
        return '#3B82F6';
      case 'wake':
        return '#8B5CF6';
      case 'status':
        return '#6B7280';
      case 'heartbeat':
        return '#EC4899';
      default:
        return '#6B7280';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'pending':
        return '#F59E0B';
      case 'executing':
        return '#3B82F6';
      case 'completed':
        return '#10B981';
      case 'failed':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  }
}

export const commandService = new CommandService();