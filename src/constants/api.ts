import Constants from 'expo-constants';

const ENV = {
  SUPABASE_URL: Constants.expoConfig?.extra?.supabaseUrl || '',
  SUPABASE_ANON_KEY: Constants.expoConfig?.extra?.supabaseAnonKey || '',
  SUPABASE_API_URL: Constants.expoConfig?.extra?.supabaseApiUrl || '',
};

export const API_CONFIG = {
  SUPABASE_URL: ENV.SUPABASE_URL,
  SUPABASE_ANON_KEY: ENV.SUPABASE_ANON_KEY,
  SUPABASE_API_URL: ENV.SUPABASE_API_URL,
  TIMEOUT: 10000,
  MAX_RETRIES: 3,
} as const;

export const API_ENDPOINTS = {
  DEVICES: '/rest/v1/devices',
  COMMANDS: '/rest/v1/commands',
  LOGS: '/rest/v1/logs',
  DEVICE_HEARTBEAT: '/functions/v1/device-heartbeat',
  DEVICE_COMMAND: '/functions/v1/device-command',
  FETCH_COMMANDS: '/functions/v1/fetch-commands',
  UPDATE_COMMAND_STATUS: '/functions/v1/update-command-status',
  INSERT_LOG: '/functions/v1/insert-log',
} as const;