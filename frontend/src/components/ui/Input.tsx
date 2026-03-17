import { forwardRef } from 'react';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

type Props = TextInputProps & {
  error?: string;
};

const Input = forwardRef<TextInput, Props>(({ error, style, ...rest }, ref) => {
  const { colors, spacing, typography } = useTheme();

  return (
    <TextInput
      ref={ref}
      style={[
        styles.base,
        {
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.md,
          borderColor: error ? colors.danger : colors.border,
          backgroundColor: colors.surface,
          color: colors.text,
          fontSize: typography.size.md,
          minHeight: 48,
        },
        style,
      ]}
      placeholderTextColor={colors.muted}
      allowFontScaling
      {...rest}
    />
  );
});

Input.displayName = 'Input';

const styles = StyleSheet.create({
  base: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    width: '100%',
  },
});

export default Input;

