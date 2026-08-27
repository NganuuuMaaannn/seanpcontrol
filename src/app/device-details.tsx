import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useDeviceCommands } from '@/hooks/useDeviceCommands';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY, SHADOWS } from '@/constants/theme';
import { deviceService } from '@/services/device_service';
import { Device, Command } from '@/types';
import { devicesApi } from '@/api/devices';

export default function DeviceDetailsScreen() {
  const { deviceId } = useLocalSearchParams<{ deviceId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [showCmdHistory, setShowCmdHistory] = useState(false);

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
        const result = Array.isArray(response.data) ? response.data[0] : response.data;
        setDevice(result || null);
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
  const signalColor = deviceService.getSignalStrengthColor(device.wifi_signal);
  const lastSeen = deviceService.formatLastSeen(device.last_seen);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.statusBar}>
        <View style={styles.statusLeft}>
          <Text style={styles.deviceNameLarge}>{device.device_name}</Text>
          <Text style={styles.metaText}>Last seen: {lastSeen}</Text>
          <Text style={[styles.metaText, { color: signalColor }]}>{signalLabel}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.statusTextBadge}>{isOnline ? 'ONLINE' : 'OFFLINE'}</Text>
        </View>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.squareButton, styles.powerButton, (!isOnline || sending) && styles.disabledButton]}
          onPress={sendPowerCommand}
          disabled={!isOnline || sending}
        >
          <Text style={styles.buttonLabel}>POWER</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.squareButton, styles.resetButton, (!isOnline || sending) && styles.disabledButton]}
          onPress={sendResetCommand}
          disabled={!isOnline || sending}
        >
          <Text style={styles.buttonLabel}>RESET</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.historyButton, { bottom: insets.bottom + SPACING.md }]}
        onPress={() => setShowCmdHistory(true)}
      >
        <Text style={styles.historyIcon}>🕐</Text>
      </TouchableOpacity>

      {/* Command History Modal */}
      <Modal visible={showCmdHistory} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowCmdHistory(false)}>
        <View style={[styles.container, { paddingTop: insets.top }]}>
          <View style={styles.historyHeader}>
            <TouchableOpacity onPress={() => setShowCmdHistory(false)}>
              <Text style={styles.modalClose}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Command History</Text>
            <View style={{ width: 50 }} />
          </View>
          <FlatList
            data={commands}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.historyList}
            ListEmptyComponent={<Text style={styles.emptyText}>No commands yet</Text>}
            refreshControl={
              <RefreshControl refreshing={commandsLoading} onRefresh={refreshCommands} />
            }
            renderItem={({ item }: { item: Command }) => {
              const d = new Date(item.created_at);
              const date = `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`;
              const time = d.toLocaleTimeString();
              return (
                <View style={styles.historyItem}>
                  <View style={styles.historyItemLeft}>
                    <Text style={styles.historyCommand}>{item.command}</Text>
                  </View>
                  <View style={styles.historyItemRight}>
                    <Text style={[styles.historyStatus, { color: statusColor }]}>{item.status}</Text>
                    <Text style={styles.historyTime}>{date}  {time}</Text>
                  </View>
                </View>
              );
            }}
          />  
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: SPACING.md,
  },
  loadingText: {
    ...TYPOGRAPHY.body, color: COLORS.textSecondary, textAlign: 'center', marginTop: SPACING.xxl,
  },
  errorText: {
    ...TYPOGRAPHY.body, color: COLORS.danger, textAlign: 'center', marginTop: SPACING.xxl,
  },
  retryButton: {
    backgroundColor: COLORS.primary, padding: SPACING.sm, borderRadius: BORDER_RADIUS.md,
    alignItems: 'center', marginTop: SPACING.md, marginHorizontal: SPACING.xxl,
  },
  retryText: { ...TYPOGRAPHY.body, color: COLORS.surface, fontWeight: '600' },
  modalClose: { ...TYPOGRAPHY.body, color: COLORS.primary, minWidth: 50 },
  statusBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: SPACING.md, backgroundColor: COLORS.surface,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  statusLeft: { flex: 1 },
  deviceNameLarge: { ...TYPOGRAPHY.h2, color: COLORS.text, marginBottom: SPACING.xs },
  metaText: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginBottom: 2 },
  statusBadge: {
    paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full, marginLeft: SPACING.md, marginTop: SPACING.xs,
  },
  statusTextBadge: { color: COLORS.surface, ...TYPOGRAPHY.caption, fontWeight: '700' },
  buttonsContainer: {
    justifyContent: 'center', paddingHorizontal: SPACING.lg, gap: SPACING.md, marginTop: SPACING.xxl,
  },
  squareButton: {
    height: 120, borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center', alignItems: 'center', ...SHADOWS.md,
  },
  powerButton: { backgroundColor: COLORS.success },
  resetButton: { backgroundColor: COLORS.warning },
  disabledButton: { opacity: 0.3 },
  buttonLabel: { ...TYPOGRAPHY.h1, color: COLORS.surface, fontSize: 32, fontWeight: '800' },
  historyButton: {
    position: 'absolute', right: SPACING.lg, width: 50, height: 50,
    borderRadius: 25, backgroundColor: COLORS.surface,
    justifyContent: 'center', alignItems: 'center', ...SHADOWS.md,
  },
  historyIcon: { fontSize: 24 },
  historyHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: SPACING.md, backgroundColor: COLORS.surface,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  modalTitle: { ...TYPOGRAPHY.h3, color: COLORS.text, flex: 1, textAlign: 'center' },
  historyList: { padding: SPACING.md },
  emptyText: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, textAlign: 'center', marginTop: SPACING.xxl },
  historyItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md, marginBottom: SPACING.sm,
  },
  historyItemLeft: { flex: 1 },
  historyItemRight: { alignItems: 'flex-end' },
  historyCommand: { ...TYPOGRAPHY.body, color: COLORS.text, fontWeight: '800', textTransform: 'uppercase' },
  historyStatus: { ...TYPOGRAPHY.caption, fontWeight: '600', textTransform: 'uppercase', marginBottom: 2 },
  historyTime: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary },
});
