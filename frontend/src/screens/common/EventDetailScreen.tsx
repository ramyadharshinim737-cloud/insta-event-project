import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import ScreenWrapper from '../../components/layout/ScreenWrapper';
import { useTheme } from '../../context/ThemeContext';
import { AppStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AppStackParamList, 'EventDetail'>;

const EventDetailScreen = ({ route }: Props) => {
  const { colors, typography } = useTheme();
  const { eventId } = route.params ?? {};

  return (
    <ScreenWrapper>
      <View style={styles.center}>
        <Text
          style={{ color: colors.text, fontSize: typography.size.lg }}
          allowFontScaling
        >
          Event Detail
        </Text>
        {eventId ? (
          <Text style={{ color: colors.muted }} allowFontScaling>
            Event ID: {eventId}
          </Text>
        ) : null}
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

export default EventDetailScreen;

