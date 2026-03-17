import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import BottomNavigation from '../../components/BottomNavigation';
import CreateEventWizard from '../../pages/organizer/CreateEventWizard';
import { EventCategory, LocationType } from '../../utils/eventTypes';
import { createEvent } from '../../services/events.api';

interface CreateEventScreenProps {
  navigation?: any;
}

interface EventFormData {
  title: string;
  category: EventCategory | '';
  description: string;
  startDate: Date;
  endDate: Date;
  locationType: LocationType | '';
  location: string;
  bannerColor: string;
  bannerIcon: string;
}

const CreateEventScreen: React.FC<CreateEventScreenProps> = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [publishing, setPublishing] = useState(false);
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    category: '',
    description: '',
    startDate: new Date(),
    endDate: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours later
    locationType: '',
    location: '',
    bannerColor: '#667eea',
    bannerIcon: 'calendar-outline',
  });

  // Date/Time picker states
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const categories: EventCategory[] = ['Academic', 'Cultural', 'Sports', 'Networking', 'Workshops'];
  const bannerColors = ['#667eea', '#f093fb', '#fa709a', '#4facfe', '#43e97b', '#764ba2', '#ff6b6b', '#f857a6'];
  const bannerIcons = ['calendar-outline', 'people-outline', 'trophy-outline', 'bulb-outline', 'rocket-outline', 'star-outline', 'heart-outline', 'musical-notes-outline'];

  const updateFormData = (field: keyof EventFormData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const validateStep1 = () => {
    if (!formData.title.trim()) {
      Alert.alert('Required', 'Event title is required');
      return false;
    }
    if (!formData.category) {
      Alert.alert('Required', 'Please select a category');
      return false;
    }
    if (formData.description.length < 20) {
      Alert.alert('Required', 'Description must be at least 20 characters');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.startDate) {
      Alert.alert('Required', 'Start date and time are required');
      return false;
    }
    if (!formData.endDate) {
      Alert.alert('Required', 'End date and time are required');
      return false;
    }
    if (formData.endDate <= formData.startDate) {
      Alert.alert('Invalid', 'End time must be after start time');
      return false;
    }
    if (!formData.locationType) {
      Alert.alert('Required', 'Please select event type (Online or In-Person)');
      return false;
    }
    if (formData.locationType === 'In-Person' && !formData.location.trim()) {
      Alert.alert('Required', 'Venue is required for in-person events');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation?.navigate('Home');
    }
  };

  const handlePublish = async () => {
    try {
      setPublishing(true);
      console.log('📅 Publishing event...');
      
      // Create event via backend API
      const event = await createEvent({
        title: formData.title,
        description: formData.description,
        category: formData.category as string,
        date: formData.startDate.toISOString(),
        time: formatTime(formData.startDate),
        venue: formData.location,
        isOnline: formData.locationType === 'Online',
        meetingLink: formData.locationType === 'Online' ? formData.location : undefined,
      });
      
      console.log('✅ Event created:', event._id);
      
      Alert.alert(
        'Event Created!',
        'Your event has been published successfully.',
        [
          {
            text: 'OK',
            onPress: () => navigation?.navigate('Events'),
          },
        ]
      );
    } catch (error: any) {
      console.error('❌ Error creating event:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to create event. Please try again.'
      );
    } finally {
      setPublishing(false);
    }
  };

  const handleSaveDraft = () => {
    Alert.alert('Draft Saved', 'Your event has been saved as a draft.');
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format time for display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Date/Time picker handlers
  const onStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setFormData({ ...formData, startDate: selectedDate });
    }
  };

  const onStartTimeChange = (event: any, selectedDate?: Date) => {
    setShowStartTimePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setFormData({ ...formData, startDate: selectedDate });
    }
  };

  const onEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setFormData({ ...formData, endDate: selectedDate });
    }
  };

  const onEndTimeChange = (event: any, selectedDate?: Date) => {
    setShowEndTimePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setFormData({ ...formData, endDate: selectedDate });
    }
  };

  const renderStep1 = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>Basic Information</Text>
      <Text style={styles.stepDescription}>Define your event's identity</Text>

      {/* Event Title */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          Event Title <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Enter event title"
          value={formData.title}
          onChangeText={(text) => updateFormData('title', text)}
          placeholderTextColor="#8e8e8e"
        />
      </View>

      {/* Category */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          Category <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.categoryGrid}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                formData.category === cat && styles.categoryChipActive,
              ]}
              onPress={() => updateFormData('category', cat)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  formData.category === cat && styles.categoryChipTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Description */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          Description <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe your event (minimum 20 characters)"
          value={formData.description}
          onChangeText={(text) => updateFormData('description', text)}
          multiline
          numberOfLines={4}
          placeholderTextColor="#8e8e8e"
        />
        <Text style={styles.charCount}>{formData.description.length} / 20 min</Text>
      </View>
    </ScrollView>
  );

  const renderStep2 = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>Schedule & Location</Text>
      <Text style={styles.stepDescription}>When and where will it happen?</Text>

      {/* Start Date & Time */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          Start Date & Time <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.dateTimeRow}>
          <TouchableOpacity
            style={[styles.input, styles.dateInput, styles.pickerButton]}
            onPress={() => setShowStartDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={18} color="#8e8e8e" />
            <Text style={styles.pickerButtonText}>{formatDate(formData.startDate)}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.input, styles.timeInput, styles.pickerButton]}
            onPress={() => setShowStartTimePicker(true)}
          >
            <Ionicons name="time-outline" size={18} color="#8e8e8e" />
            <Text style={styles.pickerButtonText}>{formatTime(formData.startDate)}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Start Date Picker */}
      {showStartDatePicker && (
        <DateTimePicker
          value={formData.startDate}
          mode="date"
          display="default"
          onChange={onStartDateChange}
          minimumDate={new Date()}
        />
      )}

      {/* Start Time Picker */}
      {showStartTimePicker && (
        <DateTimePicker
          value={formData.startDate}
          mode="time"
          display="default"
          onChange={onStartTimeChange}
        />
      )}

      {/* End Date & Time */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          End Date & Time <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.dateTimeRow}>
          <TouchableOpacity
            style={[styles.input, styles.dateInput, styles.pickerButton]}
            onPress={() => setShowEndDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={18} color="#8e8e8e" />
            <Text style={styles.pickerButtonText}>{formatDate(formData.endDate)}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.input, styles.timeInput, styles.pickerButton]}
            onPress={() => setShowEndTimePicker(true)}
          >
            <Ionicons name="time-outline" size={18} color="#8e8e8e" />
            <Text style={styles.pickerButtonText}>{formatTime(formData.endDate)}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* End Date Picker */}
      {showEndDatePicker && (
        <DateTimePicker
          value={formData.endDate}
          mode="date"
          display="default"
          onChange={onEndDateChange}
          minimumDate={formData.startDate}
        />
      )}

      {/* End Time Picker */}
      {showEndTimePicker && (
        <DateTimePicker
          value={formData.endDate}
          mode="time"
          display="default"
          onChange={onEndTimeChange}
        />
      )}

      {/* Event Type */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          Event Type <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.typeRow}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              formData.locationType === 'Online' && styles.typeButtonActive,
            ]}
            onPress={() => {
              updateFormData('locationType', 'Online');
              updateFormData('location', 'Online');
            }}
          >
            <Ionicons
              name="videocam-outline"
              size={24}
              color={formData.locationType === 'Online' ? '#fff' : '#0a66c2'}
            />
            <Text
              style={[
                styles.typeButtonText,
                formData.locationType === 'Online' && styles.typeButtonTextActive,
              ]}
            >
              Online
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.typeButton,
              formData.locationType === 'In-Person' && styles.typeButtonActive,
            ]}
            onPress={() => updateFormData('locationType', 'In-Person')}
          >
            <Ionicons
              name="location-outline"
              size={24}
              color={formData.locationType === 'In-Person' ? '#fff' : '#0a66c2'}
            />
            <Text
              style={[
                styles.typeButtonText,
                formData.locationType === 'In-Person' && styles.typeButtonTextActive,
              ]}
            >
              In-Person
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Venue (if In-Person) */}
      {formData.locationType === 'In-Person' && (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Venue <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter venue address"
            value={formData.location}
            onChangeText={(text) => updateFormData('location', text)}
            placeholderTextColor="#8e8e8e"
          />
        </View>
      )}
    </ScrollView>
  );

  const renderStep3 = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>Media & Publish</Text>
      <Text style={styles.stepDescription}>Customize and preview your event</Text>

      {/* Banner Color */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Banner Color</Text>
        <View style={styles.colorGrid}>
          {bannerColors.map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorOption,
                { backgroundColor: color },
                formData.bannerColor === color && styles.colorOptionActive,
              ]}
              onPress={() => updateFormData('bannerColor', color)}
            >
              {formData.bannerColor === color && (
                <Ionicons name="checkmark" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Banner Icon */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Banner Icon</Text>
        <View style={styles.iconGrid}>
          {bannerIcons.map((icon) => (
            <TouchableOpacity
              key={icon}
              style={[
                styles.iconOption,
                formData.bannerIcon === icon && styles.iconOptionActive,
              ]}
              onPress={() => updateFormData('bannerIcon', icon)}
            >
              <Ionicons name={icon as any} size={28} color="#262626" />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Preview */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Preview</Text>
        <View style={styles.previewCard}>
          <View style={[styles.previewBanner, { backgroundColor: formData.bannerColor }]}>
            <Ionicons name={formData.bannerIcon as any} size={60} color="#fff" />
          </View>
          <View style={styles.previewContent}>
            <View style={styles.previewCategory}>
              <Text style={styles.previewCategoryText}>{formData.category || 'Category'}</Text>
            </View>
            <Text style={styles.previewTitle}>{formData.title || 'Event Title'}</Text>
            <Text style={styles.previewDescription} numberOfLines={2}>
              {formData.description || 'Event description will appear here...'}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Enhanced Header with My Events and My Tickets */}
      <View style={styles.headerContainer}>
        <View style={styles.headerBar}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => navigation?.navigate?.('OrganizerMyEvents')}
            activeOpacity={0.7}
          >
            <Ionicons name="calendar" size={18} color="#0a66c2" />
            <Text style={styles.headerBtnText}>My Events</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => navigation?.navigate?.('MyTickets')}
            activeOpacity={0.7}
          >
            <Ionicons name="ticket" size={18} color="#0a66c2" />
            <Text style={styles.headerBtnText}>My Tickets</Text>
          </TouchableOpacity>
        </View>
      </View>
      <CreateEventWizard />
      <BottomNavigation activeTab="Create" navigation={navigation} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  headerContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  headerBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  headerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#f0f7ff',
    borderWidth: 1,
    borderColor: '#d0e7ff',
    shadowColor: '#0a66c2',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  headerBtnText: {
    color: '#0a66c2',
    fontWeight: '700',
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#dbdbdb',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#262626',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#fff',
  },
  progressStepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressStep: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  progressStepActive: {
    backgroundColor: '#0a66c2',
    borderColor: '#0a66c2',
  },
  progressStepText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8e8e8e',
  },
  progressStepTextActive: {
    color: '#fff',
  },
  progressLine: {
    width: 60,
    height: 2,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 4,
  },
  progressLineActive: {
    backgroundColor: '#0a66c2',
  },
  stepLabels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#dbdbdb',
  },
  stepLabel: {
    fontSize: 12,
    color: '#8e8e8e',
    fontWeight: '500',
  },
  stepLabelActive: {
    color: '#0a66c2',
    fontWeight: '600',
  },
  stepContent: {
    flex: 1,
    padding: 16,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#262626',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#8e8e8e',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#262626',
    marginBottom: 8,
  },
  required: {
    color: '#ff3250',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 0.5,
    borderColor: '#dbdbdb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: '#262626',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#8e8e8e',
    marginTop: 4,
    textAlign: 'right',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 0.5,
    borderColor: '#dbdbdb',
  },
  categoryChipActive: {
    backgroundColor: '#0a66c2',
    borderColor: '#0a66c2',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#262626',
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateInput: {
    flex: 2,
  },
  timeInput: {
    flex: 1,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pickerButtonText: {
    fontSize: 15,
    color: '#262626',
  },
  typeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 0.5,
    borderColor: '#dbdbdb',
    gap: 8,
  },
  typeButtonActive: {
    backgroundColor: '#0a66c2',
    borderColor: '#0a66c2',
  },
  typeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#262626',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorOptionActive: {
    borderColor: '#262626',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  iconOption: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 0.5,
    borderColor: '#dbdbdb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconOptionActive: {
    borderColor: '#0a66c2',
    borderWidth: 2,
  },
  previewCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: '#dbdbdb',
  },
  previewBanner: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewContent: {
    padding: 12,
  },
  previewCategory: {
    alignSelf: 'flex-start',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  previewCategoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0a66c2',
    textTransform: 'uppercase',
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#262626',
    marginBottom: 6,
  },
  previewDescription: {
    fontSize: 13,
    color: '#8e8e8e',
    lineHeight: 18,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 0.5,
    borderTopColor: '#dbdbdb',
    gap: 12,
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#0a66c2',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  draftButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 0.5,
    borderColor: '#dbdbdb',
  },
  draftButtonText: {
    color: '#262626',
    fontSize: 16,
    fontWeight: '600',
  },
  publishButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a66c2',
  },
  publishButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CreateEventScreen;
