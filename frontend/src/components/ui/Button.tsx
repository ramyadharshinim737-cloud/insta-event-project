import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

type Props = {
  label: string;
  onPress: () => void;
  accessibilityLabel?: string;
  style?: ViewStyle;
  icon?: ReactNode;
};

const Button = ({ label, onPress, accessibilityLabel, style, icon }: Props) => {
  const { colors, spacing, typography } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: colors.primary,
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.lg,
          opacity: pressed ? 0.8 : 1,
        },
        style,
      ]}
    >
      <>
        {icon}
        <Text
          style={[
            styles.text,
            {
              color: colors.background,
              fontSize: typography.size.md,
              fontWeight: typography.weight.bold as any,
            },
          ]}
          allowFontScaling
        >
          {label}
        </Text>
      </>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    flexDirection: 'row',
    gap: 8,
  },
  text: {
    textAlign: 'center',
  },
});

export default Button;

