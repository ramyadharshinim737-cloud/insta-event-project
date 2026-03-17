import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import StepIndicator, { Step } from '../../components/event-creation/StepIndicator';
import BasicInfoStep from '../../components/event-creation/BasicInfoStep';
import DateTimeStep from '../../components/event-creation/DateTimeStep';
import LocationStep from '../../components/event-creation/LocationStep';
import TicketsStep from '../../components/event-creation/TicketsStep';
import PreviewPublishStep from '../../components/event-creation/PreviewPublishStep';
import { EventFormData } from '../../utils/eventFormTypes';

const steps: Step[] = [
  { key: 'basic', label: 'Basic' },
  { key: 'datetime', label: 'Date & Time' },
  { key: 'location', label: 'Location' },
  { key: 'tickets', label: 'Tickets' },
  { key: 'preview', label: 'Preview' },
];

const mockExisting: EventFormData = {
  id: 'evt_123',
  title: 'Tech Networking Night',
  description: 'Meet engineers, founders, and talent in your city.',
  category: 'Networking',
  coverImageUri: 'https://picsum.photos/640/360',
  startDate: '2026-01-20',
  endDate: '2026-01-20',
  startTime: '18:00',
  endTime: '21:00',
  timezone: 'IST',
  isOnline: false,
  venueAddress: 'Indiranagar, Bengaluru',
  ticketType: 'Free',
  capacity: 150,
  registrationDeadline: '2026-01-18',
  status: 'published',
};

const EditEventWizard: React.FC = () => {
  const { colors } = useTheme();
  const [index, setIndex] = useState(0);
  const [data, setData] = useState<EventFormData>(mockExisting);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof EventFormData, string>>>({});

  const currentStepKey = steps[index].key;

  const onChange = (patch: Partial<EventFormData>) => setData((d) => ({ ...d, ...patch }));

  const validate = (): boolean => {
    const e: Partial<Record<keyof EventFormData, string>> = {};
    if (currentStepKey === 'basic') {
      if (!data.title?.trim()) e.title = 'Title is required';
      if (!data.description?.trim()) e.description = 'Description is required';
    }
    if (currentStepKey === 'datetime') {
      if (!data.startDate) e.startDate = 'Start date required';
      if (!data.endDate) e.endDate = 'End date required';
      if (!data.startTime) e.startTime = 'Start time required';
      if (!data.endTime) e.endTime = 'End time required';
    }
    if (currentStepKey === 'location') {
      if (data.isOnline) {
        if (!data.meetingLink?.trim()) e.meetingLink = 'Meeting link required';
      } else {
        if (!data.venueAddress?.trim()) e.venueAddress = 'Venue address required';
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const canNext = useMemo(() => {
    if (currentStepKey === 'basic') return !!data.title?.trim() && !!data.description?.trim();
    if (currentStepKey === 'datetime') return !!data.startDate && !!data.endDate && !!data.startTime && !!data.endTime;
    if (currentStepKey === 'location') return data.isOnline ? !!data.meetingLink?.trim() : !!data.venueAddress?.trim();
    if (currentStepKey === 'tickets') return true;
    return true;
  }, [currentStepKey, data]);

  const onNext = () => {
    if (!validate()) return;
    setIndex((i) => Math.min(i + 1, steps.length - 1));
  };

  const onBack = () => setIndex((i) => Math.max(0, i - 1));

  const onUpdate = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    alert('Event updated');
  };

  const renderStep = () => {
    switch (currentStepKey) {
      case 'basic':
        return <BasicInfoStep value={data} onChange={onChange} errors={errors} onNext={onNext} onPrevious={onBack} currentStep={index} totalSteps={steps.length} />;
      case 'datetime':
        return <DateTimeStep value={data} onChange={onChange} errors={errors} />;
      case 'location':
        return <LocationStep value={data} onChange={onChange} errors={errors} />;
      case 'tickets':
        return <TicketsStep value={data} onChange={onChange} errors={errors} />;
      case 'preview':
        return <PreviewPublishStep value={data} />;
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.header, { color: colors.text }]}>Edit event</Text>
        <StepIndicator steps={steps} currentIndex={index} />
        {renderStep()}
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            onPress={onBack}
            disabled={index === 0}
            style={[styles.button, { backgroundColor: colors.card, borderColor: colors.border, opacity: index === 0 ? 0.6 : 1 }]}
          >
            <Text style={{ color: colors.text }}>Back</Text>
          </TouchableOpacity>
          {index < steps.length - 1 ? (
            <TouchableOpacity
              onPress={onNext}
              disabled={!canNext}
              style={[styles.button, { backgroundColor: canNext ? colors.primary : colors.card, borderColor: colors.border }]}
            >
              <Text style={{ color: canNext ? '#fff' : colors.text }}>Next</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                onPress={() => { /* cancel changes - UI only */ }}
                disabled={loading}
                style={[styles.button, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <Text style={{ color: colors.text }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onUpdate}
                disabled={loading}
                style={[styles.button, { backgroundColor: colors.primary, borderColor: colors.border }]}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff' }}>Update</Text>}
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  header: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  footer: { padding: 12, borderTopWidth: 1 },
  button: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1 },
});

export default EditEventWizard;
