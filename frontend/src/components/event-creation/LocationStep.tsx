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

const LocationStep: React.FC<Props> = ({ value, onChange, errors, onNext, onPrevious, currentStep = 0, totalSteps = 5 }) => {
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
      <Text style={[styles.label, { color: colors.text }]}>Location type</Text>
      <View style={{ flexDirection: 'row', marginBottom: 8 }}>
        <Toggle active={value.isOnline} label="Online" onPress={() => onChange({ isOnline: true })} />
        <Toggle active={!value.isOnline} label="Offline" onPress={() => onChange({ isOnline: false })} />
      </View>

      {value.isOnline ? (
        <View>
          <Text style={[styles.label, { color: colors.text }]}>Meeting link</Text>
          <TextInput
            placeholder="https://..."
            placeholderTextColor={colors.border}
            value={value.meetingLink ?? ''}
            onChangeText={(t) => onChange({ meetingLink: t })}
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: errors?.meetingLink ? colors.primary : colors.border }]}
          />
        </View>
      ) : (
        <View>
          <Text style={[styles.label, { color: colors.text }]}>Venue address</Text>
          <TextInput
            placeholder="123 Street, City"
            placeholderTextColor={colors.border}
            value={value.venueAddress ?? ''}
            onChangeText={(t) => onChange({ venueAddress: t })}
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: errors?.venueAddress ? colors.primary : colors.border }]}
          />
        </View>
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

export default LocationStep;
