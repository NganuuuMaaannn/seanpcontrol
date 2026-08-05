import { authApi } from '@/api/auth';
import { API_CONFIG } from '@/constants/api';
import { BORDER_RADIUS, COLORS, SHADOWS, SPACING, TYPOGRAPHY } from '@/constants/theme';
import React, { useState } from 'react';
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

type SetupStep =
  | 'instruction'
  | 'scanning'
  | 'select_home_wifi'
  | 'home_wifi_password'
  | 'device_name'
  | 'configuring'
  | 'done';

export default function SetupScreen({ onComplete, onCancel }: { onComplete: () => void; onCancel: () => void }) {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<SetupStep>('instruction');
  const [networks, setNetworks] = useState<WifiNetwork[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<WifiNetwork | null>(null);
  const [homePassword, setHomePassword] = useState('');
  const [showHomePass, setShowHomePass] = useState(false);
  const [deviceName, setDeviceName] = useState('');
  const [error, setError] = useState('');

  const handleConnected = async () => {
    setStep('scanning');
    setError('');
    try {
      const res = await fetch(`${ESP32_AP_IP}/scan`);
      const data = await res.json();
      setNetworks(data);
      setStep('select_home_wifi');
    } catch {
      setError('Failed to scan networks. Make sure you are connected to the hotspot.');
      setStep('instruction');
    }
  };

  const handleSelectHomeWifi = (network: WifiNetwork) => {
    setSelectedNetwork(network);
    setHomePassword('');
    setShowHomePass(false);
    setStep('home_wifi_password');
  };

  const handleHomePasswordNext = () => {
    if (!homePassword) {
      setError('Please enter password');
      return;
    }
    setError('');
    setDeviceName('');
    setStep('device_name');
  };

  const handleConfigure = async () => {
    if (!deviceName.trim()) {
      setError('Please enter a device name');
      return;
    }
    setError('');
    setStep('configuring');

    try {
      const userId = await authApi.getUserId();
      if (!userId) {
        setError('Not logged in');
        setStep('device_name');
        return;
      }

      const deviceUuid = generateUuid();

      const payload = {
        ssid: selectedNetwork?.ssid,
        pass: homePassword,
        uuid: deviceUuid,
        userid: userId,
        supabaseurl: API_CONFIG.SUPABASE_URL,
        supabasekey: API_CONFIG.SUPABASE_ANON_KEY,
        devicename: deviceName.trim(),
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
        setStep('device_name');
      }
    } catch (err: any) {
      setError('Setup failed: ' + err.message);
      setStep('device_name');
    }
  };

  const getSignalIcon = (rssi: number) => {
    if (rssi > -50) return '▂▄▆█';
    if (rssi > -60) return '▂▄▆░';
    if (rssi > -70) return '▂▄░░';
    return '▂░░░';
  };

  // ---- SCREENS ----

  if (step === 'instruction') {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.content}>
          <Text style={styles.title}>Setup Device</Text>
          <Text style={styles.text}>Connect your phone to the WiFi network:</Text>
          <View style={styles.hotspotBox}>
            <Text style={styles.hotspotName}>SeanPControl-Setup</Text>
            <Text style={styles.hotspotPass}>Password: 12345678</Text>
          </View>
          <Text style={styles.hint}>Go to WiFi settings, connect, then come back and tap the button below.</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TouchableOpacity style={styles.button} onPress={handleConnected}>
            <Text style={styles.buttonText}>I'm Connected</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (step === 'scanning') {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.content}>
          <Text style={styles.title}>Scanning...</Text>
          <ActivityIndicator size="large" color={COLORS.primary} style={styles.spinner} />
          <Text style={styles.text}>Looking for WiFi networks</Text>
        </View>
      </View>
    );
  }

  if (step === 'select_home_wifi') {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => setStep('instruction')}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select WiFi</Text>
          <TouchableOpacity onPress={handleConnected}>
            <Text style={styles.backText}>Refresh</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={networks}
          keyExtractor={(item, index) => `${item.ssid}-${index}`}
          contentContainerStyle={styles.networkList}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.networkItem} onPress={() => handleSelectHomeWifi(item)}>
              <Text style={styles.networkName}>{item.ssid}</Text>
              <Text style={styles.networkSignal}>
                {getSignalIcon(item.rssi)} {item.rssi}dBm {item.secure ? '🔒' : ''}
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No networks found</Text>}
        />
      </View>
    );
  }

  if (step === 'home_wifi_password') {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => { setStep('select_home_wifi'); setError(''); }}>
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
              value={homePassword}
              onChangeText={setHomePassword}
              secureTextEntry={!showHomePass}
              autoFocus
            />
            <TouchableOpacity style={styles.eyeButton} onPress={() => setShowHomePass(!showHomePass)}>
              <Text style={styles.eyeText}>{showHomePass ? 'hide' : 'show'}</Text>
            </TouchableOpacity>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.button, !homePassword && styles.buttonDisabled]}
            onPress={handleHomePasswordNext}
            disabled={!homePassword}
          >
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (step === 'device_name') {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => { setStep('home_wifi_password'); setError(''); }}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Device Name</Text>
          <View style={{ width: 60 }} />
        </View>

        <View style={styles.passwordContent}>
          <Text style={styles.label}>Name your device</Text>
          <TextInput
            style={styles.nameInput}
            placeholder="e.g. Living Room PC"
            value={deviceName}
            onChangeText={setDeviceName}
            autoFocus
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.button, !deviceName.trim() && styles.buttonDisabled]}
            onPress={handleConfigure}
            disabled={!deviceName.trim()}
          >
            <Text style={styles.buttonText}>Configure</Text>
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
  text: { ...TYPOGRAPHY.body, color: COLORS.text, textAlign: 'center', marginBottom: 50 },
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
  nameInput: {
    backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md, fontSize: 16, marginBottom: SPACING.md,
    borderWidth: 1, borderColor: COLORS.border,
  },
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
