import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { CommandType } from '@/types';
import { commandService } from '@/services/command_service';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '@/constants/theme';

interface CommandButtonProps {
  command: CommandType;
  onPress: () => Promise<void>;
  disabled?: boolean;
  loading?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export function CommandButton({
  command,
  onPress,
  disabled = false,
  loading = false,
  size = 'medium',
}: CommandButtonProps) {
  const label = commandService.getCommandLabel(command);
  const color = commandService.getCommandColor(command);

  const buttonSize = {
    small: { padding: SPACING.sm, minWidth: 80 },
    medium: { padding: SPACING.md, minWidth: 120 },
    large: { padding: SPACING.lg, minWidth: 160 },
  }[size];

  const textStyle = {
    small: TYPOGRAPHY.caption,
    medium: TYPOGRAPHY.body,
    large: TYPOGRAPHY.h3,
  }[size];

  return (
    <TouchableOpacity
      style={[
        styles.container,
        buttonSize,
        { backgroundColor: color },
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.surface} size="small" />
      ) : (
        <Text style={[styles.text, textStyle]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  text: {
    color: COLORS.surface,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.4,
  },
});