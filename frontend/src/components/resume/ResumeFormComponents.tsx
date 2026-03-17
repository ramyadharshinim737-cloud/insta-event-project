/**
 * Resume Form Components
 * Reusable form components for resume creation
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Experience, Education, Skill } from '../../types/resume.types';
import { Row, Column, Card, Spacer, SPACING, RADIUS } from '../layout/LayoutComponents';

// Experience Form Component
interface ExperienceFormProps {
    onSave: (experience: Experience) => void;
    onCancel: () => void;
    initialData?: Experience;
}

export const ExperienceForm: React.FC<ExperienceFormProps> = ({
    onSave,
    onCancel,
    initialData,
}) => {
    const { colors } = useTheme();
    const [formData, setFormData] = useState<Partial<Experience>>(
        initialData || {
            id: '',
            company: '',
            role: '',
            location: '',
            startDate: '',
            endDate: '',
            current: false,
            description: [],
            achievements: [],
        }
    );

    const handleSave = () => {
        if (!formData.company || !formData.role || !formData.startDate) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }
        const experienceData = {
            ...formData,
            id: formData.id || Date.now().toString(),
        } as Experience;
        onSave(experienceData);
    };

    return (
        <Card style={{ backgroundColor: colors.surface }}>
            <Column gap="md">
                <Text style={[styles.formTitle, { color: colors.text }]}>
                    {initialData ? 'Edit Experience' : 'Add Experience'}
                </Text>

                <View>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>Company *</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                        placeholder="e.g., Google"
                        placeholderTextColor={colors.textTertiary}
                        value={formData.company}
                        onChangeText={(text) => setFormData({ ...formData, company: text })}
                    />
                </View>

                <View>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>Role/Position *</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                        placeholder="e.g., Senior Software Engineer"
                        placeholderTextColor={colors.textTertiary}
                        value={formData.role}
                        onChangeText={(text) => setFormData({ ...formData, role: text })}
                    />
                </View>

                <View>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>Location</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                        placeholder="e.g., Bengaluru, India"
                        placeholderTextColor={colors.textTertiary}
                        value={formData.location}
                        onChangeText={(text) => setFormData({ ...formData, location: text })}
                    />
                </View>

                <Row gap="md">
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Start Date *</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                            placeholder="MM/YYYY"
                            placeholderTextColor={colors.textTertiary}
                            value={formData.startDate}
                            onChangeText={(text) => setFormData({ ...formData, startDate: text })}
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>End Date</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                            placeholder="MM/YYYY"
                            placeholderTextColor={colors.textTertiary}
                            value={formData.endDate}
                            onChangeText={(text) => setFormData({ ...formData, endDate: text })}
                            editable={!formData.current}
                        />
                    </View>
                </Row>

                <TouchableOpacity
                    style={styles.checkboxRow}
                    onPress={() => setFormData({ ...formData, current: !formData.current })}
                >
                    <Ionicons
                        name={formData.current ? 'checkbox' : 'square-outline'}
                        size={24}
                        color={colors.primary}
                    />
                    <Text style={[styles.checkboxLabel, { color: colors.text }]}>
                        I currently work here
                    </Text>
                </TouchableOpacity>

                <View>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>Description</Text>
                    <TextInput
                        style={[styles.textArea, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                        placeholder="Describe your role and responsibilities..."
                        placeholderTextColor={colors.textTertiary}
                        multiline
                        numberOfLines={4}
                        value={Array.isArray(formData.description) ? formData.description.join('\n') : (formData.description as any) || ''}
                        onChangeText={(text) => setFormData({ ...formData, description: [text] })}
                    />
                </View>

                <Row gap="md">
                    <TouchableOpacity
                        style={[styles.button, styles.cancelButton, { borderColor: colors.border }]}
                        onPress={onCancel}
                    >
                        <Text style={[styles.buttonText, { color: colors.text }]}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.button, styles.saveButton, { backgroundColor: colors.primary }]}
                        onPress={handleSave}
                    >
                        <Text style={styles.saveButtonText}>Save</Text>
                    </TouchableOpacity>
                </Row>
            </Column>
        </Card>
    );
};

// Education Form Component
interface EducationFormProps {
    onSave: (education: Education) => void;
    onCancel: () => void;
    initialData?: Education;
}

export const EducationForm: React.FC<EducationFormProps> = ({
    onSave,
    onCancel,
    initialData,
}) => {
    const { colors } = useTheme();
    const [formData, setFormData] = useState<Partial<Education>>(
        initialData || {
            id: '',
            institution: '',
            degree: '',
            field: '',
            location: '',
            startDate: '',
            endDate: '',
            gpa: '',
            current: false,
            achievements: [],
        }
    );

    const handleSave = () => {
        if (!formData.institution || !formData.degree || !formData.field) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }
        const educationData = {
            ...formData,
            id: formData.id || Date.now().toString(),
        } as Education;
        onSave(educationData);
    };

    return (
        <Card style={{ backgroundColor: colors.surface }}>
            <Column gap="md">
                <Text style={[styles.formTitle, { color: colors.text }]}>
                    {initialData ? 'Edit Education' : 'Add Education'}
                </Text>

                <View>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>Institution *</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                        placeholder="e.g., Stanford University"
                        placeholderTextColor={colors.textTertiary}
                        value={formData.institution}
                        onChangeText={(text) => setFormData({ ...formData, institution: text })}
                    />
                </View>

                <View>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>Degree *</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                        placeholder="e.g., Bachelor of Science"
                        placeholderTextColor={colors.textTertiary}
                        value={formData.degree}
                        onChangeText={(text) => setFormData({ ...formData, degree: text })}
                    />
                </View>

                <View>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>Field of Study *</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                        placeholder="e.g., Computer Science"
                        placeholderTextColor={colors.textTertiary}
                        value={formData.field}
                        onChangeText={(text) => setFormData({ ...formData, field: text })}
                    />
                </View>

                <Row gap="md">
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Start Year</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                            placeholder="YYYY"
                            placeholderTextColor={colors.textTertiary}
                            value={formData.startDate}
                            onChangeText={(text) => setFormData({ ...formData, startDate: text })}
                            keyboardType="numeric"
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>End Year</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                            placeholder="YYYY"
                            placeholderTextColor={colors.textTertiary}
                            value={formData.endDate}
                            onChangeText={(text) => setFormData({ ...formData, endDate: text })}
                            keyboardType="numeric"
                            editable={!formData.current}
                        />
                    </View>
                </Row>

                <TouchableOpacity
                    style={styles.checkboxRow}
                    onPress={() => setFormData({ ...formData, current: !formData.current })}
                >
                    <Ionicons
                        name={formData.current ? 'checkbox' : 'square-outline'}
                        size={24}
                        color={colors.primary}
                    />
                    <Text style={[styles.checkboxLabel, { color: colors.text }]}>
                        I currently study here
                    </Text>
                </TouchableOpacity>

                <View>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>Grade/GPA</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                        placeholder="e.g., 3.8/4.0"
                        placeholderTextColor={colors.textTertiary}
                        value={formData.gpa}
                        onChangeText={(text) => setFormData({ ...formData, gpa: text })}
                    />
                </View>

                <Row gap="md">
                    <TouchableOpacity
                        style={[styles.button, styles.cancelButton, { borderColor: colors.border }]}
                        onPress={onCancel}
                    >
                        <Text style={[styles.buttonText, { color: colors.text }]}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.button, styles.saveButton, { backgroundColor: colors.primary }]}
                        onPress={handleSave}
                    >
                        <Text style={styles.saveButtonText}>Save</Text>
                    </TouchableOpacity>
                </Row>
            </Column>
        </Card>
    );
};

// Experience Card Component
interface ExperienceCardProps {
    experience: Experience;
    onEdit: (experience: Experience) => void;
    onDelete: (id: string) => void;
}

export const ExperienceCard: React.FC<ExperienceCardProps> = ({ experience, onEdit, onDelete }) => {
    const { colors } = useTheme();

    return (
        <Card style={{ backgroundColor: colors.surface, marginBottom: 12 }}>
            <Column gap="sm">
                <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.cardTitle, { color: colors.text }]}>{experience.role}</Text>
                        <Text style={[styles.cardSubtitle, { color: colors.primary }]}>{experience.company}</Text>
                        {experience.location && (
                            <Text style={[styles.cardDetail, { color: colors.textSecondary }]}>
                                {experience.location}
                            </Text>
                        )}
                    </View>
                    <Row gap="sm">
                        <TouchableOpacity onPress={() => onEdit(experience)} style={styles.iconButton}>
                            <Ionicons name="pencil" size={18} color={colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => onDelete(experience.id)} style={styles.iconButton}>
                            <Ionicons name="trash-outline" size={18} color="#EF4444" />
                        </TouchableOpacity>
                    </Row>
                </Row>
                <Text style={[styles.cardDate, { color: colors.textSecondary }]}>
                    {experience.startDate} - {experience.current ? 'Present' : experience.endDate}
                </Text>
                {experience.description && experience.description.length > 0 && (
                    <Text style={[styles.cardDescription, { color: colors.textSecondary }]} numberOfLines={2}>
                        {Array.isArray(experience.description) ? experience.description.join(' ') : experience.description}
                    </Text>
                )}
            </Column>
        </Card>
    );
};

// Education Card Component
interface EducationCardProps {
    education: Education;
    onEdit: (education: Education) => void;
    onDelete: (id: string) => void;
}

export const EducationCard: React.FC<EducationCardProps> = ({ education, onEdit, onDelete }) => {
    const { colors } = useTheme();

    return (
        <Card style={{ backgroundColor: colors.surface, marginBottom: 12 }}>
            <Column gap="sm">
                <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.cardTitle, { color: colors.text }]}>{education.degree}</Text>
                        <Text style={[styles.cardSubtitle, { color: colors.primary }]}>{education.institution}</Text>
                        {education.field && (
                            <Text style={[styles.cardDetail, { color: colors.textSecondary }]}>
                                {education.field}
                            </Text>
                        )}
                    </View>
                    <Row gap="sm">
                        <TouchableOpacity onPress={() => onEdit(education)} style={styles.iconButton}>
                            <Ionicons name="pencil" size={18} color={colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => onDelete(education.id)} style={styles.iconButton}>
                            <Ionicons name="trash-outline" size={18} color="#EF4444" />
                        </TouchableOpacity>
                    </Row>
                </Row>
                <Text style={[styles.cardDate, { color: colors.textSecondary }]}>
                    {education.startDate} - {education.current ? 'Present' : education.endDate}
                </Text>
                {education.gpa && (
                    <Text style={[styles.cardDetail, { color: colors.textSecondary }]}>
                        GPA: {education.gpa}
                    </Text>
                )}
            </Column>
        </Card>
    );
};

const styles = StyleSheet.create({
    formTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 8,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 6,
    },
    input: {
        paddingHorizontal: 14,
        paddingVertical: 11,
        borderRadius: RADIUS.md,
        fontSize: 14,
        borderWidth: 1.5,
    },
    textArea: {
        paddingHorizontal: 14,
        paddingVertical: 11,
        borderRadius: RADIUS.md,
        fontSize: 14,
        borderWidth: 1.5,
        minHeight: 85,
        textAlignVertical: 'top',
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    checkboxLabel: {
        fontSize: 14,
        fontWeight: '500',
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        borderWidth: 1.5,
    },
    saveButton: {},
    buttonText: {
        fontSize: 15,
        fontWeight: '600',
    },
    saveButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 3,
    },
    cardSubtitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 2,
    },
    cardDetail: {
        fontSize: 12,
        marginTop: 2,
    },
    cardDate: {
        fontSize: 12,
        fontStyle: 'italic',
    },
    cardDescription: {
        fontSize: 12,
        lineHeight: 18,
    },
    iconButton: {
        padding: 6,
    },
});
