import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, TYPOGRAPHY } from '@/constants/theme';

interface ScreenHeaderProps {
  title: string;
  showBackButton?: boolean;
  rightComponent?: React.ReactNode;
}

export function ScreenHeader({
  title,
  showBackButton = false,
  rightComponent,
}: ScreenHeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {showBackButton ? (
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.spacer} />
      )}

      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      {rightComponent || <View style={styles.spacer} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    minWidth: 60,
  },
  backText: {
    ...TYPOGRAPHY.body,
    color: COLORS.primary,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    flex: 1,
    textAlign: 'center',
  },
  spacer: {
    minWidth: 60,
  },
});