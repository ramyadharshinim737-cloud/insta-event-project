/**
 * RequirementsStep Component
 * Step 3: Collect candidate requirements
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
import { JobFormData, ExperienceLevel } from '../../types/job.types';
import { EDUCATION_QUALIFICATIONS, LANGUAGES } from '../../data/jobCategories';

interface Props {
    formData: Partial<JobFormData>;
    onUpdate: (data: Partial<JobFormData>) => void;
    errors?: any;
}

const RequirementsStep: React.FC<Props> = ({ formData, onUpdate, errors }) => {
    const { colors } = useTheme();
    const [newCertification, setNewCertification] = useState('');
    const [showEducationDropdown, setShowEducationDropdown] = useState(false);
    const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

    const experienceLevels: { value: ExperienceLevel; label: string }[] = [
        { value: 'entry', label: 'Entry Level' },
        { value: 'mid', label: 'Mid Level' },
        { value: 'senior', label: 'Senior' },
        { value: 'lead', label: 'Lead' },
        { value: 'executive', label: 'Executive' },
    ];

    const addCertification = () => {
        if (newCertification.trim()) {
            onUpdate({
                certifications: [
                    ...(formData.certifications || []),
                    newCertification.trim(),
                ],
            });
            setNewCertification('');
        }
    };

    const removeCertification = (index: number) => {
        const updated = [...(formData.certifications || [])];
        updated.splice(index, 1);
        onUpdate({ certifications: updated });
    };

    const toggleLanguage = (language: string) => {
        const current = formData.languages || [];
        if (current.includes(language)) {
            onUpdate({ languages: current.filter(l => l !== language) });
        } else {
            onUpdate({ languages: [...current, language] });
        }
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Experience Range */}
            <View style={styles.field}>
                <Text style={[styles.label, { color: colors.text }]}>
                    Experience Required <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.rangeRow}>
                    <View style={styles.rangeInput}>
                        <Text style={[styles.rangeLabel, { color: colors.textSecondary }]}>
                            Minimum
                        </Text>
                        <TextInput
                            style={[
                                styles.numberInput,
                                { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
                            ]}
                            placeholder="0"
                            placeholderTextColor={colors.textSecondary}
                            keyboardType="numeric"
                            value={formData.experience?.min?.toString() || ''}
                            onChangeText={(text) =>
                                onUpdate({
                                    experience: {
                                        ...formData.experience,
                                        min: parseInt(text) || 0,
                                    } as any,
                                })
                            }
                        />
                        <Text style={[styles.rangeUnit, { color: colors.textSecondary }]}>
                            years
                        </Text>
                    </View>
                    <Text style={[styles.rangeSeparator, { color: colors.textSecondary }]}>
                        to
                    </Text>
                    <View style={styles.rangeInput}>
                        <Text style={[styles.rangeLabel, { color: colors.textSecondary }]}>
                            Maximum
                        </Text>
                        <TextInput
                            style={[
                                styles.numberInput,
                                { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
                            ]}
                            placeholder="10"
                            placeholderTextColor={colors.textSecondary}
                            keyboardType="numeric"
                            value={formData.experience?.max?.toString() || ''}
                            onChangeText={(text) =>
                                onUpdate({
                                    experience: {
                                        ...formData.experience,
                                        max: parseInt(text) || 0,
                                    } as any,
                                })
                            }
                        />
                        <Text style={[styles.rangeUnit, { color: colors.textSecondary }]}>
                            years
                        </Text>
                    </View>
                </View>
                {errors?.experience && (
                    <Text style={styles.errorText}>{errors.experience}</Text>
                )}
            </View>

            {/* Experience Level */}
            <View style={styles.field}>
                <Text style={[styles.label, { color: colors.text }]}>
                    Experience Level <Text style={styles.required}>*</Text>
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.levelRow}>
                        {experienceLevels.map((level) => (
                            <TouchableOpacity
                                key={level.value}
                                style={[
                                    styles.levelChip,
                                    {
                                        backgroundColor:
                                            formData.experience?.level === level.value
                                                ? colors.primary
                                                : colors.surface,
                                        borderColor:
                                            formData.experience?.level === level.value
                                                ? colors.primary
                                                : colors.border,
                                    },
                                ]}
                                onPress={() =>
                                    onUpdate({
                                        experience: {
                                            ...formData.experience,
                                            level: level.value,
                                        } as any,
                                    })
                                }
                            >
                                <Text
                                    style={[
                                        styles.levelText,
                                        {
                                            color:
                                                formData.experience?.level === level.value
                                                    ? '#FFFFFF'
                                                    : colors.text,
                                        },
                                    ]}
                                >
                                    {level.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            </View>

            {/* Education */}
            <View style={styles.field}>
                <Text style={[styles.label, { color: colors.text }]}>
                    Education Qualification <Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity
                    style={[
                        styles.dropdown,
                        { backgroundColor: colors.surface, borderColor: errors?.education ? '#EF4444' : colors.border },
                    ]}
                    onPress={() => setShowEducationDropdown(!showEducationDropdown)}
                >
                    <Text style={[styles.dropdownText, { color: formData.education ? colors.text : colors.textSecondary }]}>
                        {formData.education || 'Select education qualification'}
                    </Text>
                    <Ionicons
                        name={showEducationDropdown ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color={colors.textSecondary}
                    />
                </TouchableOpacity>
                {showEducationDropdown && (
                    <View style={[styles.dropdownList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        {EDUCATION_QUALIFICATIONS.map((edu) => (
                            <TouchableOpacity
                                key={edu}
                                style={styles.dropdownItem}
                                onPress={() => {
                                    onUpdate({ education: edu });
                                    setShowEducationDropdown(false);
                                }}
                            >
                                <Text style={[styles.dropdownItemText, { color: colors.text }]}>
                                    {edu}
                                </Text>
                                {formData.education === edu && (
                                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
                {errors?.education && (
                    <Text style={styles.errorText}>{errors.education}</Text>
                )}
            </View>

            {/* Certifications */}
            <View style={styles.field}>
                <Text style={[styles.label, { color: colors.text }]}>
                    Certifications (Optional)
                </Text>
                <View style={styles.inputWithButton}>
                    <TextInput
                        style={[
                            styles.inputFlex,
                            { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
                        ]}
                        placeholder="Add a certification..."
                        placeholderTextColor={colors.textSecondary}
                        value={newCertification}
                        onChangeText={setNewCertification}
                        onSubmitEditing={addCertification}
                    />
                    <TouchableOpacity
                        style={[styles.addButton, { backgroundColor: colors.primary }]}
                        onPress={addCertification}
                    >
                        <Ionicons name="add" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
                <View style={styles.list}>
                    {(formData.certifications || []).map((cert, index) => (
                        <View
                            key={index}
                            style={[styles.listItem, { backgroundColor: colors.surface }]}
                        >
                            <Ionicons name="ribbon-outline" size={18} color={colors.primary} />
                            <Text style={[styles.listItemText, { color: colors.text }]}>
                                {cert}
                            </Text>
                            <TouchableOpacity onPress={() => removeCertification(index)}>
                                <Ionicons name="close-circle" size={20} color="#EF4444" />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            </View>

            {/* Languages */}
            <View style={styles.field}>
                <Text style={[styles.label, { color: colors.text }]}>
                    Language Requirements (Optional)
                </Text>
                <TouchableOpacity
                    style={[
                        styles.dropdown,
                        { backgroundColor: colors.surface, borderColor: colors.border },
                    ]}
                    onPress={() => setShowLanguageDropdown(!showLanguageDropdown)}
                >
                    <Text style={[styles.dropdownText, { color: formData.languages?.length ? colors.text : colors.textSecondary }]}>
                        {formData.languages?.length
                            ? `${formData.languages.length} language(s) selected`
                            : 'Select languages'}
                    </Text>
                    <Ionicons
                        name={showLanguageDropdown ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color={colors.textSecondary}
                    />
                </TouchableOpacity>
                {showLanguageDropdown && (
                    <View style={[styles.dropdownList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        {LANGUAGES.map((lang) => (
                            <TouchableOpacity
                                key={lang}
                                style={styles.dropdownItem}
                                onPress={() => toggleLanguage(lang)}
                            >
                                <Text style={[styles.dropdownItemText, { color: colors.text }]}>
                                    {lang}
                                </Text>
                                {formData.languages?.includes(lang) && (
                                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
                {formData.languages && formData.languages.length > 0 && (
                    <View style={styles.tags}>
                        {formData.languages.map((lang) => (
                            <View
                                key={lang}
                                style={[styles.tag, { backgroundColor: colors.primary + '20' }]}
                            >
                                <Text style={[styles.tagText, { color: colors.primary }]}>
                                    {lang}
                                </Text>
                                <TouchableOpacity onPress={() => toggleLanguage(lang)}>
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
    rangeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    rangeInput: {
        flex: 1,
    },
    rangeLabel: {
        fontSize: 13,
        marginBottom: 6,
    },
    numberInput: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
        textAlign: 'center',
    },
    rangeUnit: {
        fontSize: 13,
        marginTop: 6,
        textAlign: 'center',
    },
    rangeSeparator: {
        fontSize: 14,
        fontWeight: '500',
    },
    levelRow: {
        flexDirection: 'row',
        gap: 10,
    },
    levelChip: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
    },
    levelText: {
        fontSize: 14,
        fontWeight: '600',
    },
    dropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    dropdownText: {
        fontSize: 15,
    },
    dropdownList: {
        marginTop: 8,
        borderWidth: 1,
        borderRadius: 12,
        maxHeight: 200,
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    dropdownItemText: {
        fontSize: 15,
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
        padding: 12,
        borderRadius: 10,
        gap: 10,
    },
    listItemText: {
        flex: 1,
        fontSize: 14,
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

export default RequirementsStep;
