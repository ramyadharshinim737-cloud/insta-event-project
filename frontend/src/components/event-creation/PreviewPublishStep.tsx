import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { EventFormData } from '../../utils/eventFormTypes';

interface Props {
  value: EventFormData;
  onPrevious?: () => void;
  onPublish?: () => void;
  isPublishing?: boolean;
  currentStep?: number;
  totalSteps?: number;
}

const PreviewPublishStep: React.FC<Props> = ({ value, onPrevious, onPublish, isPublishing = false, currentStep = 0, totalSteps = 5 }) => {
  const { colors } = useTheme();
  const isFirstStep = currentStep === 0;

  return (
    <View>
      <Text style={[styles.title, { color: colors.text }]}>Preview</Text>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {value.coverImageUri ? (
          <Image source={{ uri: value.coverImageUri }} style={styles.cover} />
        ) : (
          <View style={[styles.cover, { backgroundColor: colors.border }]} />
        )}
        <View style={{ padding: 12 }}>
          <Text style={[styles.eventTitle, { color: colors.text }]}>{value.title || 'Untitled event'}</Text>
          <Text style={{ color: colors.text }} numberOfLines={2}>
            {value.description || 'No description'}
          </Text>
          <Text style={{ color: colors.text, marginTop: 6 }}>
            {value.startDate || 'Start date'} {value.startTime || ''} → {value.endDate || 'End date'} {value.endTime || ''}
          </Text>
          <Text style={{ color: colors.text, marginTop: 4 }}>
            {value.isOnline ? 'Online' : 'Offline'} {value.isOnline ? value.meetingLink || '' : value.venueAddress || ''}
          </Text>
          <Text style={{ color: colors.text, marginTop: 4 }}>
            {value.ticketType} {value.capacity ? `• Capacity: ${value.capacity}` : ''}
          </Text>
        </View>
      </View>

      {/* Navigation Buttons - Previous and Publish on last step */}
      {(onPrevious || onPublish) && (
        <View style={styles.navigationContainer}>
          {onPrevious && (
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
              disabled={isFirstStep || isPublishing}
            >
              <Text style={{ color: isFirstStep ? colors.textSecondary : colors.text, fontWeight: '600' }}>Previous</Text>
            </TouchableOpacity>
          )}
          
          {onPublish && (
            <TouchableOpacity
              style={[
                styles.publishButton,
                { 
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                  opacity: isPublishing ? 0.7 : 1
                }
              ]}
              onPress={onPublish}
              disabled={isPublishing}
            >
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
                {isPublishing ? 'Publishing...' : 'Publish Event'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  title: { fontWeight: '700', fontSize: 18, marginBottom: 8 },
  card: { borderWidth: 1, borderRadius: 12, overflow: 'hidden' },
  cover: { width: '100%', height: 160 },
  eventTitle: { fontWeight: '700', fontSize: 16, marginBottom: 4 },
  navigationContainer: {
    marginTop: 20,
    gap: 12,
  },
  navButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  publishButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
});

export default PreviewPublishStep;
