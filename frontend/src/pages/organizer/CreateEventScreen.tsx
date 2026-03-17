/**
 * CreateEventScreen
 * Form to create a new event
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../context/ThemeContext';
import { createEvent } from '../../services/events.api';
import { uploadImage } from '../../services/upload.api';

interface Props {
    navigation?: any;
}

const CreateEventScreen: React.FC<Props> = ({ navigation }) => {
    const { colors } = useTheme();

    const [eventName, setEventName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [venueName, setVenueName] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [startDate, setStartDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [capacity, setCapacity] = useState('');
    const [ticketPrice, setTicketPrice] = useState('');
    const [isOnline, setIsOnline] = useState(false);
    const [meetingLink, setMeetingLink] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [coverImage, setCoverImage] = useState<string | null>(null);
    const [coverImageLocal, setCoverImageLocal] = useState<string | null>(null);

    const categories = ['Conference', 'Workshop', 'Networking', 'Entertainment', 'Sports', 'Food & Beverage'];

    const handlePickImage = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (permissionResult.granted === false) {
                Alert.alert('Permission Required', 'Permission to access camera roll is required!');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [3, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const uri = result.assets[0].uri;
                setCoverImageLocal(uri);
                console.log('📸 Selected cover image:', uri);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const handleCreate = async () => {
        if (!eventName || !category) {
            Alert.alert('Required Fields', 'Please fill in event name and category');
            return;
        }

        if (!isOnline && !venueName) {
            Alert.alert('Required Fields', 'Please provide a venue name or mark as online event');
            return;
        }

        if (isOnline && !meetingLink) {
            Alert.alert('Required Fields', 'Please provide a meeting link for online event');
            return;
        }

        try {
            setIsLoading(true);

            // Upload cover image if selected
            let coverImageUrl: string | undefined;
            if (coverImageLocal) {
                console.log('📤 Uploading cover image...');
                const uploadResult = await uploadImage(coverImageLocal);
                coverImageUrl = uploadResult.url;
                console.log('✅ Cover image uploaded:', coverImageUrl);
            }

            // Build venue string from components
            const venueString = isOnline 
                ? 'Online Event' 
                : [venueName, address, city].filter(Boolean).join(', ');

            // Convert date string to ISO format if provided
            let dateISO: string | undefined;
            if (startDate) {
                const dateParts = startDate.split('/');
                if (dateParts.length === 3) {
                    // Assuming format: DD/MM/YYYY
                    const [day, month, year] = dateParts;
                    dateISO = new Date(`${year}-${month}-${day}`).toISOString();
                }
            }

            const eventData = {
                title: eventName.trim(),
                description: description.trim() || undefined,
                category: category,
                date: dateISO,
                time: startTime || undefined,
                venue: venueString || undefined,
                isOnline: isOnline,
                meetingLink: meetingLink.trim() || undefined,
                coverImage: coverImageUrl,
            };

            console.log('📝 Creating event with data:', eventData);
            const result = await createEvent(eventData);
            console.log('✅ Event created:', result);
            
            setIsLoading(false);
            
            Alert.alert(
                'Success! 🎉',
                'Your event has been created successfully',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation?.navigate?.('OrganizerMyEvents'),
                    },
                ]
            );
        } catch (error: any) {
            setIsLoading(false);
            console.error('❌ Error creating event:', error);
            Alert.alert(
                'Error',
                error.message || 'Failed to create event. Please try again.'
            );
        }
    };

    const handleSaveDraft = () => {
        Alert.alert('Draft Saved', 'Your event has been saved as draft');
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <LinearGradient
                colors={[colors.primary, colors.primary + 'DD']}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        onPress={() => navigation?.goBack?.()}
                        style={styles.backButton}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="close" size={28} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Create Event</Text>
                    <TouchableOpacity
                        onPress={handleSaveDraft}
                        style={styles.draftButton}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.draftButtonText}>Save Draft</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Event Banner Upload */}
                <View style={[styles.section, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Event Banner</Text>
                    <TouchableOpacity
                        style={[styles.uploadBox, { borderColor: colors.border }]}
                        activeOpacity={0.7}
                        onPress={handlePickImage}
                    >
                        {coverImageLocal ? (
                            <View style={styles.imagePreviewContainer}>
                                <Image 
                                    source={{ uri: coverImageLocal }} 
                                    style={styles.imagePreview}
                                    resizeMode="cover"
                                />
                                <View style={styles.changeImageOverlay}>
                                    <Ionicons name="camera" size={32} color="#FFFFFF" />
                                    <Text style={styles.changeImageText}>Change Image</Text>
                                </View>
                            </View>
                        ) : (
                            <>
                                <Ionicons name="image-outline" size={48} color={colors.textSecondary} />
                                <Text style={[styles.uploadText, { color: colors.textSecondary }]}>
                                    Upload Event Banner
                                </Text>
                                <Text style={[styles.uploadHint, { color: colors.textTertiary }]}>
                                    Recommended: 1200x400px
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Basic Information */}
                <View style={[styles.section, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        Basic Information
                    </Text>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>
                            Event Name <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            style={[
                                styles.input,
                                { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
                            ]}
                            placeholder="Enter event name"
                            placeholderTextColor={colors.textSecondary}
                            value={eventName}
                            onChangeText={setEventName}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>
                            Category <Text style={styles.required}>*</Text>
                        </Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View style={styles.categoryRow}>
                                {categories.map((cat) => (
                                    <TouchableOpacity
                                        key={cat}
                                        style={[
                                            styles.categoryChip,
                                            {
                                                backgroundColor: category === cat ? colors.primary : colors.background,
                                                borderColor: category === cat ? colors.primary : colors.border,
                                            },
                                        ]}
                                        onPress={() => setCategory(cat)}
                                        activeOpacity={0.7}
                                    >
                                        <Text
                                            style={[
                                                styles.categoryText,
                                                { color: category === cat ? '#FFFFFF' : colors.text },
                                            ]}
                                        >
                                            {cat}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Description</Text>
                        <TextInput
                            style={[
                                styles.textArea,
                                { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
                            ]}
                            placeholder="Describe your event..."
                            placeholderTextColor={colors.textSecondary}
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={4}
                        />
                    </View>
                </View>

                {/* Date & Time */}
                <View style={[styles.section, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Date & Time</Text>

                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>
                                Start Date <Text style={styles.required}>*</Text>
                            </Text>
                            <TouchableOpacity
                                style={[
                                    styles.input,
                                    { backgroundColor: colors.background, borderColor: colors.border },
                                ]}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
                                <Text style={[styles.inputText, { color: colors.textSecondary }]}>
                                    {startDate || 'Select date'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>
                                Start Time <Text style={styles.required}>*</Text>
                            </Text>
                            <TouchableOpacity
                                style={[
                                    styles.input,
                                    { backgroundColor: colors.background, borderColor: colors.border },
                                ]}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
                                <Text style={[styles.inputText, { color: colors.textSecondary }]}>
                                    {startTime || 'Select time'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Venue */}
                <View style={[styles.section, { backgroundColor: colors.surface }]}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Venue</Text>
                        <TouchableOpacity
                            style={styles.toggleContainer}
                            onPress={() => setIsOnline(!isOnline)}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.toggleLabel, { color: colors.textSecondary }]}>
                                Online Event
                            </Text>
                            <View
                                style={[
                                    styles.toggle,
                                    { backgroundColor: isOnline ? colors.primary : colors.border },
                                ]}
                            >
                                <View
                                    style={[
                                        styles.toggleThumb,
                                        isOnline && styles.toggleThumbActive,
                                    ]}
                                />
                            </View>
                        </TouchableOpacity>
                    </View>

                    {isOnline ? (
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>
                                Meeting Link <Text style={styles.required}>*</Text>
                            </Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
                                ]}
                                placeholder="Enter meeting URL (Zoom, Teams, etc.)"
                                placeholderTextColor={colors.textSecondary}
                                value={meetingLink}
                                onChangeText={setMeetingLink}
                                autoCapitalize="none"
                                keyboardType="url"
                            />
                        </View>
                    ) : (
                        <>
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: colors.textSecondary }]}>
                                    Venue Name <Text style={styles.required}>*</Text>
                                </Text>
                                <TextInput
                                    style={[
                                        styles.input,
                                        { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
                                    ]}
                                    placeholder="Enter venue name"
                                    placeholderTextColor={colors.textSecondary}
                                    value={venueName}
                                    onChangeText={setVenueName}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: colors.textSecondary }]}>Address</Text>
                                <TextInput
                                    style={[
                                        styles.input,
                                        { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
                                    ]}
                                    placeholder="Street address"
                                    placeholderTextColor={colors.textSecondary}
                                    value={address}
                                    onChangeText={setAddress}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: colors.textSecondary }]}>City</Text>
                                <TextInput
                                    style={[
                                        styles.input,
                                        { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
                                    ]}
                                    placeholder="Enter city"
                                    placeholderTextColor={colors.textSecondary}
                                    value={city}
                                    onChangeText={setCity}
                                />
                            </View>
                        </>
                    )}
                </View>

                {/* Tickets */}
                <View style={[styles.section, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Tickets</Text>

                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>
                                Total Capacity
                            </Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
                                ]}
                                placeholder="100"
                                placeholderTextColor={colors.textSecondary}
                                value={capacity}
                                onChangeText={setCapacity}
                                keyboardType="numeric"
                            />
                        </View>

                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>
                                Ticket Price (₹)
                            </Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
                                ]}
                                placeholder="999"
                                placeholderTextColor={colors.textSecondary}
                                value={ticketPrice}
                                onChangeText={setTicketPrice}
                                keyboardType="numeric"
                            />
                        </View>
                    </View>
                </View>

                <View style={styles.bottomSpacing} />
            </ScrollView>

            {/* Bottom Actions */}
            <View style={[styles.bottomBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
                <TouchableOpacity
                    style={[styles.previewButton, { borderColor: colors.border }]}
                    activeOpacity={0.7}
                    disabled={isLoading}
                >
                    <Ionicons name="eye-outline" size={20} color={colors.text} />
                    <Text style={[styles.previewButtonText, { color: colors.text }]}>Preview</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.createButton, { backgroundColor: colors.primary }]}
                    onPress={handleCreate}
                    activeOpacity={0.7}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                        <>
                            <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                            <Text style={styles.createButtonText}>Create Event</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    draftButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 20,
    },
    draftButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },
    section: {
        margin: 16,
        padding: 20,
        borderRadius: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    toggleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    toggleLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    toggle: {
        width: 48,
        height: 28,
        borderRadius: 14,
        padding: 2,
        justifyContent: 'center',
    },
    toggleThumb: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
    },
    toggleThumbActive: {
        alignSelf: 'flex-end',
    },
    uploadBox: {
        borderWidth: 2,
        borderStyle: 'dashed',
        borderRadius: 16,
        padding: 40,
        alignItems: 'center',
    },
    uploadText: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 12,
    },
    uploadHint: {
        fontSize: 13,
        marginTop: 4,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    required: {
        color: '#EF4444',
    },
    input: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        fontSize: 15,
        gap: 10,
    },
    inputText: {
        fontSize: 15,
    },
    textArea: {
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        fontSize: 15,
        textAlignVertical: 'top',
    },
    categoryRow: {
        flexDirection: 'row',
        gap: 10,
    },
    categoryChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1.5,
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '600',
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    bottomSpacing: {
        height: 100,
    },
    bottomBar: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
        borderTopWidth: 1,
    },
    previewButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1.5,
    },
    previewButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    createButton: {
        flex: 1.5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 12,
    },
    createButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    imagePreviewContainer: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
    },
    imagePreview: {
        width: '100%',
        height: '100%',
    },
    changeImageOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    changeImageText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        marginTop: 8,
    },
});

export default CreateEventScreen;
