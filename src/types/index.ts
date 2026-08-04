export interface Device {
  id: string;
  uuid: string;
  device_name: string;
  device_serial: string;
  firmware_version: string;
  status: 'offline' | 'online' | 'busy' | 'error';
  wifi_signal: number;
  ip_address: string;
  last_seen: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface Command {
  id: string;
  device_id: string;
  command: CommandType;
  status: CommandStatus;
  requested_by: string;
  created_at: string;
  executed_at: string;
}

export type CommandType =
  | 'power'
  | 'reset'
  | 'shutdown'
  | 'restart'
  | 'wake'
  | 'status'
  | 'heartbeat';

export type CommandStatus =
  | 'pending'
  | 'executing'
  | 'completed'
  | 'failed';

export interface Log {
  id: string;
  device_id: string;
  command: string;
  success: boolean;
  message: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface DeviceCommandRequest {
  device_uuid: string;
  command: CommandType;
  requested_by?: string;
}

export interface DeviceHeartbeatRequest {
  device_uuid: string;
}

export interface CommandStatusUpdateRequest {
  command_id: string;
  status: CommandStatus;
  error_message?: string;
}

export interface LogInsertRequest {
  device_uuid: string;
  command: string;
  success: boolean;
  message?: string;
}