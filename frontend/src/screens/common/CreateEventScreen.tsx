import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import ScreenWrapper from '../../components/layout/ScreenWrapper';
import { useTheme } from '../../context/ThemeContext';
import { AppStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AppStackParamList, 'CreateEvent'>;

const CreateEventScreen = (_: Props) => {
  const { colors, typography } = useTheme();

  return (
    <ScreenWrapper>
      <View style={styles.center}>
        <Text
          style={{ color: colors.text, fontSize: typography.size.lg }}
          allowFontScaling
        >
          Create Event
        </Text>
        <Text style={{ color: colors.muted }} allowFontScaling>
          Placeholder for event creation flow.
        </Text>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CreateEventScreen;

