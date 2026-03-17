/**
 * HiringDetailsStep Component
 * Step 5: Collect hiring details
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { JobFormData, HiringUrgency, InterviewProcessType, ApplicationMethod } from '../../types/job.types';

interface Props {
    formData: Partial<JobFormData>;
    onUpdate: (data: Partial<JobFormData>) => void;
    errors?: any;
}

const HiringDetailsStep: React.FC<Props> = ({ formData, onUpdate, errors }) => {
    const { colors } = useTheme();

    const urgencyOptions: { value: HiringUrgency; label: string; icon: string }[] = [
        { value: 'normal', label: 'Normal', icon: 'time-outline' },
        { value: 'immediate', label: 'Immediate', icon: 'flash-outline' },
    ];

    const interviewOptions: { value: InterviewProcessType; label: string; icon: string }[] = [
        { value: 'online', label: 'Online', icon: 'videocam-outline' },
        { value: 'offline', label: 'Offline', icon: 'business-outline' },
        { value: 'hybrid', label: 'Hybrid', icon: 'git-merge-outline' },
    ];

    const applicationMethods: { value: ApplicationMethod; label: string; icon: string }[] = [
        { value: 'in-app', label: 'In-App', icon: 'phone-portrait-outline' },
        { value: 'email', label: 'Email', icon: 'mail-outline' },
        { value: 'url', label: 'External URL', icon: 'link-outline' },
    ];

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Number of Openings */}
            <View style={styles.field}>
                <Text style={[styles.label, { color: colors.text }]}>
                    Number of Openings <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                    style={[
                        styles.input,
                        { backgroundColor: colors.surface, color: colors.text, borderColor: errors?.openings ? '#EF4444' : colors.border },
                    ]}
                    placeholder="e.g. 5"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                    value={formData.openings?.toString() || ''}
                    onChangeText={(text) => onUpdate({ openings: parseInt(text) || 1 })}
                />
                {errors?.openings && (
                    <Text style={styles.errorText}>{errors.openings}</Text>
                )}
            </View>

            {/* Application Deadline */}
            <View style={styles.field}>
                <Text style={[styles.label, { color: colors.text }]}>
                    Application Deadline <Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity
                    style={[
                        styles.dateInput,
                        { backgroundColor: colors.surface, borderColor: errors?.applicationDeadline ? '#EF4444' : colors.border },
                    ]}
                >
                    <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
                    <TextInput
                        style={[styles.dateText, { color: colors.text }]}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor={colors.textSecondary}
                        value={formData.applicationDeadline || ''}
                        onChangeText={(text) => onUpdate({ applicationDeadline: text })}
                    />
                </TouchableOpacity>
                <Text style={[styles.hint, { color: colors.textSecondary }]}>
                    Format: YYYY-MM-DD (e.g., 2026-03-31)
                </Text>
                {errors?.applicationDeadline && (
                    <Text style={styles.errorText}>{errors.applicationDeadline}</Text>
                )}
            </View>

            {/* Hiring Urgency */}
            <View style={styles.field}>
                <Text style={[styles.label, { color: colors.text }]}>
                    Hiring Urgency <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.optionsRow}>
                    {urgencyOptions.map((option) => (
                        <TouchableOpacity
                            key={option.value}
                            style={[
                                styles.optionCard,
                                {
                                    backgroundColor:
                                        formData.hiringUrgency === option.value
                                            ? colors.primary + '20'
                                            : colors.surface,
                                    borderColor:
                                        formData.hiringUrgency === option.value
                                            ? colors.primary
                                            : colors.border,
                                },
                            ]}
                            onPress={() => onUpdate({ hiringUrgency: option.value })}
                        >
                            <Ionicons
                                name={option.icon as any}
                                size={24}
                                color={
                                    formData.hiringUrgency === option.value
                                        ? colors.primary
                                        : colors.textSecondary
                                }
                            />
                            <Text
                                style={[
                                    styles.optionText,
                                    {
                                        color:
                                            formData.hiringUrgency === option.value
                                                ? colors.primary
                                                : colors.text,
                                    },
                                ]}
                            >
                                {option.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Interview Process */}
            <View style={styles.field}>
                <Text style={[styles.label, { color: colors.text }]}>
                    Interview Process <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.optionsRow}>
                    {interviewOptions.map((option) => (
                        <TouchableOpacity
                            key={option.value}
                            style={[
                                styles.optionCard,
                                {
                                    backgroundColor:
                                        formData.interviewProcess === option.value
                                            ? colors.primary + '20'
                                            : colors.surface,
                                    borderColor:
                                        formData.interviewProcess === option.value
                                            ? colors.primary
                                            : colors.border,
                                },
                            ]}
                            onPress={() => onUpdate({ interviewProcess: option.value })}
                        >
                            <Ionicons
                                name={option.icon as any}
                                size={24}
                                color={
                                    formData.interviewProcess === option.value
                                        ? colors.primary
                                        : colors.textSecondary
                                }
                            />
                            <Text
                                style={[
                                    styles.optionText,
                                    {
                                        color:
                                            formData.interviewProcess === option.value
                                                ? colors.primary
                                                : colors.text,
                                    },
                                ]}
                            >
                                {option.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Application Method */}
            <View style={styles.field}>
                <Text style={[styles.label, { color: colors.text }]}>
                    How to Apply <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.methodsColumn}>
                    {applicationMethods.map((method) => (
                        <TouchableOpacity
                            key={method.value}
                            style={[
                                styles.methodCard,
                                {
                                    backgroundColor:
                                        formData.applicationMethod === method.value
                                            ? colors.primary + '20'
                                            : colors.surface,
                                    borderColor:
                                        formData.applicationMethod === method.value
                                            ? colors.primary
                                            : colors.border,
                                },
                            ]}
                            onPress={() => onUpdate({ applicationMethod: method.value })}
                        >
                            <Ionicons
                                name={method.icon as any}
                                size={20}
                                color={
                                    formData.applicationMethod === method.value
                                        ? colors.primary
                                        : colors.textSecondary
                                }
                            />
                            <Text
                                style={[
                                    styles.methodText,
                                    {
                                        color:
                                            formData.applicationMethod === method.value
                                                ? colors.primary
                                                : colors.text,
                                    },
                                ]}
                            >
                                {method.label}
                            </Text>
                            {formData.applicationMethod === method.value && (
                                <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Contact Email (if email method) */}
            {formData.applicationMethod === 'email' && (
                <View style={styles.field}>
                    <Text style={[styles.label, { color: colors.text }]}>
                        Contact Email <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                        style={[
                            styles.input,
                            { backgroundColor: colors.surface, color: colors.text, borderColor: errors?.contactInfo ? '#EF4444' : colors.border },
                        ]}
                        placeholder="careers@company.com"
                        placeholderTextColor={colors.textSecondary}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={formData.contactEmail || ''}
                        onChangeText={(text) => onUpdate({ contactEmail: text })}
                    />
                    {errors?.contactInfo && (
                        <Text style={styles.errorText}>{errors.contactInfo}</Text>
                    )}
                </View>
            )}

            {/* Application URL (if url method) */}
            {formData.applicationMethod === 'url' && (
                <View style={styles.field}>
                    <Text style={[styles.label, { color: colors.text }]}>
                        Application URL <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                        style={[
                            styles.input,
                            { backgroundColor: colors.surface, color: colors.text, borderColor: errors?.contactInfo ? '#EF4444' : colors.border },
                        ]}
                        placeholder="https://company.com/apply"
                        placeholderTextColor={colors.textSecondary}
                        keyboardType="url"
                        autoCapitalize="none"
                        value={formData.applicationUrl || ''}
                        onChangeText={(text) => onUpdate({ applicationUrl: text })}
                    />
                    {errors?.contactInfo && (
                        <Text style={styles.errorText}>{errors.contactInfo}</Text>
                    )}
                </View>
            )}

            <View style={styles.bottomSpacing} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    field: {
        marginBottom: 24,
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 8,
    },
    required: {
        color: '#EF4444',
    },
    hint: {
        fontSize: 13,
        marginTop: 4,
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
    },
    dateInput: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 10,
    },
    dateText: {
        flex: 1,
        fontSize: 15,
    },
    optionsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    optionCard: {
        flex: 1,
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        gap: 8,
    },
    optionText: {
        fontSize: 14,
        fontWeight: '600',
    },
    methodsColumn: {
        gap: 10,
    },
    methodCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        gap: 12,
    },
    methodText: {
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
    },
    errorText: {
        color: '#EF4444',
        fontSize: 13,
        marginTop: 4,
    },
    bottomSpacing: {
        height: 40,
    },
});

export default HiringDetailsStep;
