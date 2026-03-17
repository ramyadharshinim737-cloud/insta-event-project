/**
 * CreateResumeScreen
 * Step-by-step resume creation wizard
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
    Modal,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { Experience, Education } from '../../types/resume.types';
import { ExperienceForm, EducationForm, ExperienceCard, EducationCard } from '../../components/resume/ResumeFormComponents';
import { downloadResumePDF } from '../../utils/resumeUtils';
import * as resumeApi from '../../services/resume.api';

interface Props {
    navigation?: any;
}

type Step = 'personal' | 'experience' | 'education' | 'skills' | 'template' | 'review';

const CreateResumeScreen: React.FC<Props> = ({ navigation }) => {
    const { colors } = useTheme();
    const [currentStep, setCurrentStep] = useState<Step>('personal');
    const [saving, setSaving] = useState(false);
    const [resumeData, setResumeData] = useState<any>({
        title: '',
        personalInfo: {
            name: '',
            email: '',
            phone: '',
            location: '',
            summary: '',
        },
        experience: [] as Experience[],
        education: [] as Education[],
        skills: [] as string[],
        template: 'professional',
    });

    // Modal states
    const [showExperienceModal, setShowExperienceModal] = useState(false);
    const [showEducationModal, setShowEducationModal] = useState(false);
    const [editingExperience, setEditingExperience] = useState<Experience | undefined>();
    const [editingEducation, setEditingEducation] = useState<Education | undefined>();
    const [skillInput, setSkillInput] = useState('');

    const steps: { id: Step; label: string; icon: string }[] = [
        { id: 'personal', label: 'Personal Info', icon: 'person' },
        { id: 'experience', label: 'Experience', icon: 'briefcase' },
        { id: 'education', label: 'Education', icon: 'school' },
        { id: 'skills', label: 'Skills', icon: 'code-slash' },
        { id: 'template', label: 'Template', icon: 'color-palette' },
        { id: 'review', label: 'Review', icon: 'checkmark-circle' },
    ];

    const currentStepIndex = steps.findIndex((s) => s.id === currentStep);
    const progress = ((currentStepIndex + 1) / steps.length) * 100;

    const handleNext = () => {
        if (currentStepIndex < steps.length - 1) {
            setCurrentStep(steps[currentStepIndex + 1].id);
        } else {
            handleSave();
        }
    };

    const handleBack = () => {
        if (currentStepIndex > 0) {
            setCurrentStep(steps[currentStepIndex - 1].id);
        } else {
            navigation?.goBack?.();
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            // Validate required fields
            if (!resumeData.title || resumeData.title.trim() === '') {
                Alert.alert('Error', 'Please enter a resume title');
                setSaving(false);
                return;
            }

            if (!resumeData.personalInfo?.name || resumeData.personalInfo.name.trim() === '') {
                Alert.alert('Error', 'Please enter your full name');
                setSaving(false);
                return;
            }

            if (!resumeData.personalInfo?.email || resumeData.personalInfo.email.trim() === '') {
                Alert.alert('Error', 'Please enter your email');
                setSaving(false);
                return;
            }

            // Prepare data for API
            const resumePayload = {
                title: resumeData.title,
                personalInfo: {
                    fullName: resumeData.personalInfo.name,
                    email: resumeData.personalInfo.email,
                    phone: resumeData.personalInfo.phone || '',
                    location: resumeData.personalInfo.location || '',
                    linkedin: resumeData.personalInfo.linkedin || '',
                    portfolio: resumeData.personalInfo.portfolio || '',
                },
                summary: resumeData.personalInfo.summary || '',
                experience: resumeData.experience.map((exp: Experience) => ({
                    company: exp.company,
                    position: exp.role,
                    location: exp.location,
                    startDate: exp.startDate,
                    endDate: exp.endDate,
                    current: exp.current,
                    description: exp.description?.join('\n') || '',
                    achievements: exp.achievements || []
                })),
                education: resumeData.education.map((edu: Education) => ({
                    institution: edu.institution,
                    degree: edu.degree,
                    field: edu.field,
                    location: edu.location,
                    startDate: edu.startDate,
                    endDate: edu.endDate,
                    current: edu.current,
                    gpa: edu.gpa
                })),
                skills: resumeData.skills,
                isPublic: false
            };

            console.log('💾 Saving resume:', resumePayload);

            // Save to backend
            const savedResume = await resumeApi.createResume(resumePayload);
            
            console.log('✅ Resume saved successfully:', savedResume._id);

            setSaving(false);

            Alert.alert(
                'Resume Created!',
                'Your resume has been created successfully.',
                [
                    {
                        text: 'Download PDF',
                        onPress: async () => {
                            const success = await downloadResumePDF(resumeData, resumeData.template);
                            if (success) {
                                Alert.alert('Success', 'Resume downloaded successfully!');
                            }
                            navigation?.navigate?.('ResumeBuilder');
                        },
                    },
                    {
                        text: 'View Resume',
                        onPress: () => navigation?.navigate?.('ResumeBuilder'),
                    },
                ]
            );
        } catch (error: any) {
            console.error('❌ Failed to save resume:', error);
            setSaving(false);
            Alert.alert('Error', error.message || 'Failed to save resume. Please try again.');
        }
    };

    // Experience handlers
    const handleAddExperience = () => {
        setEditingExperience(undefined);
        setShowExperienceModal(true);
    };

    const handleEditExperience = (experience: Experience) => {
        setEditingExperience(experience);
        setShowExperienceModal(true);
    };

    const handleSaveExperience = (experience: Experience) => {
        if (editingExperience) {
            setResumeData({
                ...resumeData,
                experience: resumeData.experience.map((exp: Experience) =>
                    exp.id === experience.id ? experience : exp
                ),
            });
        } else {
            setResumeData({
                ...resumeData,
                experience: [...resumeData.experience, experience],
            });
        }
        setShowExperienceModal(false);
        setEditingExperience(undefined);
    };

    const handleDeleteExperience = (id: string) => {
        Alert.alert(
            'Delete Experience',
            'Are you sure you want to delete this experience?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        setResumeData({
                            ...resumeData,
                            experience: resumeData.experience.filter((exp: Experience) => exp.id !== id),
                        });
                    },
                },
            ]
        );
    };

    // Education handlers
    const handleAddEducation = () => {
        setEditingEducation(undefined);
        setShowEducationModal(true);
    };

    const handleEditEducation = (education: Education) => {
        setEditingEducation(education);
        setShowEducationModal(true);
    };

    const handleSaveEducation = (education: Education) => {
        if (editingEducation) {
            setResumeData({
                ...resumeData,
                education: resumeData.education.map((edu: Education) =>
                    edu.id === education.id ? education : edu
                ),
            });
        } else {
            setResumeData({
                ...resumeData,
                education: [...resumeData.education, education],
            });
        }
        setShowEducationModal(false);
        setEditingEducation(undefined);
    };

    const handleDeleteEducation = (id: string) => {
        Alert.alert(
            'Delete Education',
            'Are you sure you want to delete this education?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        setResumeData({
                            ...resumeData,
                            education: resumeData.education.filter((edu: Education) => edu.id !== id),
                        });
                    },
                },
            ]
        );
    };

    // Skills handlers
    const handleAddSkill = () => {
        if (skillInput.trim()) {
            setResumeData({
                ...resumeData,
                skills: [...resumeData.skills, skillInput.trim()],
            });
            setSkillInput('');
        }
    };

    const handleRemoveSkill = (skill: string) => {
        setResumeData({
            ...resumeData,
            skills: resumeData.skills.filter((s: string) => s !== skill),
        });
    };

    const handleDownloadPDF = async () => {
        const success = await downloadResumePDF(resumeData, resumeData.template);
        if (success) {
            Alert.alert('Success', 'Resume PDF generated and ready to share!');
        } else {
            Alert.alert('Error', 'Failed to generate PDF. Please try again.');
        }
    };

    const renderPersonalInfo = () => (
        <View style={styles.formSection}>
            <Text style={[styles.formTitle, { color: colors.text }]}>Personal Information</Text>

            <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Resume Title *</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                    placeholder="e.g., Software Engineer Resume"
                    placeholderTextColor={colors.textTertiary}
                    value={resumeData.title}
                    onChangeText={(text) => setResumeData({ ...resumeData, title: text })}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Full Name *</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                    placeholder="John Doe"
                    placeholderTextColor={colors.textTertiary}
                    value={resumeData.personalInfo.name}
                    onChangeText={(text) =>
                        setResumeData({
                            ...resumeData,
                            personalInfo: { ...resumeData.personalInfo, name: text },
                        })
                    }
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Email *</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                    placeholder="john@example.com"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="email-address"
                    value={resumeData.personalInfo.email}
                    onChangeText={(text) =>
                        setResumeData({
                            ...resumeData,
                            personalInfo: { ...resumeData.personalInfo, email: text },
                        })
                    }
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Phone *</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                    placeholder="+91 98765 43210"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="phone-pad"
                    value={resumeData.personalInfo.phone}
                    onChangeText={(text) =>
                        setResumeData({
                            ...resumeData,
                            personalInfo: { ...resumeData.personalInfo, phone: text },
                        })
                    }
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Location *</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                    placeholder="Bengaluru, Karnataka"
                    placeholderTextColor={colors.textTertiary}
                    value={resumeData.personalInfo.location}
                    onChangeText={(text) =>
                        setResumeData({
                            ...resumeData,
                            personalInfo: { ...resumeData.personalInfo, location: text },
                        })
                    }
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Professional Summary</Text>
                <TextInput
                    style={[styles.textArea, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                    placeholder="Brief summary of your professional background..."
                    placeholderTextColor={colors.textTertiary}
                    multiline
                    numberOfLines={4}
                    value={resumeData.personalInfo.summary}
                    onChangeText={(text) =>
                        setResumeData({
                            ...resumeData,
                            personalInfo: { ...resumeData.personalInfo, summary: text },
                        })
                    }
                />
                <TouchableOpacity style={styles.aiButton}>
                    <Ionicons name="sparkles" size={16} color="#10B981" />
                    <Text style={styles.aiButtonText}>Generate with AI</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderExperience = () => (
        <View style={styles.formSection}>
            <Text style={[styles.formTitle, { color: colors.text }]}>Work Experience</Text>
            <Text style={[styles.formHint, { color: colors.textSecondary }]}>
                Add your work experience starting with the most recent
            </Text>

            <TouchableOpacity
                style={[styles.addButton, { backgroundColor: colors.primary }]}
                activeOpacity={0.8}
                onPress={handleAddExperience}
            >
                <Ionicons name="add-circle" size={24} color="#FFFFFF" />
                <Text style={styles.addButtonText}>Add Experience</Text>
            </TouchableOpacity>

            {resumeData.experience.length > 0 ? (
                <View>
                    {resumeData.experience.map((exp: Experience) => (
                        <ExperienceCard
                            key={exp.id}
                            experience={exp}
                            onEdit={handleEditExperience}
                            onDelete={handleDeleteExperience}
                        />
                    ))}
                </View>
            ) : (
                <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
                    <Ionicons name="briefcase-outline" size={48} color={colors.textSecondary} />
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                        No experience added yet
                    </Text>
                </View>
            )}
        </View>
    );

    const renderEducation = () => (
        <View style={styles.formSection}>
            <Text style={[styles.formTitle, { color: colors.text }]}>Education</Text>
            <Text style={[styles.formHint, { color: colors.textSecondary }]}>
                Add your educational qualifications
            </Text>

            <TouchableOpacity
                style={[styles.addButton, { backgroundColor: colors.primary }]}
                activeOpacity={0.8}
                onPress={handleAddEducation}
            >
                <Ionicons name="add-circle" size={24} color="#FFFFFF" />
                <Text style={styles.addButtonText}>Add Education</Text>
            </TouchableOpacity>

            {resumeData.education.length > 0 ? (
                <View>
                    {resumeData.education.map((edu: Education) => (
                        <EducationCard
                            key={edu.id}
                            education={edu}
                            onEdit={handleEditEducation}
                            onDelete={handleDeleteEducation}
                        />
                    ))}
                </View>
            ) : (
                <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
                    <Ionicons name="school-outline" size={48} color={colors.textSecondary} />
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                        No education added yet
                    </Text>
                </View>
            )}
        </View>
    );

    const renderSkills = () => (
        <View style={styles.formSection}>
            <Text style={[styles.formTitle, { color: colors.text }]}>Skills</Text>
            <Text style={[styles.formHint, { color: colors.textSecondary }]}>
                Add your technical and soft skills
            </Text>

            <View style={styles.inputGroup}>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border, flex: 1 }]}
                        placeholder="Type a skill..."
                        placeholderTextColor={colors.textTertiary}
                        value={skillInput}
                        onChangeText={setSkillInput}
                        onSubmitEditing={handleAddSkill}
                    />
                    <TouchableOpacity
                        style={[styles.addSkillButton, { backgroundColor: colors.primary }]}
                        onPress={handleAddSkill}
                    >
                        <Ionicons name="add" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </View>

            {resumeData.skills.length > 0 && (
                <View style={styles.skillTags}>
                    {resumeData.skills.map((skill: string, index: number) => (
                        <TouchableOpacity
                            key={index}
                            style={[styles.skillTag, { backgroundColor: colors.primary + '20', borderColor: colors.primary }]}
                            onPress={() => handleRemoveSkill(skill)}
                        >
                            <Text style={[styles.skillTagText, { color: colors.primary }]}>{skill}</Text>
                            <Ionicons name="close" size={16} color={colors.primary} />
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            <View style={styles.skillSuggestions}>
                <Text style={[styles.suggestionsLabel, { color: colors.textSecondary }]}>
                    Popular Skills:
                </Text>
                <View style={styles.skillTags}>
                    {['React', 'Node.js', 'Python', 'AWS', 'TypeScript', 'MongoDB'].map((skill) => (
                        <TouchableOpacity
                            key={skill}
                            style={[styles.skillTag, { backgroundColor: colors.surface, borderColor: colors.border }]}
                            onPress={() => {
                                if (!resumeData.skills.includes(skill)) {
                                    setResumeData({ ...resumeData, skills: [...resumeData.skills, skill] });
                                }
                            }}
                        >
                            <Text style={[styles.skillTagText, { color: colors.text }]}>{skill}</Text>
                            <Ionicons name="add" size={16} color={colors.primary} />
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </View>
    );

    const renderTemplate = () => (
        <View style={styles.formSection}>
            <Text style={[styles.formTitle, { color: colors.text }]}>Choose Template</Text>
            <Text style={[styles.formHint, { color: colors.textSecondary }]}>
                Select a template that best suits your industry
            </Text>

            <View style={styles.templatesGrid}>
                {[
                    { id: 'professional', name: 'Professional', color: '#2563EB' },
                    { id: 'modern', name: 'Modern', color: '#10B981' },
                    { id: 'minimal', name: 'Minimal', color: '#6B7280' },
                    { id: 'creative', name: 'Creative', color: '#8B5CF6' },
                ].map((template) => (
                    <TouchableOpacity
                        key={template.id}
                        style={[
                            styles.templateCard,
                            { backgroundColor: colors.surface, borderColor: resumeData.template === template.id ? colors.primary : colors.border },
                        ]}
                        onPress={() => setResumeData({ ...resumeData, template: template.id })}
                    >
                        <View style={[styles.templatePreview, { backgroundColor: template.color + '20' }]}>
                            <Ionicons name="document-text" size={40} color={template.color} />
                        </View>
                        <Text style={[styles.templateName, { color: colors.text }]}>{template.name}</Text>
                        {resumeData.template === template.id && (
                            <Ionicons name="checkmark-circle" size={20} color={colors.primary} style={styles.templateCheck} />
                        )}
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    const renderReview = () => (
        <View style={styles.formSection}>
            <Text style={[styles.formTitle, { color: colors.text }]}>Review & Create</Text>
            <Text style={[styles.formHint, { color: colors.textSecondary }]}>
                Review your information before creating the resume
            </Text>

            <View style={[styles.reviewCard, { backgroundColor: colors.surface }]}>
                <View style={styles.reviewItem}>
                    <Ionicons name="person" size={20} color={colors.primary} />
                    <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Name:</Text>
                    <Text style={[styles.reviewValue, { color: colors.text }]}>
                        {resumeData.personalInfo.name || 'Not provided'}
                    </Text>
                </View>
                <View style={styles.reviewItem}>
                    <Ionicons name="mail" size={20} color={colors.primary} />
                    <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Email:</Text>
                    <Text style={[styles.reviewValue, { color: colors.text }]}>
                        {resumeData.personalInfo.email || 'Not provided'}
                    </Text>
                </View>
                <View style={styles.reviewItem}>
                    <Ionicons name="briefcase" size={20} color={colors.primary} />
                    <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Experience:</Text>
                    <Text style={[styles.reviewValue, { color: colors.text }]}>
                        {resumeData.experience.length} {resumeData.experience.length === 1 ? 'entry' : 'entries'}
                    </Text>
                </View>
                <View style={styles.reviewItem}>
                    <Ionicons name="school" size={20} color={colors.primary} />
                    <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Education:</Text>
                    <Text style={[styles.reviewValue, { color: colors.text }]}>
                        {resumeData.education.length} {resumeData.education.length === 1 ? 'entry' : 'entries'}
                    </Text>
                </View>
                <View style={styles.reviewItem}>
                    <Ionicons name="code-slash" size={20} color={colors.primary} />
                    <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Skills:</Text>
                    <Text style={[styles.reviewValue, { color: colors.text }]}>
                        {resumeData.skills.length} skills
                    </Text>
                </View>
                <View style={styles.reviewItem}>
                    <Ionicons name="color-palette" size={20} color={colors.primary} />
                    <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Template:</Text>
                    <Text style={[styles.reviewValue, { color: colors.text }]}>
                        {resumeData.template}
                    </Text>
                </View>
            </View>

            <TouchableOpacity
                style={[styles.downloadButton, { backgroundColor: colors.primary }]}
                onPress={handleDownloadPDF}
            >
                <Ionicons name="download" size={20} color="#FFFFFF" />
                <Text style={styles.downloadButtonText}>Download Resume PDF</Text>
            </TouchableOpacity>

            <View style={[styles.aiPreview, { backgroundColor: '#10B98120' }]}>
                <Ionicons name="sparkles" size={24} color="#10B981" />
                <View style={styles.aiPreviewText}>
                    <Text style={[styles.aiPreviewTitle, { color: colors.text }]}>Ready to Download</Text>
                    <Text style={[styles.aiPreviewHint, { color: colors.textSecondary }]}>
                        Your resume is ready to be downloaded as a PDF
                    </Text>
                </View>
            </View>
        </View>
    );

    const renderCurrentStep = () => {
        switch (currentStep) {
            case 'personal':
                return renderPersonalInfo();
            case 'experience':
                return renderExperience();
            case 'education':
                return renderEducation();
            case 'skills':
                return renderSkills();
            case 'template':
                return renderTemplate();
            case 'review':
                return renderReview();
            default:
                return null;
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <LinearGradient colors={['#10B981', '#059669']} style={styles.header}>
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Create Resume</Text>
                    <TouchableOpacity style={styles.headerButton}>
                        <Ionicons name="help-circle-outline" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>

                {/* Progress */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${progress}%` }]} />
                    </View>
                    <Text style={styles.progressText}>
                        Step {currentStepIndex + 1} of {steps.length}
                    </Text>
                </View>
            </LinearGradient>

            {/* Steps */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.stepsContainer}
            >
                {steps.map((step, index) => (
                    <TouchableOpacity
                        key={step.id}
                        style={[
                            styles.stepChip,
                            {
                                backgroundColor: index <= currentStepIndex ? colors.primary : colors.surface,
                                borderColor: index <= currentStepIndex ? colors.primary : colors.border,
                            },
                        ]}
                        onPress={() => setCurrentStep(step.id)}
                    >
                        <Ionicons
                            name={step.icon as any}
                            size={16}
                            color={index <= currentStepIndex ? '#FFFFFF' : colors.textSecondary}
                        />
                        <Text
                            style={[
                                styles.stepChipText,
                                { color: index <= currentStepIndex ? '#FFFFFF' : colors.textSecondary },
                            ]}
                        >
                            {step.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Content */}
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {renderCurrentStep()}
                <View style={styles.bottomSpacing} />
            </ScrollView>

            {/* Bottom Actions */}
            <View style={[styles.bottomBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
                {currentStepIndex > 0 && (
                    <TouchableOpacity
                        style={[styles.secondaryButton, { borderColor: colors.border }]}
                        onPress={handleBack}
                    >
                        <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Back</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    style={[
                        styles.primaryButton, 
                        { backgroundColor: colors.primary },
                        saving && styles.buttonDisabled
                    ]}
                    onPress={handleNext}
                    disabled={saving}
                >
                    {saving ? (
                        <>
                            <ActivityIndicator size="small" color="#FFFFFF" />
                            <Text style={[styles.primaryButtonText, { marginLeft: 8 }]}>
                                Saving...
                            </Text>
                        </>
                    ) : (
                        <>
                            <Text style={styles.primaryButtonText}>
                                {currentStepIndex === steps.length - 1 ? 'Create Resume' : 'Next'}
                            </Text>
                            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                        </>
                    )}
                </TouchableOpacity>
            </View>

            {/* Experience Modal */}
            <Modal
                visible={showExperienceModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowExperienceModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <ExperienceForm
                                onSave={handleSaveExperience}
                                onCancel={() => setShowExperienceModal(false)}
                                initialData={editingExperience}
                            />
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Education Modal */}
            <Modal
                visible={showEducationModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowEducationModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <EducationForm
                                onSave={handleSaveEducation}
                                onCancel={() => setShowEducationModal(false)}
                                initialData={editingEducation}
                            />
                        </ScrollView>
                    </View>
                </View>
            </Modal>
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
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 16,
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
    headerButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressContainer: {
        paddingHorizontal: 20,
    },
    progressBar: {
        height: 6,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 3,
    },
    progressText: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.9)',
        textAlign: 'center',
        fontWeight: '600',
    },
    stepsContainer: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        gap: 6,
    },
    stepChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
        gap: 6,
        minHeight: 32,
    },
    stepChipText: {
        fontSize: 13,
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },
    formSection: {
        padding: 20,
    },
    formTitle: {
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 6,
    },
    formHint: {
        fontSize: 13,
        marginBottom: 18,
        lineHeight: 18,
    },
    inputGroup: {
        marginBottom: 14,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 6,
    },
    input: {
        paddingHorizontal: 14,
        paddingVertical: 11,
        borderRadius: 10,
        fontSize: 14,
        borderWidth: 1.5,
    },
    textArea: {
        paddingHorizontal: 14,
        paddingVertical: 11,
        borderRadius: 10,
        fontSize: 14,
        borderWidth: 1.5,
        minHeight: 85,
        textAlignVertical: 'top',
    },
    aiButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 8,
    },
    aiButtonText: {
        fontSize: 13,
        color: '#10B981',
        fontWeight: '600',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        borderRadius: 10,
        marginBottom: 14,
    },
    addButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 30,
        borderRadius: 12,
    },
    emptyText: {
        fontSize: 13,
        marginTop: 10,
    },
    skillSuggestions: {
        marginTop: 20,
    },
    suggestionsLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 12,
    },
    skillTags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    skillTag: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1.5,
        gap: 6,
    },
    skillTagText: {
        fontSize: 13,
        fontWeight: '600',
    },
    templatesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    templateCard: {
        width: '47%',
        padding: 12,
        borderRadius: 12,
        borderWidth: 2,
        position: 'relative',
    },
    templatePreview: {
        height: 95,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    templateName: {
        fontSize: 14,
        fontWeight: '700',
        textAlign: 'center',
    },
    templateCheck: {
        position: 'absolute',
        top: 10,
        right: 10,
    },
    reviewCard: {
        padding: 14,
        borderRadius: 12,
        marginBottom: 16,
    },
    reviewItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 12,
    },
    reviewLabel: {
        fontSize: 13,
        fontWeight: '600',
    },
    reviewValue: {
        fontSize: 13,
        flex: 1,
    },
    aiPreview: {
        flexDirection: 'row',
        padding: 14,
        borderRadius: 12,
        gap: 10,
    },
    aiPreviewText: {
        flex: 1,
    },
    aiPreviewTitle: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 3,
    },
    aiPreviewHint: {
        fontSize: 12,
        lineHeight: 17,
    },
    bottomSpacing: {
        height: 80,
    },
    bottomBar: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
        borderTopWidth: 1,
    },
    secondaryButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryButtonText: {
        fontSize: 15,
        fontWeight: '600',
    },
    primaryButton: {
        flex: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 12,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    primaryButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    addSkillButton: {
        width: 48,
        height: 48,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    downloadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 14,
        borderRadius: 12,
        marginBottom: 16,
    },
    downloadButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '90%',
    },
});

export default CreateResumeScreen;
