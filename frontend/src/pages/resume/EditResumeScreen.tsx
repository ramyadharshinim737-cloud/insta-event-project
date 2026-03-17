/**
 * EditResumeScreen
 * Edit existing resume
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import * as resumeApi from '../../services/resume.api';

interface Props {
    navigation?: any;
    route?: any;
}

const EditResumeScreen: React.FC<Props> = ({ navigation, route }) => {
    const { colors } = useTheme();
    const resumeId = route?.params?.resumeId;
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [resume, setResume] = useState<any>(null);

    // Form state
    const [title, setTitle] = useState('');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [location, setLocation] = useState('');
    const [summary, setSummary] = useState('');
    const [skills, setSkills] = useState('');

    useEffect(() => {
        loadResume();
    }, []);

    const loadResume = async () => {
        if (!resumeId) {
            Alert.alert('Error', 'No resume ID provided');
            navigation?.goBack();
            return;
        }

        try {
            setLoading(true);
            const fetchedResume = await resumeApi.getResumeById(resumeId);
            setResume(fetchedResume);

            // Populate form
            setTitle(fetchedResume.title || '');
            setFullName(fetchedResume.personalInfo?.fullName || '');
            setEmail(fetchedResume.personalInfo?.email || '');
            setPhone(fetchedResume.personalInfo?.phone || '');
            setLocation(fetchedResume.personalInfo?.location || '');
            setSummary(fetchedResume.summary || '');
            setSkills(fetchedResume.skills?.join(', ') || '');
        } catch (error: any) {
            console.error('Failed to load resume:', error);
            Alert.alert('Error', error.message || 'Failed to load resume');
            navigation?.goBack();
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!title.trim()) {
            Alert.alert('Error', 'Please enter a resume title');
            return;
        }

        if (!fullName.trim() || !email.trim()) {
            Alert.alert('Error', 'Please enter your name and email');
            return;
        }

        try {
            setSaving(true);

            const updatedData = {
                title,
                personalInfo: {
                    fullName,
                    email,
                    phone,
                    location,
                },
                summary,
                skills: skills.split(',').map(s => s.trim()).filter(s => s.length > 0),
            };

            await resumeApi.updateResume(resumeId, updatedData);
            
            Alert.alert(
                'Success',
                'Resume updated successfully!',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation?.goBack(),
                    },
                ]
            );
        } catch (error: any) {
            console.error('Failed to update resume:', error);
            Alert.alert('Error', error.message || 'Failed to update resume');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                    Loading resume...
                </Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <LinearGradient colors={['#10B981', '#059669']} style={styles.header}>
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        onPress={() => navigation?.goBack()}
                        style={styles.backButton}
                    >
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Edit Resume</Text>
                    <View style={{ width: 40 }} />
                </View>
            </LinearGradient>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Basic Information */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        Basic Information
                    </Text>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>
                            Resume Title *
                        </Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                            value={title}
                            onChangeText={setTitle}
                            placeholder="e.g., Software Engineer Resume"
                            placeholderTextColor={colors.textSecondary}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>
                            Full Name *
                        </Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                            value={fullName}
                            onChangeText={setFullName}
                            placeholder="John Doe"
                            placeholderTextColor={colors.textSecondary}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>
                            Email *
                        </Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="john@example.com"
                            placeholderTextColor={colors.textSecondary}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>
                            Phone
                        </Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                            value={phone}
                            onChangeText={setPhone}
                            placeholder="+1 234 567 8900"
                            placeholderTextColor={colors.textSecondary}
                            keyboardType="phone-pad"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>
                            Location
                        </Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                            value={location}
                            onChangeText={setLocation}
                            placeholder="City, Country"
                            placeholderTextColor={colors.textSecondary}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>
                            Professional Summary
                        </Text>
                        <TextInput
                            style={[styles.textArea, { backgroundColor: colors.surface, color: colors.text }]}
                            value={summary}
                            onChangeText={setSummary}
                            placeholder="Brief summary of your professional background..."
                            placeholderTextColor={colors.textSecondary}
                            multiline
                            numberOfLines={4}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>
                            Skills (comma-separated)
                        </Text>
                        <TextInput
                            style={[styles.textArea, { backgroundColor: colors.surface, color: colors.text }]}
                            value={skills}
                            onChangeText={setSkills}
                            placeholder="React, Node.js, TypeScript, MongoDB"
                            placeholderTextColor={colors.textSecondary}
                            multiline
                            numberOfLines={3}
                        />
                    </View>
                </View>

                <View style={styles.bottomSpacing} />
            </ScrollView>

            {/* Bottom Actions */}
            <View style={[styles.bottomBar, { borderTopColor: colors.border }]}>
                <TouchableOpacity
                    style={[styles.cancelButton, { borderColor: colors.border }]}
                    onPress={() => navigation?.goBack()}
                    disabled={saving}
                >
                    <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.saveButton,
                        { backgroundColor: colors.primary },
                        saving && styles.buttonDisabled
                    ]}
                    onPress={handleSave}
                    disabled={saving}
                >
                    {saving ? (
                        <>
                            <ActivityIndicator size="small" color="#FFFFFF" />
                            <Text style={[styles.saveButtonText, { marginLeft: 8 }]}>Saving...</Text>
                        </>
                    ) : (
                        <>
                            <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                            <Text style={styles.saveButtonText}>Save Changes</Text>
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
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    loadingText: {
        fontSize: 14,
        marginTop: 12,
    },
    header: {
        paddingTop: 50,
        paddingBottom: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    scrollView: {
        flex: 1,
    },
    section: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        borderRadius: 12,
        padding: 14,
        fontSize: 15,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    textArea: {
        borderRadius: 12,
        padding: 14,
        fontSize: 15,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        minHeight: 100,
        textAlignVertical: 'top',
    },
    bottomSpacing: {
        height: 100,
    },
    bottomBar: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
        borderTopWidth: 1,
        backgroundColor: '#FFFFFF',
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButtonText: {
        fontSize: 15,
        fontWeight: '600',
    },
    saveButton: {
        flex: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 12,
    },
    saveButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
});

export default EditResumeScreen;
