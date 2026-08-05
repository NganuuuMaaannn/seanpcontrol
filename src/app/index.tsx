import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Modal,
  BackHandler,
  Animated,
  PanResponder,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDeviceCommands } from '@/hooks/useDeviceCommands';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY, SHADOWS } from '@/constants/theme';
import { deviceService } from '@/services/device_service';
import { Device, Command } from '@/types';
import { devicesApi } from '@/api/devices';
import { authApi } from '@/api/auth';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import LoginScreen from './login';
import SetupScreen from './setup';

// ---- Swipeable Device Card ----
function SwipeableCard({
  device,
  onPress,
  onDelete,
}: {
  device: Device;
  onPress: () => void;
  onDelete: () => void;
}) {
  const translateX = useRef(new Animated.Value(0)).current;
  const deleteWidth = 90;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy),
      onPanResponderMove: (_, gestureState) => {
        const newValue = Math.min(0, Math.max(-deleteWidth, gestureState.dx));
        translateX.setValue(newValue);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -40) {
          Animated.spring(translateX, { toValue: -deleteWidth, useNativeDriver: false }).start();
        } else {
          Animated.spring(translateX, { toValue: 0, useNativeDriver: false }).start();
        }
      },
    })
  ).current;

  const isOnline = device.status === 'online';
  const statusColor = deviceService.getDeviceStatusColor(device.status);
  const signalLabel = deviceService.getSignalStrengthLabel(device.wifi_signal);
  const lastSeen = deviceService.formatLastSeen(device.last_seen);

  return (
    <View style={styles.cardWrapper}>
      <View style={styles.deleteBehind}>
        <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
          <Text style={styles.deleteBtnText}>Delete</Text>
        </TouchableOpacity>
      </View>
      <Animated.View
        style={[styles.card, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={styles.cardTouchable}
          onPress={onPress}
          activeOpacity={0.7}
        >
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Text style={styles.deviceName} numberOfLines={1}>{device.device_name}</Text>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            </View>
            <View style={styles.cardInfo}>
              <Text style={[styles.statusText, { color: statusColor }]}>
                {isOnline ? 'Online' : 'Offline'}
              </Text>
              <Text style={styles.signalText}>{signalLabel}</Text>
            </View>
            <Text style={styles.lastSeenText}>Last seen: {lastSeen}</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

export default function IndexScreen() {
  const insets = useSafeAreaInsets();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSetup, setShowSetup] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [username, setUsername] = useState('');
  const [deletingDevice, setDeletingDevice] = useState<Device | null>(null);

  // Check auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      const session = await authApi.loadSession();
      setIsLoggedIn(!!session);
      const storedUsername = await authApi.getUsername();
      if (storedUsername) {
        setUsername(storedUsername);
      } else if (session?.user?.email) {
        setUsername(session.user.email.split('@')[0]);
      }
      setAuthLoading(false);
    };
    checkAuth();
  }, []);

  const fetchDevices = useCallback(async () => {
    try {
      setLoading(true);
      const response = await devicesApi.getAll();
      if (response.data) {
        setDevices(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch devices:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchDevices();
    }
  }, [isLoggedIn, fetchDevices]);

  const handleLogout = useCallback(async () => {
    await authApi.signOut();
    setIsLoggedIn(false);
    setDevices([]);
  }, []);

  const handleDelete = useCallback(async (device: Device) => {
    setDeletingDevice(device);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deletingDevice) return;
    try {
      await devicesApi.delete(deletingDevice.id);
      setDevices(prev => prev.filter(d => d.id !== deletingDevice.id));
    } catch (err) {
      console.error('Failed to delete:', err);
    }
    setDeletingDevice(null);
  }, [deletingDevice]);

  const handleDevicePress = useCallback((device: Device) => {
    setSelectedDevice(device);
    setShowHistory(true);
  }, []);

  const renderDevice = useCallback(({ item }: { item: Device }) => (
    <SwipeableCard
      device={item}
      onPress={() => handleDevicePress(item)}
      onDelete={() => handleDelete(item)}
    />
  ), [handleDevicePress, handleDelete]);

  // Auth loading
  if (authLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <LoadingSpinner message="Loading..." />
      </View>
    );
  }

  // Not logged in
  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;
  }

  // Show setup screen
  if (showSetup) {
    return <SetupScreen onComplete={() => { setShowSetup(false); fetchDevices(); }} onCancel={() => setShowSetup(false)} />;
  }

  // Loading devices
  if (loading && devices.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <LoadingSpinner message="Loading devices..." />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>SeanPControl</Text>
        <TouchableOpacity style={styles.profileBtn} onPress={() => setShowProfile(true)}>
          <Text style={styles.profileIcon}>👤</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={devices}
        renderItem={renderDevice}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchDevices} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No devices found</Text>
            <Text style={styles.emptyHint}>Tap the + button to add your first device</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={[styles.addButton, { bottom: insets.bottom + SPACING.lg }]}
        onPress={() => setShowSetup(true)}
      >
        <Text style={styles.addIcon}>+</Text>
      </TouchableOpacity>

      {/* Profile Modal */}
      <Modal visible={showProfile} animationType="fade" transparent>
        <TouchableOpacity
          style={styles.profileOverlay}
          activeOpacity={1}
          onPress={() => setShowProfile(false)}
        >
          <View style={[styles.profileModal, { top: insets.top + SPACING.sm, right: SPACING.md }]}>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{username}</Text>
            </View>
            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={() => { setShowProfile(false); handleLogout(); }}
            >
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal visible={!!deletingDevice} transparent animationType="fade">
        <TouchableOpacity
          style={styles.deleteOverlay}
          activeOpacity={1}
          onPress={() => setDeletingDevice(null)}
        >
          <View style={styles.deleteModal}>
            <Text style={styles.deleteTitle}>Delete Device</Text>
            <Text style={styles.deleteText}>
              Remove "{deletingDevice?.device_name}" from your devices?
            </Text>
            <View style={styles.deleteButtons}>
              <TouchableOpacity
                style={styles.deleteCancelBtn}
                onPress={() => setDeletingDevice(null)}
              >
                <Text style={styles.deleteCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteConfirmBtn}
                onPress={confirmDelete}
              >
                <Text style={styles.deleteConfirmText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Device Control Modal */}
      <Modal visible={showHistory} animationType="slide" presentationStyle="pageSheet">
        <DeviceControlModal
          device={selectedDevice}
          onClose={() => { setShowHistory(false); setSelectedDevice(null); fetchDevices(); }}
        />
      </Modal>
    </View>
  );
}

