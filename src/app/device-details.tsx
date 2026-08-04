import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  Modal,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { useDeviceCommands } from '@/hooks/useDeviceCommands';
import { CommandButton } from '@/components/CommandButton';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY, SHADOWS } from '@/constants/theme';
import { deviceService } from '@/services/device_service';
import { Device, Command } from '@/types';
import { devicesApi } from '@/api/devices';

export default function DeviceDetailsScreen() {
  const { deviceId } = useLocalSearchParams<{ deviceId: string }>();
  const insets = useSafeAreaInsets();
  const [showHistory, setShowHistory] = useState(false);

  const {
    commands,
    loading: commandsLoading,
    refreshCommands,
    sendPowerCommand,
    sendResetCommand,
    sending,
  } = useDeviceCommands(deviceId!);

  const [device, setDevice] = React.useState<Device | null>(null);
  const [deviceLoading, setDeviceLoading] = React.useState(true);
  const [deviceError, setDeviceError] = React.useState<string | null>(null);

  const fetchDevice = useCallback(async () => {
    if (!deviceId) return;
    try {
      setDeviceLoading(true);
      setDeviceError(null);
      const response = await devicesApi.getById(deviceId);
      if (response.error) {
        setDeviceError(response.error);
      } else if (response.data) {
        setDevice(response.data);
      }
    } catch (err: any) {
      setDeviceError(err.message || 'Failed to fetch device');
    } finally {
      setDeviceLoading(false);
    }
  }, [deviceId]);

  useEffect(() => {
    fetchDevice();
  }, [fetchDevice]);

  const handleRefresh = useCallback(async () => {
    await Promise.all([fetchDevice(), refreshCommands()]);
  }, [fetchDevice, refreshCommands]);

  if (deviceLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (deviceError || !device) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>{deviceError || 'Device not found'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchDevice}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isOnline = device.status === 'online';
  const statusColor = deviceService.getDeviceStatusColor(device.status);
  const signalLabel = deviceService.getSignalStrengthLabel(device.wifi_signal);
  const lastSeen = deviceService.formatLastSeen(device.last_seen);

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={deviceLoading || commandsLoading} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.statusHeader}>
          <Text style={styles.deviceName}>{device.device_name}</Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
            <Text style={styles.signalText}>{signalLabel}</Text>
          </View>
          <Text style={styles.lastSeenText}>Last seen: {lastSeen}</Text>
        </View>

        <View style={styles.buttonsContainer}>
          <CommandButton
            command="power"
            onPress={sendPowerCommand}
            disabled={!isOnline || sending}
            size="large"
          />

          <CommandButton
            command="reset"
            onPress={sendResetCommand}
            disabled={!isOnline || sending}
            size="large"
          />
        </View>

        <TouchableOpacity
          style={styles.historyToggle}
          onPress={() => setShowHistory(true)}
        >
          <Text style={styles.historyToggleText}>Command History</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={showHistory} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modalContainer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Command History</Text>
            <TouchableOpacity onPress={() => setShowHistory(false)}>
              <Text style={styles.modalClose}>Done</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={commands}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.historyList}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No commands yet</Text>
            }
            renderItem={({ item }: { item: Command }) => (
              <View style={styles.historyItem}>
                <Text style={styles.historyCommand}>{item.command}</Text>
                <Text style={[styles.historyStatus, { color: statusColor }]}>
                  {item.status}
                </Text>
                <Text style={styles.historyTime}>
                  {new Date(item.created_at).toLocaleTimeString()}
                </Text>
              </View>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.md,
  },
  loadingText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xxl,
  },
  errorText: {
    ...TYPOGRAPHY.body,
    color: COLORS.danger,
    textAlign: 'center',
    marginTop: SPACING.xxl,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.md,
    marginHorizontal: SPACING.xxl,
  },
  retryText: {
    ...TYPOGRAPHY.body,
    color: COLORS.surface,
    fontWeight: '600',
  },
  statusHeader: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  deviceName: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: SPACING.sm,
  },
  statusText: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    marginRight: SPACING.md,
  },
  signalText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  lastSeenText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  historyToggle: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  historyToggleText: {
    ...TYPOGRAPHY.body,
    color: COLORS.primary,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },
  modalClose: {
    ...TYPOGRAPHY.body,
    color: COLORS.primary,
    fontWeight: '600',
  },
  historyList: {
    padding: SPACING.md,
  },
  emptyText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xxl,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  historyCommand: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: '600',
    flex: 1,
    textTransform: 'uppercase',
  },
  historyStatus: {
    ...TYPOGRAPHY.caption,
    fontWeight: '500',
    marginRight: SPACING.sm,
    textTransform: 'uppercase',
  },
  historyTime: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
});