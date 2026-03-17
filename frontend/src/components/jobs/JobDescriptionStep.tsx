/**
 * JobDescriptionStep Component
 * Step 2: Collect job description details
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
import { generateJobDescription, suggestSkillsForJobTitle } from '../../utils/jobCreationUtils';

interface Props {
    formData: Partial<JobFormData>;
    onUpdate: (data: Partial<JobFormData>) => void;
    errors?: any;
}

const JobDescriptionStep: React.FC<Props> = ({ formData, onUpdate, errors }) => {
    const { colors } = useTheme();
    const [newResponsibility, setNewResponsibility] = useState('');
    const [newSkill, setNewSkill] = useState('');
    const [newPreferredSkill, setNewPreferredSkill] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    const handleGenerateDescription = () => {
        if (formData.title && formData.category) {
            const generated = generateJobDescription(
                formData.title,
                formData.category,
                formData.requiredSkills || []
            );
            onUpdate({ roleOverview: generated });
        }
    };

    const handleShowSkillSuggestions = () => {
        if (formData.title && formData.category) {
            const suggestions = suggestSkillsForJobTitle(formData.title, formData.category);
            setShowSuggestions(true);
            // Auto-add suggestions if no skills yet
            if (!formData.requiredSkills || formData.requiredSkills.length === 0) {
                onUpdate({ requiredSkills: suggestions.slice(0, 5) });
            }
        }
    };

    const addResponsibility = () => {
        if (newResponsibility.trim()) {
            onUpdate({
                keyResponsibilities: [
                    ...(formData.keyResponsibilities || []),
                    newResponsibility.trim(),
                ],
            });
            setNewResponsibility('');
        }
    };

    const removeResponsibility = (index: number) => {
        const updated = [...(formData.keyResponsibilities || [])];
        updated.splice(index, 1);
        onUpdate({ keyResponsibilities: updated });
    };

    const addSkill = (skill: string, isPreferred: boolean = false) => {
        const key = isPreferred ? 'preferredSkills' : 'requiredSkills';
        const current = formData[key] || [];
        if (!current.includes(skill.trim()) && skill.trim()) {
            onUpdate({ [key]: [...current, skill.trim()] });
            if (isPreferred) {
                setNewPreferredSkill('');
            } else {
                setNewSkill('');
            }
        }
    };

    const removeSkill = (skill: string, isPreferred: boolean = false) => {
        const key = isPreferred ? 'preferredSkills' : 'requiredSkills';
        const updated = (formData[key] || []).filter(s => s !== skill);
        onUpdate({ [key]: updated });
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Role Overview */}
            <View style={styles.field}>
                <View style={styles.labelRow}>
                    <Text style={[styles.label, { color: colors.text }]}>
                        Role Overview <Text style={styles.required}>*</Text>
                    </Text>
                    <TouchableOpacity
                        style={[styles.aiButton, { backgroundColor: colors.primary + '20' }]}
                        onPress={handleGenerateDescription}
                    >
                        <Ionicons name="sparkles" size={14} color={colors.primary} />
                        <Text style={[styles.aiButtonText, { color: colors.primary }]}>
                            AI Generate
                        </Text>
                    </TouchableOpacity>
                </View>
                <TextInput
                    style={[
                        styles.textArea,
                        {
                            backgroundColor: colors.surface,
                            color: colors.text,
                            borderColor: errors?.roleOverview ? '#EF4444' : colors.border,
                        },
                    ]}
                    placeholder="Describe what this role is about, main objectives, and what the candidate will be doing..."
                    placeholderTextColor={colors.textSecondary}
                    value={formData.roleOverview || ''}
                    onChangeText={(text) => onUpdate({ roleOverview: text })}
                    multiline
                    numberOfLines={6}
                    textAlignVertical="top"
                />
                <Text style={[styles.charCount, { color: colors.textSecondary }]}>
                    {formData.roleOverview?.length || 0} / 500 characters (min 50)
                </Text>
                {errors?.roleOverview && (
                    <Text style={styles.errorText}>{errors.roleOverview}</Text>
                )}
            </View>

            {/* Key Responsibilities */}
            <View style={styles.field}>
                <Text style={[styles.label, { color: colors.text }]}>
                    Key Responsibilities <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.inputWithButton}>
                    <TextInput
                        style={[
                            styles.inputFlex,
                            { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
                        ]}
                        placeholder="Add a responsibility..."
                        placeholderTextColor={colors.textSecondary}
                        value={newResponsibility}
                        onChangeText={setNewResponsibility}
                        onSubmitEditing={addResponsibility}
                    />
                    <TouchableOpacity
                        style={[styles.addButton, { backgroundColor: colors.primary }]}
                        onPress={addResponsibility}
                    >
                        <Ionicons name="add" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
                <View style={styles.list}>
                    {(formData.keyResponsibilities || []).map((resp, index) => (
                        <View
                            key={index}
                            style={[styles.listItem, { backgroundColor: colors.surface }]}
                        >
                            <Text style={[styles.listItemText, { color: colors.text }]}>
                                ΓÇó {resp}
                            </Text>
                            <TouchableOpacity onPress={() => removeResponsibility(index)}>
                                <Ionicons name="close-circle" size={20} color="#EF4444" />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
                {errors?.keyResponsibilities && (
                    <Text style={styles.errorText}>{errors.keyResponsibilities}</Text>
                )}
            </View>

            {/* Required Skills */}
            <View style={styles.field}>
                <View style={styles.labelRow}>
                    <Text style={[styles.label, { color: colors.text }]}>
                        Required Skills <Text style={styles.required}>*</Text>
                    </Text>
                    <TouchableOpacity
                        style={[styles.aiButton, { backgroundColor: colors.primary + '20' }]}
                        onPress={handleShowSkillSuggestions}
                    >
                        <Ionicons name="bulb" size={14} color={colors.primary} />
                        <Text style={[styles.aiButtonText, { color: colors.primary }]}>
                            Suggest
                        </Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.inputWithButton}>
                    <TextInput
                        style={[
                            styles.inputFlex,
                            { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
                        ]}
                        placeholder="Add a skill..."
                        placeholderTextColor={colors.textSecondary}
                        value={newSkill}
                        onChangeText={setNewSkill}
                        onSubmitEditing={() => addSkill(newSkill, false)}
                    />
                    <TouchableOpacity
                        style={[styles.addButton, { backgroundColor: colors.primary }]}
                        onPress={() => addSkill(newSkill, false)}
                    >
                        <Ionicons name="add" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
                <View style={styles.tags}>
                    {(formData.requiredSkills || []).map((skill, index) => (
                        <View
                            key={index}
                            style={[styles.tag, { backgroundColor: colors.primary + '20' }]}
                        >
                            <Text style={[styles.tagText, { color: colors.primary }]}>
                                {skill}
                            </Text>
                            <TouchableOpacity onPress={() => removeSkill(skill, false)}>
                                <Ionicons name="close" size={16} color={colors.primary} />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
                {errors?.requiredSkills && (
                    <Text style={styles.errorText}>{errors.requiredSkills}</Text>
                )}
            </View>

            {/* Preferred Skills */}
            <View style={styles.field}>
                <Text style={[styles.label, { color: colors.text }]}>
                    Preferred Skills (Optional)
                </Text>
                <View style={styles.inputWithButton}>
                    <TextInput
                        style={[
                            styles.inputFlex,
                            { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
                        ]}
                        placeholder="Add a preferred skill..."
                        placeholderTextColor={colors.textSecondary}
                        value={newPreferredSkill}
                        onChangeText={setNewPreferredSkill}
                        onSubmitEditing={() => addSkill(newPreferredSkill, true)}
                    />
                    <TouchableOpacity
                        style={[styles.addButton, { backgroundColor: colors.primary }]}
                        onPress={() => addSkill(newPreferredSkill, true)}
                    >
                        <Ionicons name="add" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
                <View style={styles.tags}>
                    {(formData.preferredSkills || []).map((skill, index) => (
                        <View
                            key={index}
                            style={[styles.tag, { backgroundColor: colors.border }]}
                        >
                            <Text style={[styles.tagText, { color: colors.text }]}>
                                {skill}
                            </Text>
                            <TouchableOpacity onPress={() => removeSkill(skill, true)}>
                                <Ionicons name="close" size={16} color={colors.text} />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
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
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
    },
    required: {
        color: '#EF4444',
    },
    aiButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        gap: 4,
    },
    aiButtonText: {
        fontSize: 13,
        fontWeight: '600',
    },
    textArea: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
        minHeight: 120,
    },
    charCount: {
        fontSize: 12,
        marginTop: 4,
        textAlign: 'right',
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
    list: {
        marginTop: 12,
        gap: 8,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        borderRadius: 10,
    },
    listItemText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
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

export default JobDescriptionStep;
