/**
 * SkillGapScreen
 * Analyze skill gaps between resume and job requirements
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

interface Props {
    navigation?: any;
    route?: any;
}

const SkillGapScreen: React.FC<Props> = ({ navigation, route }) => {
    const { colors } = useTheme();
    const [jobDescription, setJobDescription] = useState('');
    const [analysis, setAnalysis] = useState<any>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleAnalyze = () => {
        if (!jobDescription.trim()) {
            Alert.alert('Missing Information', 'Please paste a job description');
            return;
        }

        setIsAnalyzing(true);
        // Simulate AI analysis
        setTimeout(() => {
            setAnalysis({
                matchPercentage: 78,
                matchingSkills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'Git'],
                missingSkills: ['Kubernetes', 'GraphQL', 'Redis'],
                recommendations: [
                    {
                        skill: 'Kubernetes',
                        importance: 'high',
                        resources: ['Kubernetes.io Tutorial', 'Udemy Course'],
                    },
                    {
                        skill: 'GraphQL',
                        importance: 'medium',
                        resources: ['GraphQL.org', 'Apollo Docs'],
                    },
                    {
                        skill: 'Redis',
                        importance: 'low',
                        resources: ['Redis University'],
                    },
                ],
            });
            setIsAnalyzing(false);
        }, 2000);
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.header}>
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        onPress={() => navigation?.goBack?.()}
                        style={styles.backButton}
                    >
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Skill Gap Analysis</Text>
                    <TouchableOpacity style={styles.headerButton}>
                        <Ionicons name="help-circle-outline" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>

                <View style={styles.headerInfo}>
                    <Ionicons name="analytics" size={24} color="#FFFFFF" />
                    <Text style={styles.headerSubtitle}>Compare Your Skills</Text>
                </View>
            </LinearGradient>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Input Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Job Description</Text>
                    <Text style={[styles.hint, { color: colors.textSecondary }]}>
                        Paste the job description to analyze skill gaps
                    </Text>

                    <TextInput
                        style={[styles.textArea, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                        placeholder="Paste job description here..."
                        placeholderTextColor={colors.textTertiary}
                        multiline
                        numberOfLines={8}
                        value={jobDescription}
                        onChangeText={setJobDescription}
                    />

                    <TouchableOpacity
                        style={[styles.analyzeButton, { backgroundColor: colors.primary }]}
                        onPress={handleAnalyze}
                        disabled={isAnalyzing}
                        activeOpacity={0.8}
                    >
                        {isAnalyzing ? (
                            <>
                                <Ionicons name="hourglass" size={20} color="#FFFFFF" />
                                <Text style={styles.analyzeButtonText}>Analyzing...</Text>
                            </>
                        ) : (
                            <>
                                <Ionicons name="analytics" size={20} color="#FFFFFF" />
                                <Text style={styles.analyzeButtonText}>Analyze Skills</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Analysis Results */}
                {analysis && (
                    <>
                        {/* Match Score */}
                        <View style={[styles.section, { backgroundColor: colors.surface }]}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Match Score</Text>
                            <View style={styles.scoreContainer}>
                                <Text style={[styles.scoreValue, { color: colors.primary }]}>
                                    {analysis.matchPercentage}%
                                </Text>
                                <View style={styles.scoreBar}>
                                    <View
                                        style={[
                                            styles.scoreBarFill,
                                            { width: `${analysis.matchPercentage}%`, backgroundColor: colors.primary },
                                        ]}
                                    />
                                </View>
                                <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>
                                    {analysis.matchPercentage >= 80
                                        ? 'Excellent Match!'
                                        : analysis.matchPercentage >= 60
                                            ? 'Good Match'
                                            : 'Fair Match'}
                                </Text>
                            </View>
                        </View>

                        {/* Matching Skills */}
                        <View style={styles.section}>
                            <View style={styles.skillsHeader}>
                                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                    Matching Skills ({analysis.matchingSkills.length})
                                </Text>
                            </View>
                            <View style={styles.skillsGrid}>
                                {analysis.matchingSkills.map((skill: string, index: number) => (
                                    <View key={index} style={[styles.skillChip, { backgroundColor: '#10B98120' }]}>
                                        <Ionicons name="checkmark" size={16} color="#10B981" />
                                        <Text style={[styles.skillChipText, { color: '#10B981' }]}>{skill}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* Missing Skills */}
                        <View style={styles.section}>
                            <View style={styles.skillsHeader}>
                                <Ionicons name="alert-circle" size={24} color="#EF4444" />
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                    Missing Skills ({analysis.missingSkills.length})
                                </Text>
                            </View>
                            <View style={styles.skillsGrid}>
                                {analysis.missingSkills.map((skill: string, index: number) => (
                                    <View key={index} style={[styles.skillChip, { backgroundColor: '#EF444420' }]}>
                                        <Ionicons name="close" size={16} color="#EF4444" />
                                        <Text style={[styles.skillChipText, { color: '#EF4444' }]}>{skill}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* Recommendations */}
                        <View style={styles.section}>
                            <View style={styles.skillsHeader}>
                                <Ionicons name="bulb" size={24} color="#F59E0B" />
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                    Learning Recommendations
                                </Text>
                            </View>

                            {analysis.recommendations.map((rec: any, index: number) => (
                                <View key={index} style={[styles.recommendationCard, { backgroundColor: colors.surface }]}>
                                    <View style={styles.recHeader}>
                                        <Text style={[styles.recSkill, { color: colors.text }]}>{rec.skill}</Text>
                                        <View
                                            style={[
                                                styles.importanceBadge,
                                                {
                                                    backgroundColor:
                                                        rec.importance === 'high'
                                                            ? '#EF444420'
                                                            : rec.importance === 'medium'
                                                                ? '#F59E0B20'
                                                                : '#10B98120',
                                                },
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    styles.importanceText,
                                                    {
                                                        color:
                                                            rec.importance === 'high'
                                                                ? '#EF4444'
                                                                : rec.importance === 'medium'
                                                                    ? '#F59E0B'
                                                                    : '#10B981',
                                                    },
                                                ]}
                                            >
                                                {rec.importance} priority
                                            </Text>
                                        </View>
                                    </View>

                                    <Text style={[styles.recLabel, { color: colors.textSecondary }]}>
                                        Learning Resources:
                                    </Text>
                                    {rec.resources.map((resource: string, idx: number) => (
                                        <View key={idx} style={styles.resourceItem}>
                                            <Ionicons name="book-outline" size={16} color={colors.primary} />
                                            <Text style={[styles.resourceText, { color: colors.text }]}>{resource}</Text>
                                        </View>
                                    ))}
                                </View>
                            ))}
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.section}>
                            <TouchableOpacity
                                style={[styles.actionButton, { backgroundColor: colors.primary }]}
                                onPress={() => navigation?.navigate?.('ResumeBuilder')}
                            >
                                <Ionicons name="create" size={20} color="#FFFFFF" />
                                <Text style={styles.actionButtonText}>Update Resume</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}

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
        marginBottom: 12,
    },
    hint: {
        fontSize: 14,
        marginBottom: 16,
    },
    textArea: {
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 12,
        fontSize: 15,
        borderWidth: 1.5,
        minHeight: 150,
        textAlignVertical: 'top',
        marginBottom: 16,
    },
    analyzeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 16,
        borderRadius: 12,
    },
    analyzeButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    scoreContainer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    scoreValue: {
        fontSize: 56,
        fontWeight: '800',
        marginBottom: 16,
    },
    scoreBar: {
        width: '100%',
        height: 12,
        backgroundColor: '#E5E7EB',
        borderRadius: 6,
        overflow: 'hidden',
        marginBottom: 12,
    },
    scoreBarFill: {
        height: '100%',
        borderRadius: 6,
    },
    scoreLabel: {
        fontSize: 16,
        fontWeight: '600',
    },
    skillsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    skillsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    skillChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        gap: 6,
    },
    skillChipText: {
        fontSize: 13,
        fontWeight: '600',
    },
    recommendationCard: {
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
    },
    recHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    recSkill: {
        fontSize: 16,
        fontWeight: '700',
    },
    importanceBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    importanceText: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    recLabel: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 8,
    },
    resourceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 6,
    },
    resourceText: {
        fontSize: 14,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 16,
        borderRadius: 12,
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    bottomSpacing: {
        height: 40,
    },
});

export default SkillGapScreen;