// ---- Device Control Modal ----
function DeviceControlModal({ device, onClose }: { device: Device | null; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const [showCmdHistory, setShowCmdHistory] = useState(false);

  // Handle Android back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (showCmdHistory) {
        setShowCmdHistory(false);
        return true;
      }
      onClose();
      return true;
    });
    return () => backHandler.remove();
  }, [showCmdHistory, onClose]);

  const {
    commands,
    loading: commandsLoading,
    refreshCommands,
    sendPowerCommand,
    sendResetCommand,
    sending,
  } = useDeviceCommands(device?.id || '');

  if (!device) return null;

  const isOnline = device.status === 'online';
  const statusColor = deviceService.getDeviceStatusColor(device.status);
  const signalLabel = deviceService.getSignalStrengthLabel(device.wifi_signal);
  const lastSeen = deviceService.formatLastSeen(device.last_seen);

  return (
    <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
      <View style={styles.modalHeader}>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.modalClose}>Back</Text>
        </TouchableOpacity>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.statusBar}>
        <View style={styles.statusLeft}>
          <Text style={styles.deviceNameLarge}>{device.device_name}</Text>
          <Text style={styles.metaText}>Last seen: {lastSeen}</Text>
          <Text style={styles.metaText}>{signalLabel}</Text>
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
      <Modal visible={showCmdHistory} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
          <View style={styles.modalHeader}>
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
            renderItem={({ item }: { item: Command }) => (
              <View style={styles.historyItem}>
                <Text style={styles.historyCommand}>{item.command}</Text>
                <Text style={[styles.historyStatus, { color: statusColor }]}>{item.status}</Text>
                <Text style={styles.historyTime}>{new Date(item.created_at).toLocaleTimeString()}</Text>
              </View>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  title: { ...TYPOGRAPHY.h1, color: COLORS.primary, flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
  profileBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', ...SHADOWS.sm },
  profileIcon: { fontSize: 15, marginLeft: 1, marginBottom: 3 },
  profileOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
  profileModal: {
    position: 'absolute', width: 200, backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg, ...SHADOWS.lg, overflow: 'hidden',
  },
  profileInfo: { padding: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  profileName: { ...TYPOGRAPHY.body, color: COLORS.text, fontWeight: '600' },
  logoutBtn: { padding: SPACING.md, alignItems: 'center' },
  logoutText: { ...TYPOGRAPHY.body, color: COLORS.danger, fontWeight: '600' },
  list: { padding: SPACING.md },
  cardWrapper: { marginBottom: SPACING.md, height: 110 },
  deleteBehind: {
    position: 'absolute', right: 0, top: 0, bottom: 0,
    width: 80, backgroundColor: COLORS.danger,
    borderRadius: BORDER_RADIUS.lg, justifyContent: 'center', alignItems: 'center',
  },
  deleteBtn: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  deleteBtnText: { ...TYPOGRAPHY.caption, color: COLORS.surface, fontWeight: '700' },
  card: {
    backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md, height: 110, marginRight: 5, ...SHADOWS.sm,
  },
  cardContent: { flex: 1, justifyContent: 'center' },
  cardTouchable: { flex: 1 },
  deleteOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  deleteModal: {
    backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg, width: '80%', ...SHADOWS.lg,
  },
  deleteTitle: { ...TYPOGRAPHY.h2, color: COLORS.text, marginBottom: SPACING.sm },
  deleteText: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, marginBottom: SPACING.lg },
  deleteButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: SPACING.md },
  deleteCancelBtn: { padding: SPACING.sm },
  deleteCancelText: { ...TYPOGRAPHY.body, color: COLORS.textSecondary },
  deleteConfirmBtn: { padding: SPACING.sm },
  deleteConfirmText: { ...TYPOGRAPHY.body, color: COLORS.danger, fontWeight: '700' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  deviceName: { ...TYPOGRAPHY.h3, color: COLORS.text, flex: 1 },
  statusDot: { width: 12, height: 12, borderRadius: 6 },
  cardInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xs },
  statusText: { ...TYPOGRAPHY.body, fontWeight: '600', marginTop: -2 },
  signalText: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, },
  lastSeenText: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary },
  emptyContainer: { alignItems: 'center', marginTop: SPACING.xxl * 2 },
  emptyText: { ...TYPOGRAPHY.h3, color: COLORS.textSecondary, marginBottom: SPACING.sm },
  emptyHint: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary },
  addButton: {
    position: 'absolute', right: SPACING.lg, width: 56, height: 56,
    borderRadius: 28, backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center', ...SHADOWS.lg,
  },
  addIcon: { fontSize: 32, color: COLORS.surface, fontWeight: '300', marginTop: -2 },
  // Modal styles
  modalContainer: { flex: 1,},
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: SPACING.md, 
  },
  modalTitle: { ...TYPOGRAPHY.h3, color: COLORS.text, flex: 1, textAlign: 'center' },
  modalClose: { ...TYPOGRAPHY.body, color: COLORS.primary, minWidth: 50 },
  statusBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: SPACING.md, backgroundColor: COLORS.surface,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  statusLeft: { flex: 1 },
  deviceNameLarge: { ...TYPOGRAPHY.h2, color: COLORS.text, marginBottom: SPACING.xs },
  metaText: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginBottom: 2 },
  statusBadge: { paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs, borderRadius: BORDER_RADIUS.full, marginLeft: SPACING.md, marginTop: SPACING.xs },
  statusTextBadge: { color: COLORS.surface, ...TYPOGRAPHY.caption, fontWeight: '700' },
  buttonsContainer: { flex: 1, justifyContent: 'center', paddingHorizontal: SPACING.lg, gap: SPACING.md },
  squareButton: { height: 120, borderRadius: BORDER_RADIUS.lg, justifyContent: 'center', alignItems: 'center', ...SHADOWS.md },
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
  historyList: { padding: SPACING.md },
  historyItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md, marginBottom: SPACING.sm,
  },
  historyCommand: { ...TYPOGRAPHY.body, color: COLORS.text, fontWeight: '800', flex: 1, textTransform: 'uppercase' },
  historyStatus: { ...TYPOGRAPHY.caption, fontWeight: '500', marginRight: 5, textTransform: 'uppercase' },
  historyTime: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary },
});