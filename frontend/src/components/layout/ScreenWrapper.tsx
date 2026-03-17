import { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';

type Props = {
  children: ReactNode;
  scrollable?: boolean;
};

const ScreenWrapper = ({ children, scrollable = false }: Props) => {
  const insets = useSafeAreaInsets();
  const { colors, spacing } = useTheme();

  const content = (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + spacing.md,
          paddingBottom: insets.bottom + spacing.md,
          paddingHorizontal: spacing.lg,
          backgroundColor: colors.background,
        },
      ]}
    >
      {children}
    </View>
  );

  if (scrollable) {
    return (
      <ScrollView
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {content}
      </ScrollView>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ScreenWrapper;

