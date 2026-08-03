import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Command } from '@/types';
import { commandService } from '@/services/command_service';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/theme';

interface CommandHistoryProps {
  commands: Command[];
  limit?: number;
}

export function CommandHistory({ commands, limit = 10 }: CommandHistoryProps) {
  const displayCommands = commands.slice(0, limit);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const renderItem = ({ item }: { item: Command }) => (
    <View style={styles.item}>
      <View style={styles.header}>
        <Text style={styles.command}>
          {commandService.getCommandLabel(item.command)}
        </Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: commandService.getStatusColor(item.status) },
          ]}
        >
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.details}>
        <Text style={styles.timestamp}>{formatDate(item.created_at)}</Text>
        {item.executed_at && (
          <Text style={styles.executed}>Executed: {formatDate(item.executed_at)}</Text>
        )}
      </View>
    </View>
  );

  if (displayCommands.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No command history</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Command History</Text>
      <FlatList
        data={displayCommands}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: SPACING.md,
  },
  title: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  item: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  command: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.text,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  statusText: {
    color: COLORS.surface,
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
  },
  details: {
    marginTop: SPACING.xs,
  },
  timestamp: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  executed: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  emptyContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
});