import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../../context/ThemeContext';
import { EventFormData } from '../../utils/eventFormTypes';

interface Props {
  value: EventFormData;
  onChange: (patch: Partial<EventFormData>) => void;
  errors?: Partial<Record<keyof EventFormData, string>>;
  onNext?: () => void;
  onPrevious?: () => void;
  currentStep?: number;
  totalSteps?: number;
}

const TIMEZONES = ['UTC', 'GMT', 'PST', 'EST', 'CET', 'IST'];

const DateTimeStep: React.FC<Props> = ({ value, onChange, errors, onNext, onPrevious, currentStep = 0, totalSteps = 5 }) => {
  const { colors } = useTheme();
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;
  const [showStartDate, setShowStartDate] = useState(false);
  const [showStartTime, setShowStartTime] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);
  const [showEndTime, setShowEndTime] = useState(false);

  const parseDate = (s?: string) => (s ? new Date(s) : new Date());
  const formatDate = (d: Date) => d.toISOString().slice(0, 10);
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const formatTime = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

  return (
    <View>
      <Text style={[styles.label, { color: colors.text }]}>Start date</Text>
      <TouchableOpacity onPress={() => setShowStartDate(true)} style={[styles.input, { backgroundColor: colors.card, borderColor: errors?.startDate ? colors.primary : colors.border }]}>
        <Text style={{ color: value.startDate ? colors.text : colors.border }}>{value.startDate ?? 'Pick a date'}</Text>
      </TouchableOpacity>
      <Text style={[styles.label, { color: colors.text }]}>End date</Text>
      <TouchableOpacity onPress={() => setShowEndDate(true)} style={[styles.input, { backgroundColor: colors.card, borderColor: errors?.endDate ? colors.primary : colors.border }]}>
        <Text style={{ color: value.endDate ? colors.text : colors.border }}>{value.endDate ?? 'Pick a date'}</Text>
      </TouchableOpacity>
      <Text style={[styles.label, { color: colors.text }]}>Start time</Text>
      <TouchableOpacity onPress={() => setShowStartTime(true)} style={[styles.input, { backgroundColor: colors.card, borderColor: errors?.startTime ? colors.primary : colors.border }]}>
        <Text style={{ color: value.startTime ? colors.text : colors.border }}>{value.startTime ?? 'Pick a time'}</Text>
      </TouchableOpacity>
      <Text style={[styles.label, { color: colors.text }]}>End time</Text>
      <TouchableOpacity onPress={() => setShowEndTime(true)} style={[styles.input, { backgroundColor: colors.card, borderColor: errors?.endTime ? colors.primary : colors.border }]}>
        <Text style={{ color: value.endTime ? colors.text : colors.border }}>{value.endTime ?? 'Pick a time'}</Text>
      </TouchableOpacity>

      <Text style={[styles.label, { color: colors.text }]}>Timezone</Text>
      <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 8, overflow: 'hidden' }}>
        <TextInput
          placeholder="Type timezone (mock dropdown)"
          placeholderTextColor={colors.border}
          value={value.timezone ?? 'UTC'}
          onChangeText={(t) => onChange({ timezone: t })}
          style={{ padding: 12, backgroundColor: colors.card, color: colors.text }}
        />
      </View>
      <Text style={{ color: colors.border, marginTop: 8, fontSize: 12 }}>Suggested: {TIMEZONES.join(', ')}</Text>

      {showStartDate && (
        <DateTimePicker
          value={parseDate(value.startDate)}
          mode="date"
          onChange={(_, d) => {
            setShowStartDate(false);
            if (d) onChange({ startDate: formatDate(d) });
          }}
        />
      )}
      {showEndDate && (
        <DateTimePicker
          value={parseDate(value.endDate)}
          mode="date"
          onChange={(_, d) => {
            setShowEndDate(false);
            if (d) onChange({ endDate: formatDate(d) });
          }}
        />
      )}
      {showStartTime && (
        <DateTimePicker
          value={parseDate(value.startDate)}
          mode="time"
          is24Hour
          onChange={(_, d) => {
            setShowStartTime(false);
            if (d) onChange({ startTime: formatTime(d) });
          }}
        />
      )}
      {showEndTime && (
        <DateTimePicker
          value={parseDate(value.endDate)}
          mode="time"
          is24Hour
          onChange={(_, d) => {
            setShowEndTime(false);
            if (d) onChange({ endTime: formatTime(d) });
          }}
        />
      )}

      {/* Navigation Buttons */}
      {(onPrevious || onNext) && (
        <View style={styles.navigationContainer}>
          <TouchableOpacity
            style={[
              styles.navButton,
              { 
                backgroundColor: isFirstStep ? colors.border : colors.card, 
                borderColor: colors.border,
                opacity: isFirstStep ? 0.5 : 1
              }
            ]}
            onPress={onPrevious}
            disabled={isFirstStep}
          >
            <Text style={{ color: isFirstStep ? colors.textSecondary : colors.text, fontWeight: '600' }}>Previous</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.navButton,
              { 
                backgroundColor: isLastStep ? colors.border : colors.primary, 
                borderColor: colors.border,
                opacity: isLastStep ? 0.5 : 1
              }
            ]}
            onPress={onNext}
            disabled={isLastStep}
          >
            <Text style={{ color: isLastStep ? colors.textSecondary : '#fff', fontWeight: '600' }}>Next</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  label: { fontWeight: '600', marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12 },
  navigationContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  navButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default DateTimeStep;
