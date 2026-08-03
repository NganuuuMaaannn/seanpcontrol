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
import { useDeviceCommands } from '@/hooks/useDeviceCommands';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY, SHADOWS } from '@/constants/theme';
import { deviceService } from '@/services/device_service';
import { Device, Command } from '@/types';
import { devicesApi } from '@/api/devices';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function IndexScreen() {
  const insets = useSafeAreaInsets();
  const [showHistory, setShowHistory] = useState(false);
  const [device, setDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDevice = useCallback(async () => {
    try {
      setLoading(true);
      const response = await devicesApi.getAll();
      if (response.data && response.data.length > 0) {
        setDevice(response.data[0]);
      }
    } catch (err) {
      console.error('Failed to fetch device:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDevice();
  }, [fetchDevice]);

  const {
    commands,
    loading: commandsLoading,
    refreshCommands,
    sendPowerCommand,
    sendResetCommand,
    sending,
  } = useDeviceCommands(device?.id || '');

  const handleRefresh = useCallback(async () => {
    await Promise.all([fetchDevice(), refreshCommands()]);
  }, [fetchDevice, refreshCommands]);

  if (loading || !device) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <LoadingSpinner message="Connecting to device..." />
      </View>
    );
  }

  const isOnline = device.status === 'online';
  const statusColor = deviceService.getDeviceStatusColor(device.status);
  const signalLabel = deviceService.getSignalStrengthLabel(device.wifi_signal);
  const lastSeen = deviceService.formatLastSeen(device.last_seen);

  return (
    <View style={styles.container}>
      <View style={[styles.statusBar, { paddingTop: insets.top }]}>
        <View style={styles.statusLeft}>
          <Text style={styles.deviceName}>{device.device_name}</Text>
          <Text style={styles.metaText}>Last seen: {lastSeen}</Text>
          <Text style={styles.metaText}>{signalLabel}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText}>{isOnline ? 'ONLINE' : 'OFFLINE'}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={loading || commandsLoading} onRefresh={handleRefresh} />
        }
      >
        <TouchableOpacity
          style={[styles.squareButton, styles.powerButton, (!isOnline || sending) && styles.disabledButton]}
          onPress={sendPowerCommand}
          disabled={!isOnline || sending}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonLabel}>POWER</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.squareButton, styles.resetButton, (!isOnline || sending) && styles.disabledButton]}
          onPress={sendResetCommand}
          disabled={!isOnline || sending}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonLabel}>RESET</Text>
        </TouchableOpacity>
      </ScrollView>

      <TouchableOpacity
        style={[styles.historyButton, { bottom: insets.bottom + SPACING.md }]}
        onPress={() => setShowHistory(true)}
      >
        <Text style={styles.historyIcon}>🕐</Text>
      </TouchableOpacity>

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
    backgroundColor: COLORS.surface,
  },
  statusBar: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 20,
  },
  statusLeft: {
    flex: 1,
  },
  deviceName: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  metaText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    marginLeft: SPACING.md,
    marginTop: SPACING.xs,
  },
  statusText: {
    color: COLORS.surface,
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  squareButton: {
    width: '100%',
    height: 120,
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  powerButton: {
    backgroundColor: COLORS.success,
  },
  resetButton: {
    backgroundColor: COLORS.warning,
  },
  disabledButton: {
    opacity: 0.3,
  },
  buttonLabel: {
    ...TYPOGRAPHY.h1,
    color: COLORS.surface,
    fontSize: 32,
    fontWeight: '800',
  },
  historyButton: {
    position: 'absolute',
    right: SPACING.lg,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.md,
  },
  historyIcon: {
    fontSize: 24,
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
  },
  historyStatus: {
    ...TYPOGRAPHY.caption,
    fontWeight: '500',
    marginRight: SPACING.sm,
  },
  historyTime: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
});