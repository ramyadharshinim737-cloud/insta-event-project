/**
 * InterviewPrepScreen
 * AI-powered interview preparation with questions and tips
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { getMockInterviewPrep } from '../../data/mockJobs';

interface Props {
    navigation?: any;
    route?: any;
}

const InterviewPrepScreen: React.FC<Props> = ({ navigation, route }) => {
    const { colors } = useTheme();
    const jobId = route?.params?.jobId || 'job-1';
    const prep = getMockInterviewPrep(jobId);
    const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());

    const toggleQuestion = (id: string) => {
        const newExpanded = new Set(expandedQuestions);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedQuestions(newExpanded);
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return '#10B981';
            case 'medium': return '#F59E0B';
            case 'hard': return '#EF4444';
            default: return colors.textSecondary;
        }
    };

    const renderQuestion = (question: any) => {
        const isExpanded = expandedQuestions.has(question.id);

        return (
            <TouchableOpacity
                key={question.id}
                style={[styles.questionCard, { backgroundColor: colors.surface }]}
                onPress={() => toggleQuestion(question.id)}
                activeOpacity={0.7}
            >
                <View style={styles.questionHeader}>
                    <View style={styles.questionTitleRow}>
                        <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(question.difficulty) + '20' }]}>
                            <Text style={[styles.difficultyText, { color: getDifficultyColor(question.difficulty) }]}>
                                {question.difficulty}
                            </Text>
                        </View>
                        <Text style={[styles.questionText, { color: colors.text }]}>
                            {question.question}
                        </Text>
                    </View>
                    <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color={colors.textSecondary}
                    />
                </View>

                {isExpanded && (
                    <View style={styles.questionAnswer}>
                        {question.suggestedAnswer && (
                            <View style={styles.answerSection}>
                                <Text style={[styles.answerLabel, { color: colors.primary }]}>
                                    Suggested Answer:
                                </Text>
                                <Text style={[styles.answerText, { color: colors.textSecondary }]}>
                                    {question.suggestedAnswer}
                                </Text>
                            </View>
                        )}

                        <View style={styles.tipsSection}>
                            <Text style={[styles.tipsLabel, { color: colors.text }]}>Tips:</Text>
                            {question.tips.map((tip: string, index: number) => (
                                <View key={index} style={styles.tipItem}>
                                    <Ionicons name="bulb" size={16} color="#F59E0B" />
                                    <Text style={[styles.tipText, { color: colors.textSecondary }]}>{tip}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <LinearGradient
                colors={['#8B5CF6', '#7C3AED']}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        onPress={() => navigation?.goBack?.()}
                        style={styles.backButton}
                    >
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Interview Prep</Text>
                    <TouchableOpacity style={styles.headerButton}>
                        <Ionicons name="bookmark-outline" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>

                <View style={styles.jobInfo}>
                    <Text style={styles.jobTitle}>{prep.jobTitle}</Text>
                    <Text style={styles.companyName}>{prep.companyName}</Text>
                </View>
            </LinearGradient>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Company Insights */}
                <View style={[styles.section, { backgroundColor: colors.surface }]}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="business" size={24} color={colors.primary} />
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Company Insights</Text>
                    </View>
                    {prep.companyInsights.map((insight, index) => (
                        <View key={index} style={styles.insightItem}>
                            <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                            <Text style={[styles.insightText, { color: colors.textSecondary }]}>{insight}</Text>
                        </View>
                    ))}
                </View>

                {/* Interview Tips */}
                <View style={[styles.section, { backgroundColor: colors.surface }]}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="bulb" size={24} color="#F59E0B" />
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>General Tips</Text>
                    </View>
                    {prep.interviewTips.map((tip, index) => (
                        <View key={index} style={styles.tipCard}>
                            <Text style={[styles.tipNumber, { color: colors.primary }]}>{index + 1}</Text>
                            <Text style={[styles.tipCardText, { color: colors.text }]}>{tip}</Text>
                        </View>
                    ))}
                </View>

                {/* Common Questions */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="help-circle" size={24} color={colors.primary} />
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            Common Questions ({prep.commonQuestions.length})
                        </Text>
                    </View>
                    {prep.commonQuestions.map(renderQuestion)}
                </View>

                {/* Technical Questions */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="code-slash" size={24} color={colors.primary} />
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            Technical Questions ({prep.technicalQuestions.length})
                        </Text>
                    </View>
                    {prep.technicalQuestions.map(renderQuestion)}
                </View>

                {/* Behavioral Questions */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="people" size={24} color={colors.primary} />
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            Behavioral Questions ({prep.behavioralQuestions.length})
                        </Text>
                    </View>
                    {prep.behavioralQuestions.map(renderQuestion)}
                </View>

                {/* Mock Interview */}
                {prep.mockInterviewAvailable && (
                    <TouchableOpacity
                        style={[styles.mockInterviewButton, { backgroundColor: colors.primary }]}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="videocam" size={24} color="#FFFFFF" />
                        <View style={styles.mockInterviewText}>
                            <Text style={styles.mockInterviewTitle}>Start Mock Interview</Text>
                            <Text style={styles.mockInterviewSubtitle}>Practice with AI interviewer</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
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
        marginBottom: 20,
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
    jobInfo: {
        paddingHorizontal: 20,
    },
    jobTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    companyName: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
    },
    scrollView: {
        flex: 1,
    },
    section: {
        margin: 16,
        padding: 16,
        borderRadius: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    insightItem: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    insightText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 22,
    },
    tipCard: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    tipNumber: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#3B82F620',
        textAlign: 'center',
        lineHeight: 24,
        fontSize: 14,
        fontWeight: '700',
    },
    tipCardText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 22,
    },
    questionCard: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    questionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 12,
    },
    questionTitleRow: {
        flex: 1,
        gap: 8,
    },
    difficultyBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    difficultyText: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    questionText: {
        fontSize: 15,
        fontWeight: '600',
        lineHeight: 22,
    },
    questionAnswer: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    answerSection: {
        marginBottom: 16,
    },
    answerLabel: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 8,
    },
    answerText: {
        fontSize: 14,
        lineHeight: 22,
    },
    tipsSection: {
        gap: 8,
    },
    tipsLabel: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 4,
    },
    tipItem: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'flex-start',
    },
    tipText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 20,
    },
    mockInterviewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        padding: 20,
        borderRadius: 16,
        gap: 16,
    },
    mockInterviewText: {
        flex: 1,
    },
    mockInterviewTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    mockInterviewSubtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.9)',
    },
    bottomSpacing: {
        height: 40,
    },
});

export default InterviewPrepScreen;
