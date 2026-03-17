/**
 * BasicInfoStep Component
 * Step 1: Collect basic job information
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { JobFormData, JobCategory, JobType, WorkMode } from '../../types/job.types';
import { JOB_CATEGORIES } from '../../data/jobCategories';

interface Props {
    formData: Partial<JobFormData>;
    onUpdate: (data: Partial<JobFormData>) => void;
    errors?: any;
}

const BasicInfoStep: React.FC<Props> = ({ formData, onUpdate, errors }) => {
    const { colors } = useTheme();

    const jobTypes: { value: JobType; label: string }[] = [
        { value: 'full-time', label: 'Full-time' },
        { value: 'part-time', label: 'Part-time' },
        { value: 'internship', label: 'Internship' },
        { value: 'contract', label: 'Contract' },
    ];

    const workModes: { value: WorkMode; label: string; icon: string }[] = [
        { value: 'onsite', label: 'Onsite', icon: 'business' },
        { value: 'remote', label: 'Remote', icon: 'home' },
        { value: 'hybrid', label: 'Hybrid', icon: 'git-merge' },
    ];

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Job Title */}
            <View style={styles.field}>
                <Text style={[styles.label, { color: colors.text }]}>
                    Job Title <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                    style={[
                        styles.input,
                        { backgroundColor: colors.surface, color: colors.text, borderColor: errors?.title ? '#EF4444' : colors.border }
                    ]}
                    placeholder="e.g. Senior Software Engineer"
                    placeholderTextColor={colors.textSecondary}
                    value={formData.title || ''}
                    onChangeText={(text) => onUpdate({ title: text })}
                />
                {errors?.title && (
                    <Text style={styles.errorText}>{errors.title}</Text>
                )}
            </View>

            {/* Company Name */}
            <View style={styles.field}>
                <Text style={[styles.label, { color: colors.text }]}>
                    Company Name <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                    style={[
                        styles.input,
                        { backgroundColor: colors.surface, color: colors.text, borderColor: errors?.companyName ? '#EF4444' : colors.border }
                    ]}
                    placeholder="e.g. Tech Corp Inc."
                    placeholderTextColor={colors.textSecondary}
                    value={formData.companyName || ''}
                    onChangeText={(text) => onUpdate({ companyName: text })}
                />
                {errors?.companyName && (
                    <Text style={styles.errorText}>{errors.companyName}</Text>
                )}
            </View>

            {/* Job Category */}
            <View style={styles.field}>
                <Text style={[styles.label, { color: colors.text }]}>
                    Job Category <Text style={styles.required}>*</Text>
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                    {JOB_CATEGORIES.map((category) => (
                        <TouchableOpacity
                            key={category.value}
                            style={[
                                styles.categoryChip,
                                {
                                    backgroundColor: formData.category === category.value
                                        ? colors.primary
                                        : colors.surface,
                                    borderColor: formData.category === category.value
                                        ? colors.primary
                                        : colors.border,
                                },
                            ]}
                            onPress={() => onUpdate({ category: category.value })}
                        >
                            <Ionicons
                                name={category.icon as any}
                                size={16}
                                color={formData.category === category.value ? '#FFFFFF' : colors.text}
                            />
                            <Text
                                style={[
                                    styles.categoryText,
                                    {
                                        color: formData.category === category.value
                                            ? '#FFFFFF'
                                            : colors.text,
                                    },
                                ]}
                            >
                                {category.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
                {errors?.category && (
                    <Text style={styles.errorText}>{errors.category}</Text>
                )}
            </View>

            {/* Job Type */}
            <View style={styles.field}>
                <Text style={[styles.label, { color: colors.text }]}>
                    Job Type <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.optionsRow}>
                    {jobTypes.map((type) => (
                        <TouchableOpacity
                            key={type.value}
                            style={[
                                styles.optionChip,
                                {
                                    backgroundColor: formData.jobType === type.value
                                        ? colors.primary
                                        : colors.surface,
                                    borderColor: formData.jobType === type.value
                                        ? colors.primary
                                        : colors.border,
                                },
                            ]}
                            onPress={() => onUpdate({ jobType: type.value })}
                        >
                            <Text
                                style={[
                                    styles.optionText,
                                    {
                                        color: formData.jobType === type.value
                                            ? '#FFFFFF'
                                            : colors.text,
                                    },
                                ]}
                            >
                                {type.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Work Mode */}
            <View style={styles.field}>
                <Text style={[styles.label, { color: colors.text }]}>
                    Work Mode <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.optionsRow}>
                    {workModes.map((mode) => (
                        <TouchableOpacity
                            key={mode.value}
                            style={[
                                styles.workModeChip,
                                {
                                    backgroundColor: formData.workMode === mode.value
                                        ? colors.primary
                                        : colors.surface,
                                    borderColor: formData.workMode === mode.value
                                        ? colors.primary
                                        : colors.border,
                                },
                            ]}
                            onPress={() => onUpdate({ workMode: mode.value })}
                        >
                            <Ionicons
                                name={mode.icon as any}
                                size={20}
                                color={formData.workMode === mode.value ? '#FFFFFF' : colors.text}
                            />
                            <Text
                                style={[
                                    styles.workModeText,
                                    {
                                        color: formData.workMode === mode.value
                                            ? '#FFFFFF'
                                            : colors.text,
                                    },
                                ]}
                            >
                                {mode.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Location */}
            <View style={styles.field}>
                <Text style={[styles.label, { color: colors.text }]}>
                    Job Location <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.locationRow}>
                    <TextInput
                        style={[
                            styles.locationInput,
                            { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }
                        ]}
                        placeholder="City"
                        placeholderTextColor={colors.textSecondary}
                        value={formData.location?.city || ''}
                        onChangeText={(text) =>
                            onUpdate({
                                location: { ...formData.location, city: text } as any,
                            })
                        }
                    />
                    <TextInput
                        style={[
                            styles.locationInput,
                            { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }
                        ]}
                        placeholder="State"
                        placeholderTextColor={colors.textSecondary}
                        value={formData.location?.state || ''}
                        onChangeText={(text) =>
                            onUpdate({
                                location: { ...formData.location, state: text } as any,
                            })
                        }
                    />
                </View>
                <TextInput
                    style={[
                        styles.input,
                        { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }
                    ]}
                    placeholder="Country"
                    placeholderTextColor={colors.textSecondary}
                    value={formData.location?.country || ''}
                    onChangeText={(text) =>
                        onUpdate({
                            location: { ...formData.location, country: text } as any,
                        })
                    }
                />
                {errors?.location && (
                    <Text style={styles.errorText}>{errors.location}</Text>
                )}
            </View>

            {/* Remote Toggle */}
            <TouchableOpacity
                style={styles.remoteToggle}
                onPress={() =>
                    onUpdate({
                        location: {
                            ...formData.location,
                            isRemote: !formData.location?.isRemote,
                        } as any,
                    })
                }
            >
                <View style={styles.remoteToggleLeft}>
                    <Ionicons name="globe-outline" size={20} color={colors.text} />
                    <Text style={[styles.remoteToggleText, { color: colors.text }]}>
                        This is a remote position
                    </Text>
                </View>
                <View
                    style={[
                        styles.toggle,
                        {
                            backgroundColor: formData.location?.isRemote
                                ? colors.primary
                                : colors.border,
                        },
                    ]}
                >
                    <View
                        style={[
                            styles.toggleThumb,
                            formData.location?.isRemote && styles.toggleThumbActive,
                        ]}
                    />
                </View>
            </TouchableOpacity>

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
    input: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
    },
    errorText: {
        color: '#EF4444',
        fontSize: 13,
        marginTop: 4,
    },
    categoryScroll: {
        marginTop: 8,
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        marginRight: 10,
        gap: 6,
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '600',
    },
    optionsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginTop: 8,
    },
    optionChip: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
    },
    optionText: {
        fontSize: 14,
        fontWeight: '600',
    },
    workModeChip: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        gap: 8,
    },
    workModeText: {
        fontSize: 14,
        fontWeight: '600',
    },
    locationRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 10,
    },
    locationInput: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
    },
    remoteToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
    },
    remoteToggleLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    remoteToggleText: {
        fontSize: 15,
        fontWeight: '500',
    },
    toggle: {
        width: 50,
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
    bottomSpacing: {
        height: 40,
    },
});

export default BasicInfoStep;
