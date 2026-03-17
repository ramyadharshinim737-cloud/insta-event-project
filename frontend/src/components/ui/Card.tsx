import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

type Props = {
  children: ReactNode;
  style?: ViewStyle;
};

const Card = ({ children, style }: Props) => {
  const { colors, spacing } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          padding: spacing.lg,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    width: '100%',
  },
});

export default Card;

