import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
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

const TicketsStep: React.FC<Props> = ({ value, onChange, errors, onNext, onPrevious, currentStep = 0, totalSteps = 5 }) => {
  const { colors } = useTheme();
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  const Toggle = ({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: active ? colors.primary : colors.border,
        backgroundColor: active ? colors.primary : colors.card,
        marginRight: 8,
      }}
    >
      <Text style={{ color: active ? '#fff' : colors.text }}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View>
      <Text style={[styles.label, { color: colors.text }]}>Ticket type</Text>
      <View style={{ flexDirection: 'row', marginBottom: 8 }}>
        <Toggle active={value.ticketType === 'Free'} label="Free" onPress={() => onChange({ ticketType: 'Free' })} />
        <Toggle active={value.ticketType === 'Paid'} label="Paid" onPress={() => onChange({ ticketType: 'Paid' })} />
      </View>

      <Text style={[styles.label, { color: colors.text }]}>Capacity</Text>
      <TextInput
        placeholder="e.g. 100"
        placeholderTextColor={colors.border}
        value={value.capacity?.toString() ?? ''}
        onChangeText={(t) => onChange({ capacity: Number(t.replace(/[^0-9]/g, '')) || undefined })}
        keyboardType="numeric"
        style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: errors?.capacity ? colors.primary : colors.border }]}
      />

      <Text style={[styles.label, { color: colors.text }]}>Registration deadline</Text>
      <TextInput
        placeholder="YYYY-MM-DD"
        placeholderTextColor={colors.border}
        value={value.registrationDeadline ?? ''}
        onChangeText={(t) => onChange({ registrationDeadline: t })}
        style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: errors?.registrationDeadline ? colors.primary : colors.border }]}
      />

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

export default TicketsStep;
