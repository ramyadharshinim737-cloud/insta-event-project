/**
 * AIAnalysisScreen
 * Detailed AI analysis of resume with scores and suggestions
 */

import React from 'react';
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
import { Resume } from '../../types/resume.types';
import { getScoreColor, getScoreLabel } from '../../utils/resumeUtils';

interface Props {
    navigation?: any;
    route?: any;
}

const AIAnalysisScreen: React.FC<Props> = ({ navigation, route }) => {
    const { colors } = useTheme();
    const resume: Resume = route?.params?.resume;

    if (!resume) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <Text style={{ color: colors.text }}>Resume not found</Text>
            </View>
        );
    }

    const { aiScore } = resume;

    const scoreCategories = [
        { label: 'ATS Compatibility', score: aiScore.atsCompatibility, icon: 'shield-checkmark' },
        { label: 'Content Quality', score: aiScore.contentQuality, icon: 'document-text' },
        { label: 'Keyword Optimization', score: aiScore.keywordOptimization, icon: 'key' },
        { label: 'Format Score', score: aiScore.formatScore, icon: 'grid' },
    ];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        onPress={() => navigation?.goBack?.()}
                        style={styles.backButton}
                    >
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>AI Analysis</Text>
                    <TouchableOpacity style={styles.headerButton}>
                        <Ionicons name="download-outline" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>

                {/* Overall Score */}
                <View style={styles.scoreContainer}>
                    <Text style={styles.scoreLabel}>Overall Score</Text>
                    <Text style={styles.scoreValue}>{aiScore.overall}/100</Text>
                    <View style={styles.progressRing}>
                        <View style={[styles.progressFill, { width: `${aiScore.overall}%` }]} />
                    </View>
                    <Text style={styles.scoreHint}>{getScoreLabel(aiScore.overall)}</Text>
                </View>
            </LinearGradient>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Score Breakdown */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Score Breakdown</Text>
                    {scoreCategories.map((category, index) => (
                        <View key={index} style={[styles.scoreCard, { backgroundColor: colors.surface }]}>
                            <View style={styles.scoreCardHeader}>
                                <View style={styles.scoreCardTitle}>
                                    <Ionicons name={category.icon as any} size={24} color={getScoreColor(category.score)} />
                                    <Text style={[styles.scoreCardLabel, { color: colors.text }]}>{category.label}</Text>
                                </View>
                                <Text style={[styles.scoreCardValue, { color: getScoreColor(category.score) }]}>
                                    {category.score}/100
                                </Text>
                            </View>
                            <View style={styles.scoreBar}>
                                <View
                                    style={[
                                        styles.scoreBarFill,
                                        { width: `${category.score}%`, backgroundColor: getScoreColor(category.score) },
                                    ]}
                                />
                            </View>
                        </View>
                    ))}
                </View>

                {/* Strengths */}
                <View style={[styles.section, { backgroundColor: colors.surface }]}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Strengths</Text>
                    </View>
                    {aiScore.strengths.map((strength, index) => (
                        <View key={index} style={styles.listItem}>
                            <Ionicons name="checkmark" size={20} color="#10B981" />
                            <Text style={[styles.listText, { color: colors.textSecondary }]}>{strength}</Text>
                        </View>
                    ))}
                </View>

                {/* Weaknesses */}
                <View style={[styles.section, { backgroundColor: colors.surface }]}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="alert-circle" size={24} color="#F59E0B" />
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Areas for Improvement</Text>
                    </View>
                    {aiScore.weaknesses.map((weakness, index) => (
                        <View key={index} style={styles.listItem}>
                            <Ionicons name="warning" size={20} color="#F59E0B" />
                            <Text style={[styles.listText, { color: colors.textSecondary }]}>{weakness}</Text>
                        </View>
                    ))}
                </View>

                {/* Suggestions */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="bulb" size={24} color={colors.primary} />
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>AI Suggestions</Text>
                    </View>
                    {aiScore.suggestions.map((suggestion, index) => (
                        <View key={index} style={[styles.suggestionCard, { backgroundColor: colors.surface }]}>
                            <View style={styles.suggestionNumber}>
                                <Text style={[styles.suggestionNumberText, { color: colors.primary }]}>{index + 1}</Text>
                            </View>
                            <Text style={[styles.suggestionText, { color: colors.text }]}>{suggestion}</Text>
                        </View>
                    ))}
                </View>

                {/* Action Buttons */}
                <View style={styles.actionsSection}>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="refresh" size={20} color={colors.text} />
                        <Text style={[styles.actionButtonText, { color: colors.text }]}>Re-analyze</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: colors.primary }]}
                        activeOpacity={0.7}
                        onPress={() => navigation?.navigate?.('EditResume', { resume })}
                    >
                        <Ionicons name="create" size={20} color="#FFFFFF" />
                        <Text style={styles.actionButtonTextPrimary}>Edit Resume</Text>
                    </TouchableOpacity>
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
        marginBottom: 24,
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
    scoreContainer: {
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    scoreLabel: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        marginBottom: 8,
    },
    scoreValue: {
        fontSize: 56,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 16,
    },
    progressRing: {
        width: '100%',
        height: 12,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 6,
        overflow: 'hidden',
        marginBottom: 12,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 6,
    },
    scoreHint: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },
    section: {
        padding: 20,
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
    scoreCard: {
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
    },
    scoreCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    scoreCardTitle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    scoreCardLabel: {
        fontSize: 15,
        fontWeight: '600',
    },
    scoreCardValue: {
        fontSize: 18,
        fontWeight: '700',
    },
    scoreBar: {
        height: 8,
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
        overflow: 'hidden',
    },
    scoreBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    listItem: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
        alignItems: 'flex-start',
    },
    listText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 22,
    },
    suggestionCard: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        gap: 12,
    },
    suggestionNumber: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#10B98120',
        justifyContent: 'center',
        alignItems: 'center',
    },
    suggestionNumberText: {
        fontSize: 14,
        fontWeight: '700',
    },
    suggestionText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 22,
    },
    actionsSection: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 12,
        marginBottom: 20,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1.5,
    },
    actionButtonText: {
        fontSize: 15,
        fontWeight: '600',
    },
    actionButtonTextPrimary: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    bottomSpacing: {
        height: 40,
    },
});

export default AIAnalysisScreen;
