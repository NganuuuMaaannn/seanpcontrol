import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenHeader } from '@/components/ScreenHeader';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/theme';

export default function SettingsScreen() {
  const router = useRouter();

  const handleLogout = () => {
    // TODO: Implement logout functionality
    router.push('/');
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Settings" showBackButton />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Profile</Text>
            <Text style={styles.menuItemArrow}>{'>'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Notifications</Text>
            <Text style={styles.menuItemArrow}>{'>'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Devices</Text>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Manage Devices</Text>
            <Text style={styles.menuItemArrow}>{'>'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Add New Device</Text>
            <Text style={styles.menuItemArrow}>{'>'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App</Text>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Appearance</Text>
            <Text style={styles.menuItemArrow}>{'>'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>About</Text>
            <Text style={styles.menuItemArrow}>{'>'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Help & Support</Text>
            <Text style={styles.menuItemArrow}>{'>'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.menuItem, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Text style={[styles.menuItemText, styles.logoutText]}>Logout</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>
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
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
    marginLeft: SPACING.sm,
  },
  menuItem: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuItemText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
  },
  menuItemArrow: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  logoutButton: {
    backgroundColor: COLORS.danger,
  },
  logoutText: {
    color: COLORS.surface,
    fontWeight: '600',
    textAlign: 'center',
  },
  version: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xl,
  },
});