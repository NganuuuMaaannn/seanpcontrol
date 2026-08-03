import React, { useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useDevices } from '@/hooks/useDevices';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY, SHADOWS } from '@/constants/theme';
import { deviceService } from '@/services/device_service';
import { Device } from '@/types';

export default function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { devices, loading, error, refreshDevices } = useDevices();

  const handleDevicePress = useCallback(
    (device: Device) => {
      router.push({
        pathname: '/device-details',
        params: { deviceId: device.id },
      });
    },
    [router]
  );

  const renderItem = useCallback(
    ({ item }: { item: Device }) => {
      const isOnline = item.status === 'online';
      const statusColor = deviceService.getDeviceStatusColor(item.status);
      const signalLabel = deviceService.getSignalStrengthLabel(item.wifi_signal);
      const lastSeen = deviceService.formatLastSeen(item.last_seen);

      return (
        <TouchableOpacity
          style={styles.card}
          onPress={() => handleDevicePress(item)}
          activeOpacity={0.7}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.deviceName} numberOfLines={1}>
              {item.device_name}
            </Text>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
            <Text style={styles.signalText}>{signalLabel}</Text>
          </View>
          <Text style={styles.lastSeenText}>Last seen: {lastSeen}</Text>
        </TouchableOpacity>
      );
    },
    [handleDevicePress]
  );

  if (loading && devices.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.loadingText}>Loading devices...</Text>
      </View>
    );
  }

  if (error && devices.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refreshDevices}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title}>SeanPControl</Text>
      <FlatList
        data={devices}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refreshDevices} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No devices found</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.primary,
    textAlign: 'center',
    paddingVertical: SPACING.md,
  },
  list: {
    padding: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  deviceName: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    flex: 1,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  cardInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  statusText: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
  },
  signalText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  lastSeenText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
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
  emptyText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xxl,
  },
});