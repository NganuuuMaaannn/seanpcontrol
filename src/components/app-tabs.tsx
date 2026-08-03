import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { COLORS, SPACING, TYPOGRAPHY } from '@/constants/theme';

const tabs = [
  { name: 'index', label: 'Home' },
  { name: 'dashboard', label: 'Dashboard' },
  { name: 'settings', label: 'Settings' },
];

export default function AppTabs() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = pathname === `/${tab.name}` || 
          (tab.name === 'index' && pathname === '/');
        
        return (
          <TouchableOpacity
            key={tab.name}
            style={[styles.tab, isActive && styles.activeTab]}
            onPress={() => router.push(`/${tab.name}`)}
          >
            <Text style={[styles.tabText, isActive && styles.activeTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingBottom: SPACING.sm,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  activeTab: {
    borderTopWidth: 2,
    borderTopColor: COLORS.primary,
  },
  tabText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});