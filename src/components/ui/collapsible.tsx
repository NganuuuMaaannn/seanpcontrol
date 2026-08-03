import { PropsWithChildren, useState } from 'react';
import { Pressable, StyleSheet, View, Text } from 'react-native';

import { COLORS, SPACING } from '@/constants/theme';

export function Collapsible({ children, title }: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View>
      <Pressable
        style={({ pressed }) => [styles.heading, pressed && styles.pressedHeading]}
        onPress={() => setIsOpen((value) => !value)}>
        <View style={styles.button}>
          <Text style={styles.chevron}>{isOpen ? '>' : '>'}</Text>
        </View>

        <Text style={styles.title}>{title}</Text>
      </Pressable>
      {isOpen && (
        <View style={styles.content}>
          {children}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  pressedHeading: {
    opacity: 0.7,
  },
  button: {
    width: SPACING.lg,
    height: SPACING.lg,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  chevron: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 14,
    color: COLORS.text,
  },
  content: {
    marginTop: SPACING.md,
    borderRadius: SPACING.md,
    marginLeft: SPACING.lg,
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
  },
});