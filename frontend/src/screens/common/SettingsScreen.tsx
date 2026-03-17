import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import Button from '../../components/ui/Button';
import ScreenWrapper from '../../components/layout/ScreenWrapper';
import { useTheme } from '../../context/ThemeContext';
import { AppStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AppStackParamList, 'Settings'>;

const SettingsScreen = (_: Props) => {
  const { colors, typography, toggleTheme, isDark } = useTheme();

  return (
    <ScreenWrapper>
      <View style={styles.center}>
        <Text
          style={{ color: colors.text, fontSize: typography.size.lg }}
          allowFontScaling
        >
          Settings
        </Text>
        <Button
          label={isDark ? 'Switch to Light' : 'Switch to Dark'}
          onPress={toggleTheme}
          style={{ marginTop: 16 }}
          accessibilityLabel="Toggle color theme"
        />
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
});

export default SettingsScreen;

