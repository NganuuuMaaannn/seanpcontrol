import { authApi } from '@/api/auth';
import { API_CONFIG } from '@/constants/api';
import { BORDER_RADIUS, COLORS, SHADOWS, SPACING, TYPOGRAPHY } from '@/constants/theme';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface WifiNetwork {
  ssid: string;
  rssi: number;
  secure: boolean;
}

const ESP32_AP_IP = 'http://192.168.4.1';

type SetupStep = 'detecting' | 'connect' | 'select_wifi' | 'enter_password' | 'configuring' | 'done';

export default function SetupScreen({ onComplete, onCancel }: { onComplete: () => void; onCancel: () => void }) {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<SetupStep>('detecting');
  const [networks, setNetworks] = useState<WifiNetwork[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<WifiNetwork | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const detectESP32 = useCallback(async () => {
    try {
      const res = await fetch(`${ESP32_AP_IP}/status`);
      if (res.ok) {
        setStep('select_wifi');
        scanNetworks();
      }
    } catch {
      setStep('connect');
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (step === 'detecting' || step === 'connect') {
        detectESP32();
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [step, detectESP32]);

  const scanNetworks = async () => {
    try {
      const res = await fetch(`${ESP32_AP_IP}/scan`);
      const data = await res.json();
      setNetworks(data);
    } catch {
      setError('Failed to scan networks');
    }
  };

  const handleSelectWifi = (network: WifiNetwork) => {
    setSelectedNetwork(network);
    setPassword('');
    setShowPassword(false);
    setStep('enter_password');
  };

  const handleConnect = async () => {
    if (!password) {
      setError('Please enter password');
      return;
    }

    setStep('configuring');
    setError('');

    try {
      const userId = await authApi.getUserId();
      if (!userId) {
        setError('Not logged in');
        setStep('enter_password');
        return;
      }

      const deviceUuid = generateUuid();
      const userName = await authApi.getUsername();

      const payload = {
        ssid: selectedNetwork?.ssid,
        pass: password,
        uuid: deviceUuid,
        userid: userId,
        supabaseurl: API_CONFIG.SUPABASE_URL,
        supabasekey: API_CONFIG.SUPABASE_ANON_KEY,
        devicename: userName || 'SeanPControl Device',
      };

      const res = await fetch(`${ESP32_AP_IP}/setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setStep('done');
        setTimeout(onComplete, 3000);
      } else {
        setError('Failed to configure device');
        setStep('enter_password');
      }
    } catch (err: any) {
      setError('Setup failed: ' + err.message);
      setStep('enter_password');
    }
  };

  const getSignalIcon = (rssi: number) => {
    if (rssi > -50) return '▂▄▆█';
    if (rssi > -60) return '▂▄▆░';
    if (rssi > -70) return '▂▄░░';
    return '▂░░░';
  };

  // ---- SCREENS ----

  if (step === 'detecting') {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.content}>
          <Text style={styles.title}>SeanPControl</Text>
          <ActivityIndicator size="large" color={COLORS.primary} style={styles.spinner} />
          <Text style={styles.text}>Looking for device...</Text>
          <TouchableOpacity style={styles.button} onPress={onCancel}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (step === 'connect') {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.content}>
          <Text style={styles.title}>Setup Device</Text>
          <Text style={styles.text}>Connect your phone to the WiFi network:</Text>
          <View style={styles.hotspotBox}>
            <Text style={styles.hotspotName}>SeanPControl-Setup</Text>
            <Text style={styles.hotspotPass}>Password: 12345678</Text>
          </View>
          <Text style={styles.hint}>Go to WiFi settings, connect, then come back.</Text>
          <TouchableOpacity style={styles.button} onPress={detectESP32}>
            <Text style={styles.buttonText}>I'm Connected</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (step === 'select_wifi') {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onCancel}>
            <Text style={styles.backText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select WiFi</Text>
          <View style={{ width: 60 }} />
        </View>
        <FlatList
          data={networks}
          keyExtractor={(item) => item.ssid}
          contentContainerStyle={styles.networkList}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.networkItem} onPress={() => handleSelectWifi(item)}>
              <Text style={styles.networkName}>{item.ssid}</Text>
              <Text style={styles.networkSignal}>
                {getSignalIcon(item.rssi)} {item.rssi}dBm {item.secure ? '🔒' : ''}
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No networks found</Text>}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    );
  }

  if (step === 'enter_password') {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => { setStep('select_wifi'); setError(''); }}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{selectedNetwork?.ssid}</Text>
          <View style={{ width: 60 }} />
        </View>

        <View style={styles.passwordContent}>
          <Text style={styles.label}>WiFi Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoFocus
            />
            <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword(!showPassword)}>
              <Text style={styles.eyeText}>{showPassword ? 'hide' : 'show'}</Text>
            </TouchableOpacity>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.button, !password && styles.buttonDisabled]}
            onPress={handleConnect}
            disabled={!password}
          >
            <Text style={styles.buttonText}>Connect</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (step === 'configuring') {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.content}>
          <Text style={styles.title}>Setting up...</Text>
          <ActivityIndicator size="large" color={COLORS.primary} style={styles.spinner} />
          <Text style={styles.text}>Connecting device to WiFi...</Text>
          <Text style={styles.hint}>The device will register itself automatically.</Text>
        </View>
      </View>
    );
  }

  if (step === 'done') {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.content}>
          <Text style={styles.title}>All Done!</Text>
          <Text style={styles.checkmark}>✓</Text>
          <Text style={styles.text}>Device is now connected.</Text>
          <Text style={styles.hint}>It will appear in your device list shortly.</Text>
        </View>
      </View>
    );
  }

  return null;
}

function generateUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, padding: SPACING.lg, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: SPACING.md, backgroundColor: COLORS.surface,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerTitle: { ...TYPOGRAPHY.h3, color: COLORS.text, flex: 1, textAlign: 'center' },
  backButton: { minWidth: 60 },
  backText: { ...TYPOGRAPHY.body, color: COLORS.primary },
  title: { ...TYPOGRAPHY.h1, color: COLORS.primary, marginBottom: SPACING.lg },
  text: { ...TYPOGRAPHY.body, color: COLORS.text, textAlign: 'center', marginBottom: 50},
  hint: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, textAlign: 'center', marginBottom: SPACING.lg },
  spinner: { marginVertical: SPACING.xl },
  checkmark: { fontSize: 64, color: COLORS.success, marginVertical: SPACING.xl },
  hotspotBox: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg, alignItems: 'center', marginBottom: SPACING.md, ...SHADOWS.sm },
  hotspotName: { ...TYPOGRAPHY.h2, color: COLORS.text, marginBottom: SPACING.xs },
  hotspotPass: { ...TYPOGRAPHY.body, color: COLORS.textSecondary },
  networkList: { padding: SPACING.md },
  networkItem: {
    backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md, marginBottom: SPACING.sm,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', ...SHADOWS.sm,
  },
  networkName: { ...TYPOGRAPHY.body, color: COLORS.text, fontWeight: '600' },
  networkSignal: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary },
  passwordContent: { flex: 1, padding: SPACING.lg, justifyContent: 'center' },
  label: { ...TYPOGRAPHY.body, color: COLORS.text, fontWeight: '600', marginBottom: SPACING.sm },
  passwordContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border,
  },
  passwordInput: { flex: 1, padding: SPACING.md, fontSize: 16 },
  eyeButton: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, backgroundColor: COLORS.border, borderRadius: BORDER_RADIUS.sm, marginRight: SPACING.sm },
  eyeText: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '600' },
  button: { backgroundColor: COLORS.primary, padding: SPACING.md, borderRadius: BORDER_RADIUS.md, alignItems: 'center' },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { ...TYPOGRAPHY.body, color: COLORS.surface, fontWeight: '600' },
  cancelButton: { marginTop: SPACING.md, padding: SPACING.md, alignItems: 'center' },
  cancelText: { ...TYPOGRAPHY.body, color: COLORS.textSecondary },
  error: { ...TYPOGRAPHY.body, color: COLORS.danger, textAlign: 'center', marginBottom: SPACING.md },
  emptyText: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, textAlign: 'center', marginTop: SPACING.xxl },
});