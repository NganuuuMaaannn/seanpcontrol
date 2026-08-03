import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Device } from '@/types';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '@/constants/theme';
import { deviceService } from '@/services/device_service';

interface DeviceCardProps {
  device: Device;
  onPress: (device: Device) => void;
  onPowerPress?: (device: Device) => void;
}

export function DeviceCard({ device, onPress, onPowerPress }: DeviceCardProps) {
  const statusColor = deviceService.getDeviceStatusColor(device.status);
  const signalLabel = deviceService.getSignalStrengthLabel(device.wifi_signal);
  const lastSeen = deviceService.formatLastSeen(device.last_seen);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(device)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.name} numberOfLines={1}>
            {device.device_name}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{device.status}</Text>
          </View>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>WiFi Signal</Text>
          <Text style={styles.value}>{signalLabel}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Last Seen</Text>
          <Text style={styles.value}>{lastSeen}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Firmware</Text>
          <Text style={styles.value}>{device.firmware_version}</Text>
        </View>
      </View>

      {onPowerPress && device.status === 'online' && (
        <TouchableOpacity
          style={[styles.powerButton, { backgroundColor: COLORS.success }]}
          onPress={() => onPowerPress(device)}
        >
          <Text style={styles.powerButtonText}>Power</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  header: {
    marginBottom: SPACING.sm,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  statusText: {
    color: COLORS.surface,
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
  },
  infoContainer: {
    marginBottom: SPACING.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  label: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  value: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: '500',
  },
  powerButton: {
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  powerButtonText: {
    color: COLORS.surface,
    ...TYPOGRAPHY.body,
    fontWeight: '600',
  },
});