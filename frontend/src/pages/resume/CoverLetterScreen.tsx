/**
 * CoverLetterScreen
 * AI-powered cover letter generator
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';

interface Props {
    navigation?: any;
    route?: any;
}

const CoverLetterScreen: React.FC<Props> = ({ navigation, route }) => {
    const { colors } = useTheme();
    const [jobTitle, setJobTitle] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [generatedLetter, setGeneratedLetter] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = () => {
        if (!jobTitle || !companyName) {
            Alert.alert('Missing Information', 'Please provide job title and company name');
            return;
        }

        setIsGenerating(true);
        // Simulate AI generation
        setTimeout(() => {
            const letter = `Dear Hiring Manager,

I am writing to express my strong interest in the ${jobTitle} position at ${companyName}. With my background in software development and proven track record of delivering high-quality solutions, I am excited about the opportunity to contribute to your team.

Throughout my career, I have developed expertise in full-stack development, working with modern technologies and frameworks. My experience aligns well with the requirements for this role, and I am particularly drawn to ${companyName}'s commitment to innovation and excellence.

In my current role, I have successfully led multiple projects from conception to deployment, consistently delivering results that exceed expectations. I am confident that my technical skills, combined with my passion for creating impactful solutions, make me an ideal candidate for this position.

I would welcome the opportunity to discuss how my background and skills can contribute to ${companyName}'s continued success. Thank you for considering my application.

Best regards,
[Your Name]`;

            setGeneratedLetter(letter);
            setIsGenerating(false);
        }, 2000);
    };

    const handleCopy = async () => {
        if (!generatedLetter) {
            Alert.alert('No Content', 'Please generate a cover letter first');
            return;
        }
        
        try {
            await Clipboard.setStringAsync(generatedLetter);
            Alert.alert('Copied!', 'Cover letter copied to clipboard');
        } catch (error) {
            Alert.alert('Error', 'Failed to copy to clipboard');
        }
    };

    const handleSave = async () => {
        if (!generatedLetter) {
            Alert.alert('No Content', 'Please generate a cover letter first');
            return;
        }

        try {
            // Create filename
            const filename = `CoverLetter_${companyName.replace(/\s+/g, '_')}_${Date.now()}.txt`;
            const fileUri = FileSystem.documentDirectory + filename;

            // Save to file
            await FileSystem.writeAsStringAsync(fileUri, generatedLetter);

            // Check if sharing is available
            const isAvailable = await Sharing.isAvailableAsync();
            
            if (isAvailable) {
                await Sharing.shareAsync(fileUri, {
                    mimeType: 'text/plain',
                    dialogTitle: 'Export Cover Letter',
                });
                Alert.alert('Success', 'Cover letter exported successfully!');
            } else {
                Alert.alert('Saved', `Cover letter saved to: ${filename}`);
            }
        } catch (error: any) {
            console.error('Export error:', error);
            Alert.alert('Error', 'Failed to export cover letter. Try copying to clipboard instead.');
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.header}>
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        onPress={() => navigation?.goBack?.()}
                        style={styles.backButton}
                    >
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Cover Letter</Text>
                    <TouchableOpacity style={styles.headerButton}>
                        <Ionicons name="help-circle-outline" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>

                <View style={styles.headerInfo}>
                    <Ionicons name="sparkles" size={24} color="#FFFFFF" />
                    <Text style={styles.headerSubtitle}>AI-Powered Generator</Text>
                </View>
            </LinearGradient>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Input Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Job Information</Text>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Job Title *</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                            placeholder="e.g., Senior Software Engineer"
                            placeholderTextColor={colors.textTertiary}
                            value={jobTitle}
                            onChangeText={setJobTitle}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Company Name *</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                            placeholder="e.g., TechCorp"
                            placeholderTextColor={colors.textTertiary}
                            value={companyName}
                            onChangeText={setCompanyName}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>
                            Job Description (Optional)
                        </Text>
                        <TextInput
                            style={[styles.textArea, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                            placeholder="Paste the job description for better customization..."
                            placeholderTextColor={colors.textTertiary}
                            multiline
                            numberOfLines={4}
                            value={jobDescription}
                            onChangeText={setJobDescription}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.generateButton, { backgroundColor: colors.primary }]}
                        onPress={handleGenerate}
                        disabled={isGenerating}
                        activeOpacity={0.8}
                    >
                        {isGenerating ? (
                            <>
                                <Ionicons name="hourglass" size={20} color="#FFFFFF" />
                                <Text style={styles.generateButtonText}>Generating...</Text>
                            </>
                        ) : (
                            <>
                                <Ionicons name="sparkles" size={20} color="#FFFFFF" />
                                <Text style={styles.generateButtonText}>Generate Cover Letter</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Generated Letter */}
                {generatedLetter && (
                    <View style={styles.section}>
                        <View style={styles.resultHeader}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Generated Letter</Text>
                            <View style={styles.resultActions}>
                                <TouchableOpacity style={styles.iconButton} onPress={handleCopy}>
                                    <Ionicons name="copy-outline" size={20} color={colors.text} />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.iconButton} onPress={handleSave}>
                                    <Ionicons name="bookmark-outline" size={20} color={colors.text} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={[styles.letterContainer, { backgroundColor: colors.surface }]}>
                            <TextInput
                                style={[styles.letterText, { color: colors.text }]}
                                value={generatedLetter}
                                onChangeText={setGeneratedLetter}
                                multiline
                                numberOfLines={20}
                            />
                        </View>

                        <View style={styles.bottomActions}>
                            <TouchableOpacity
                                style={[styles.secondaryButton, { borderColor: colors.border }]}
                                onPress={handleGenerate}
                            >
                                <Ionicons name="refresh" size={20} color={colors.text} />
                                <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
                                    Regenerate
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.primaryButton, { backgroundColor: colors.primary }]}
                                onPress={handleSave}
                            >
                                <Ionicons name="download-outline" size={20} color="#FFFFFF" />
                                <Text style={styles.primaryButtonText}>Export</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Tips */}
                <View style={[styles.section, { backgroundColor: colors.surface }]}>
                    <View style={styles.tipsHeader}>
                        <Ionicons name="bulb" size={24} color="#F59E0B" />
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Tips for Great Cover Letters</Text>
                    </View>

                    {[
                        'Customize for each job application',
                        'Highlight relevant achievements',
                        'Show enthusiasm for the role',
                        'Keep it concise (under 400 words)',
                        'Proofread carefully',
                    ].map((tip, index) => (
                        <View key={index} style={styles.tipItem}>
                            <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                            <Text style={[styles.tipText, { color: colors.textSecondary }]}>{tip}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.bottomSpacing} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 50,
        paddingBottom: 24,
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
    headerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },
    section: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 16,
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
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 12,
        fontSize: 15,
        borderWidth: 1.5,
    },
    textArea: {
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 12,
        fontSize: 15,
        borderWidth: 1.5,
        minHeight: 100,
        textAlignVertical: 'top',
    },
    generateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 16,
        borderRadius: 12,
        marginTop: 10,
    },
    generateButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    resultHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    resultActions: {
        flexDirection: 'row',
        gap: 12,
    },
    iconButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    letterContainer: {
        padding: 16,
        borderRadius: 16,
        marginBottom: 20,
    },
    letterText: {
        fontSize: 14,
        lineHeight: 24,
        minHeight: 400,
    },
    bottomActions: {
        flexDirection: 'row',
        gap: 12,
    },
    secondaryButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1.5,
    },
    secondaryButtonText: {
        fontSize: 15,
        fontWeight: '600',
    },
    primaryButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 12,
    },
    primaryButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    tipsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    tipItem: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
        alignItems: 'flex-start',
    },
    tipText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 22,
    },
    bottomSpacing: {
        height: 40,
    },
});

export default CoverLetterScreen;
