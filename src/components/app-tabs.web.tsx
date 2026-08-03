import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, usePathname } from 'expo-router';

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
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingBottom: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeTab: {
    borderTopWidth: 2,
    borderTopColor: '#3B82F6',
  },
  tabText: {
    fontSize: 12,
    color: '#64748B',
  },
  activeTabText: {
    color: '#3B82F6',
    fontWeight: '600',
  },
});