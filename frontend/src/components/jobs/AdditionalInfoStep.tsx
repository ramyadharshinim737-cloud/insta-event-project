/**
 * AdditionalInfoStep Component
 * Step 6: Collect additional company and job information
 */

import React, { useState } from 'react';
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
import { JobFormData } from '../../types/job.types';

interface Props {
    formData: Partial<JobFormData>;
    onUpdate: (data: Partial<JobFormData>) => void;
    errors?: any;
}

const AdditionalInfoStep: React.FC<Props> = ({ formData, onUpdate, errors }) => {
    const { colors } = useTheme();
    const [newTag, setNewTag] = useState('');

    const addTag = () => {
        if (newTag.trim() && (!formData.tags || !formData.tags.includes(newTag.trim()))) {
            onUpdate({
                tags: [...(formData.tags || []), newTag.trim()],
            });
            setNewTag('');
        }
    };

    const removeTag = (tag: string) => {
        onUpdate({
            tags: (formData.tags || []).filter(t => t !== tag),
        });
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Company Description */}
            <View style={styles.field}>
                <Text style={[styles.label, { color: colors.text }]}>
                    Company Description <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                    style={[
                        styles.textArea,
                        {
                            backgroundColor: colors.surface,
                            color: colors.text,
                            borderColor: errors?.companyDescription ? '#EF4444' : colors.border,
                        },
                    ]}
                    placeholder="Tell candidates about your company, culture, mission, and what makes it a great place to work..."
                    placeholderTextColor={colors.textSecondary}
                    value={formData.companyDescription || ''}
                    onChangeText={(text) => onUpdate({ companyDescription: text })}
                    multiline
                    numberOfLines={6}
                    textAlignVertical="top"
                />
                <Text style={[styles.charCount, { color: colors.textSecondary }]}>
                    {formData.companyDescription?.length || 0} / 500 characters (min 30)
                </Text>
                {errors?.companyDescription && (
                    <Text style={styles.errorText}>{errors.companyDescription}</Text>
                )}
            </View>

            {/* Company Website */}
            <View style={styles.field}>
                <Text style={[styles.label, { color: colors.text }]}>
                    Company Website
                </Text>
                <TextInput
                    style={[
                        styles.input,
                        { backgroundColor: colors.surface, color: colors.text, borderColor: errors?.companyWebsite ? '#EF4444' : colors.border },
                    ]}
                    placeholder="https://www.company.com"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="url"
                    autoCapitalize="none"
                    value={formData.companyWebsite || ''}
                    onChangeText={(text) => onUpdate({ companyWebsite: text })}
                />
                {errors?.companyWebsite && (
                    <Text style={styles.errorText}>{errors.companyWebsite}</Text>
                )}
            </View>

            {/* Equal Opportunity Statement */}
            <TouchableOpacity
                style={styles.toggleRow}
                onPress={() =>
                    onUpdate({
                        equalOpportunity: !formData.equalOpportunity,
                    })
                }
            >
                <View style={styles.toggleLeft}>
                    <Ionicons name="shield-checkmark-outline" size={20} color={colors.text} />
                    <View style={styles.toggleTextContainer}>
                        <Text style={[styles.toggleText, { color: colors.text }]}>
                            Equal Opportunity Employer
                        </Text>
                        <Text style={[styles.toggleHint, { color: colors.textSecondary }]}>
                            Show that you value diversity and inclusion
                        </Text>
                    </View>
                </View>
                <View
                    style={[
                        styles.toggle,
                        {
                            backgroundColor: formData.equalOpportunity
                                ? colors.primary
                                : colors.border,
                        },
                    ]}
                >
                    <View
                        style={[
                            styles.toggleThumb,
                            formData.equalOpportunity && styles.toggleThumbActive,
                        ]}
                    />
                </View>
            </TouchableOpacity>

            {/* Custom Message */}
            <View style={styles.field}>
                <Text style={[styles.label, { color: colors.text }]}>
                    Custom Message to Candidates (Optional)
                </Text>
                <TextInput
                    style={[
                        styles.textArea,
                        { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
                    ]}
                    placeholder="Add any additional information or special instructions for candidates..."
                    placeholderTextColor={colors.textSecondary}
                    value={formData.customMessage || ''}
                    onChangeText={(text) => onUpdate({ customMessage: text })}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                />
            </View>

            {/* Job Tags */}
            <View style={styles.field}>
                <Text style={[styles.label, { color: colors.text }]}>
                    Job Tags (Optional)
                </Text>
                <Text style={[styles.hint, { color: colors.textSecondary }]}>
                    Add keywords to help candidates find this job
                </Text>
                <View style={styles.inputWithButton}>
                    <TextInput
                        style={[
                            styles.inputFlex,
                            { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
                        ]}
                        placeholder="e.g. startup, fast-paced, innovative"
                        placeholderTextColor={colors.textSecondary}
                        value={newTag}
                        onChangeText={setNewTag}
                        onSubmitEditing={addTag}
                    />
                    <TouchableOpacity
                        style={[styles.addButton, { backgroundColor: colors.primary }]}
                        onPress={addTag}
                    >
                        <Ionicons name="add" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
                {formData.tags && formData.tags.length > 0 && (
                    <View style={styles.tags}>
                        {formData.tags.map((tag, index) => (
                            <View
                                key={index}
                                style={[styles.tag, { backgroundColor: colors.primary + '20' }]}
                            >
                                <Text style={[styles.tagText, { color: colors.primary }]}>
                                    #{tag}
                                </Text>
                                <TouchableOpacity onPress={() => removeTag(tag)}>
                                    <Ionicons name="close" size={16} color={colors.primary} />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}
            </View>

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
        color: '#6B7280',
        marginBottom: 12,
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
    },
    textArea: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
        minHeight: 100,
    },
    charCount: {
        fontSize: 12,
        marginTop: 4,
        textAlign: 'right',
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        marginBottom: 24,
    },
    toggleLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    toggleTextContainer: {
        flex: 1,
    },
    toggleText: {
        fontSize: 15,
        fontWeight: '500',
    },
    toggleHint: {
        fontSize: 13,
        marginTop: 2,
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
    inputWithButton: {
        flexDirection: 'row',
        gap: 10,
    },
    inputFlex: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
    },
    addButton: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 12,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 6,
    },
    tagText: {
        fontSize: 14,
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

export default AdditionalInfoStep;
