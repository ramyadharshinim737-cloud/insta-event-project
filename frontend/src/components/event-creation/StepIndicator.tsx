import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export type Step = {
  key: string;
  label: string;
};

interface Props {
  steps: Step[];
  currentIndex: number;
}

const StepIndicator: React.FC<Props> = ({ steps, currentIndex }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {steps.map((s, idx) => {
        const active = idx === currentIndex;
        const completed = idx < currentIndex;
        return (
          <View key={s.key} style={styles.stepWrap}>
            <View
              style={[
                styles.circle,
                {
                  backgroundColor: active || completed ? colors.primary : colors.card,
                  borderColor: active ? colors.primary : colors.border,
                },
              ]}
            >
              <Text style={[styles.circleText, { color: active || completed ? '#fff' : colors.text }]}>
                {idx + 1}
              </Text>
            </View>
            <Text style={[styles.label, { color: active ? colors.primary : colors.text }]}>{s.label}</Text>
            {idx !== steps.length - 1 && (
              <View style={[styles.connector, { backgroundColor: completed ? colors.primary : colors.border }]} />
            )}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  stepWrap: {
    flex: 1,
    alignItems: 'center',
  },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  circleText: {
    fontWeight: '600',
    fontSize: 12,
  },
  label: {
    marginTop: 6,
    fontSize: 12,
  },
  connector: {
    position: 'absolute',
    top: 14,
    right: -8,
    height: 2,
    width: '100%',
    zIndex: -1,
  },
});

export default StepIndicator;
