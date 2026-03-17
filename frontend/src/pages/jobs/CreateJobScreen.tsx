/**
 * CreateJobScreen
 * Main screen for creating a new job posting with multi-step form
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { JobFormData, JobValidationErrors } from '../../types/job.types';
import { validateJobForm, isStepValid, publishJob, saveDraftJob } from '../../utils/jobCreationUtils';

// Import step components
import BasicInfoStep from '../../components/jobs/BasicInfoStep';
import JobDescriptionStep from '../../components/jobs/JobDescriptionStep';
import RequirementsStep from '../../components/jobs/RequirementsStep';
import CompensationStep from '../../components/jobs/CompensationStep';
import HiringDetailsStep from '../../components/jobs/HiringDetailsStep';
import AdditionalInfoStep from '../../components/jobs/AdditionalInfoStep';
import AIEnhancementsStep from '../../components/jobs/AIEnhancementsStep';

interface Props {
    navigation?: any;
}

const STEPS = [
    { number: 1, title: 'Basic Info', icon: 'information-circle' },
    { number: 2, title: 'Description', icon: 'document-text' },
    { number: 3, title: 'Requirements', icon: 'school' },
    { number: 4, title: 'Compensation', icon: 'cash' },
    { number: 5, title: 'Hiring Details', icon: 'calendar' },
    { number: 6, title: 'Additional Info', icon: 'add-circle' },
    { number: 7, title: 'Review & Publish', icon: 'checkmark-circle' },
];

const CreateJobScreen: React.FC<Props> = ({ navigation }) => {
    const { colors } = useTheme();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<Partial<JobFormData>>({
        // Initialize with defaults
        location: { city: '', state: '', country: '', isRemote: false },
        keyResponsibilities: [],
        requiredSkills: [],
        preferredSkills: [],
        experience: { min: 0, max: 0, level: 'entry' },
        certifications: [],
        languages: [],
        salary: { min: 0, max: 0, currency: 'INR', type: 'yearly', showSalary: true },
        benefits: [],
        customBenefits: [],
        openings: 1,
        hiringUrgency: 'normal',
        interviewProcess: 'online',
        applicationMethod: 'in-app',
        equalOpportunity: false,
        tags: [],
    });
    const [errors, setErrors] = useState<JobValidationErrors>({});
    const [publishing, setPublishing] = useState(false);

    const updateFormData = (data: Partial<JobFormData>) => {
        setFormData(prev => ({ ...prev, ...data }));
    };

    const handleNext = () => {
        // Validate current step
        const stepErrors = validateJobForm(formData, currentStep);
        const stepKey = `step${currentStep}` as keyof JobValidationErrors;

        if (stepErrors[stepKey] && Object.keys(stepErrors[stepKey]!).length > 0) {
            setErrors(stepErrors);
            Alert.alert('Validation Error', 'Please fill in all required fields correctly.');
            return;
        }

        setErrors({});
        if (currentStep < 7) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSaveDraft = () => {
        const draft = saveDraftJob(formData, currentStep);
        Alert.alert('Draft Saved', 'Your job posting has been saved as a draft.');
    };

    const handlePublish = async () => {
        // Validate all steps
        const allErrors = validateJobForm(formData, 7);
        if (Object.keys(allErrors).length > 0) {
            setErrors(allErrors);
            Alert.alert(
                'Incomplete Form',
                'Please complete all required fields before publishing.'
            );
            return;
        }

        setPublishing(true);
        try {
            const result = await publishJob(formData as JobFormData);
            setPublishing(false);

            if (result.success) {
                Alert.alert(
                    'Success!',
                    'Your job has been published successfully.',
                    [
                        {
                            text: 'OK',
                            onPress: () => navigation?.navigate?.('Jobs'),
                        },
                    ]
                );
            } else {
                Alert.alert('Error', result.message);
            }
        } catch (error) {
            setPublishing(false);
            Alert.alert('Error', 'Failed to publish job. Please try again.');
        }
    };

    const renderStepContent = () => {
        const stepKey = `step${currentStep}` as keyof JobValidationErrors;
        const stepErrors = errors[stepKey];

        switch (currentStep) {
            case 1:
                return (
                    <BasicInfoStep
                        formData={formData}
                        onUpdate={updateFormData}
                        errors={stepErrors}
                    />
                );
            case 2:
                return (
                    <JobDescriptionStep
                        formData={formData}
                        onUpdate={updateFormData}
                        errors={stepErrors}
                    />
                );
            case 3:
                return (
                    <RequirementsStep
                        formData={formData}
                        onUpdate={updateFormData}
                        errors={stepErrors}
                    />
                );
            case 4:
                return (
                    <CompensationStep
                        formData={formData}
                        onUpdate={updateFormData}
                        errors={stepErrors}
                    />
                );
            case 5:
                return (
                    <HiringDetailsStep
                        formData={formData}
                        onUpdate={updateFormData}
                        errors={stepErrors}
                    />
                );
            case 6:
                return (
                    <AdditionalInfoStep
                        formData={formData}
                        onUpdate={updateFormData}
                        errors={stepErrors}
                    />
                );
            case 7:
                return (
                    <AIEnhancementsStep
                        formData={formData}
                        onUpdate={updateFormData}
                    />
                );
            default:
                return null;
        }
    };

    const progress = (currentStep / 7) * 100;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <LinearGradient
                colors={[colors.primary, colors.primary + 'DD']}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        onPress={() => {
                            Alert.alert(
                                'Discard Changes?',
                                'Are you sure you want to go back? Your changes will be lost.',
                                [
                                    { text: 'Cancel', style: 'cancel' },
                                    {
                                        text: 'Discard',
                                        style: 'destructive',
                                        onPress: () => navigation?.goBack?.(),
                                    },
                                ]
                            );
                        }}
                        style={styles.backButton}
                    >
                        <Ionicons name="close" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>Create Job</Text>
                        <Text style={styles.headerSubtitle}>
                            Step {currentStep} of {STEPS.length}
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={handleSaveDraft}
                        style={styles.draftButton}
                    >
                        <Ionicons name="bookmark-outline" size={20} color="#FFFFFF" />
                        <Text style={styles.draftButtonText}>Save</Text>
                    </TouchableOpacity>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                        <View
                            style={[
                                styles.progressFill,
                                { width: `${progress}%` },
                            ]}
                        />
                    </View>
                </View>

                {/* Step Title */}
                <View style={styles.stepTitleContainer}>
                    <Ionicons
                        name={STEPS[currentStep - 1].icon as any}
                        size={24}
                        color="#FFFFFF"
                    />
                    <Text style={styles.stepTitle}>
                        {STEPS[currentStep - 1].title}
                    </Text>
                </View>
            </LinearGradient>

            {/* Step Content */}
            <View style={styles.content}>
                {renderStepContent()}
            </View>

            {/* Navigation Buttons */}
            <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
                <TouchableOpacity
                    style={[
                        styles.footerButton,
                        {
                            backgroundColor: currentStep === 1 ? colors.border : colors.surface,
                            borderColor: colors.border,
                        },
                    ]}
                    onPress={handlePrevious}
                    disabled={currentStep === 1}
                >
                    <Ionicons
                        name="arrow-back"
                        size={20}
                        color={currentStep === 1 ? colors.textSecondary : colors.text}
                    />
                    <Text
                        style={[
                            styles.footerButtonText,
                            { color: currentStep === 1 ? colors.textSecondary : colors.text },
                        ]}
                    >
                        Previous
                    </Text>
                </TouchableOpacity>

                {currentStep < 7 ? (
                    <TouchableOpacity
                        style={[styles.footerButton, styles.nextButton, { backgroundColor: colors.primary }]}
                        onPress={handleNext}
                    >
                        <Text style={styles.nextButtonText}>Next</Text>
                        <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={[
                            styles.footerButton,
                            styles.publishButton,
                            { backgroundColor: '#10B981' },
                        ]}
                        onPress={handlePublish}
                        disabled={publishing}
                    >
                        {publishing ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <>
                                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                                <Text style={styles.publishButtonText}>Publish Job</Text>
                            </>
                        )}
                    </TouchableOpacity>
                )}
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
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    headerSubtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 2,
    },
    draftButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    draftButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    progressContainer: {
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    progressBar: {
        height: 6,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 3,
    },
    stepTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 20,
    },
    stepTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    footer: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
        borderTopWidth: 1,
    },
    footerButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
        borderWidth: 1,
    },
    footerButtonText: {
        fontSize: 15,
        fontWeight: '600',
    },
    nextButton: {
        borderWidth: 0,
    },
    nextButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
    publishButton: {
        borderWidth: 0,
    },
    publishButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },
});

export default CreateJobScreen;
