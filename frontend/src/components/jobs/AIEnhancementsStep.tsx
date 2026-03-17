/**
 * AIEnhancementsStep Component
 * Step 7: Show AI suggestions and job preview
 */

import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { JobFormData, AIJobSuggestions, JobScamDetection } from '../../types/job.types';
import { generateAISuggestions, detectJobScamRisk } from '../../utils/jobCreationUtils';

interface Props {
    formData: Partial<JobFormData>;
    onUpdate: (data: Partial<JobFormData>) => void;
}

const AIEnhancementsStep: React.FC<Props> = ({ formData, onUpdate }) => {
    const { colors } = useTheme();
    const [aiSuggestions, setAiSuggestions] = useState<AIJobSuggestions | null>(null);
    const [scamDetection, setScamDetection] = useState<JobScamDetection | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Generate AI suggestions
        setTimeout(() => {
            const suggestions = generateAISuggestions(formData);
            const scam = detectJobScamRisk(formData);
            setAiSuggestions(suggestions);
            setScamDetection(scam);
            setLoading(false);
        }, 1000);
    }, []);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                    Analyzing your job posting...
                </Text>
            </View>
        );
    }

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'low': return '#10B981';
            case 'medium': return '#F59E0B';
            case 'high': return '#EF4444';
            default: return colors.textSecondary;
        }
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Quality Score */}
            <LinearGradient
                colors={[colors.primary, colors.primary + 'CC']}
                style={styles.scoreCard}
            >
                <View style={styles.scoreHeader}>
                    <Ionicons name="star" size={32} color="#FFFFFF" />
                    <View style={styles.scoreInfo}>
                        <Text style={styles.scoreValue}>{aiSuggestions?.qualityScore || 0}%</Text>
                        <Text style={styles.scoreLabel}>Job Quality Score</Text>
                    </View>
                </View>
                <Text style={styles.scoreHint}>
                    {aiSuggestions && aiSuggestions.qualityScore >= 80
                        ? 'Excellent! Your job posting is well-detailed.'
                        : 'Consider adding more details to improve visibility.'}
                </Text>
            </LinearGradient>

            {/* Scam Detection */}
            {scamDetection && (
                <View
                    style={[
                        styles.scamCard,
                        {
                            backgroundColor: colors.surface,
                            borderColor: getRiskColor(scamDetection.riskLevel),
                        },
                    ]}
                >
                    <View style={styles.scamHeader}>
                        <Ionicons
                            name="shield-checkmark"
                            size={24}
                            color={getRiskColor(scamDetection.riskLevel)}
                        />
                        <Text style={[styles.scamTitle, { color: colors.text }]}>
                            Scam Risk: {scamDetection.riskLevel.toUpperCase()}
                        </Text>
                    </View>
                    {scamDetection.warnings.length > 0 && (
                        <View style={styles.warningsList}>
                            {scamDetection.warnings.map((warning, index) => (
                                <View key={index} style={styles.warningItem}>
                                    <Ionicons name="alert-circle" size={16} color="#F59E0B" />
                                    <Text style={[styles.warningText, { color: colors.textSecondary }]}>
                                        {warning}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}
                    {scamDetection.riskLevel === 'low' && scamDetection.warnings.length === 0 && (
                        <Text style={[styles.scamSuccess, { color: '#10B981' }]}>
                            Γ£ô No suspicious patterns detected
                        </Text>
                    )}
                </View>
            )}

            {/* Match Criteria */}
            {aiSuggestions && (
                <View style={[styles.card, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>
                        Candidate Match Criteria
                    </Text>
                    <Text style={[styles.cardHint, { color: colors.textSecondary }]}>
                        How candidates will be scored for this position
                    </Text>
                    <View style={styles.criteriaList}>
                        <View style={styles.criteriaItem}>
                            <Text style={[styles.criteriaLabel, { color: colors.text }]}>
                                Skills Match
                            </Text>
                            <View style={styles.criteriaBar}>
                                <View
                                    style={[
                                        styles.criteriaFill,
                                        {
                                            backgroundColor: colors.primary,
                                            width: `${aiSuggestions.matchCriteria.skillWeight}%`,
                                        },
                                    ]}
                                />
                            </View>
                            <Text style={[styles.criteriaValue, { color: colors.textSecondary }]}>
                                {aiSuggestions.matchCriteria.skillWeight}%
                            </Text>
                        </View>
                        <View style={styles.criteriaItem}>
                            <Text style={[styles.criteriaLabel, { color: colors.text }]}>
                                Experience Match
                            </Text>
                            <View style={styles.criteriaBar}>
                                <View
                                    style={[
                                        styles.criteriaFill,
                                        {
                                            backgroundColor: colors.primary,
                                            width: `${aiSuggestions.matchCriteria.experienceWeight}%`,
                                        },
                                    ]}
                                />
                            </View>
                            <Text style={[styles.criteriaValue, { color: colors.textSecondary }]}>
                                {aiSuggestions.matchCriteria.experienceWeight}%
                            </Text>
                        </View>
                        <View style={styles.criteriaItem}>
                            <Text style={[styles.criteriaLabel, { color: colors.text }]}>
                                Education Match
                            </Text>
                            <View style={styles.criteriaBar}>
                                <View
                                    style={[
                                        styles.criteriaFill,
                                        {
                                            backgroundColor: colors.primary,
                                            width: `${aiSuggestions.matchCriteria.educationWeight}%`,
                                        },
                                    ]}
                                />
                            </View>
                            <Text style={[styles.criteriaValue, { color: colors.textSecondary }]}>
                                {aiSuggestions.matchCriteria.educationWeight}%
                            </Text>
                        </View>
                        <View style={styles.criteriaItem}>
                            <Text style={[styles.criteriaLabel, { color: colors.text }]}>
                                Location Match
                            </Text>
                            <View style={styles.criteriaBar}>
                                <View
                                    style={[
                                        styles.criteriaFill,
                                        {
                                            backgroundColor: colors.primary,
                                            width: `${aiSuggestions.matchCriteria.locationWeight}%`,
                                        },
                                    ]}
                                />
                            </View>
                            <Text style={[styles.criteriaValue, { color: colors.textSecondary }]}>
                                {aiSuggestions.matchCriteria.locationWeight}%
                            </Text>
                        </View>
                    </View>
                </View>
            )}

            {/* SEO Keywords */}
            {aiSuggestions && aiSuggestions.seoKeywords.length > 0 && (
                <View style={[styles.card, { backgroundColor: colors.surface }]}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="search" size={20} color={colors.primary} />
                        <Text style={[styles.cardTitle, { color: colors.text }]}>
                            SEO Keywords
                        </Text>
                    </View>
                    <Text style={[styles.cardHint, { color: colors.textSecondary }]}>
                        These keywords will help candidates find your job
                    </Text>
                    <View style={styles.tags}>
                        {aiSuggestions.seoKeywords.map((keyword, index) => (
                            <View
                                key={index}
                                style={[styles.tag, { backgroundColor: colors.primary + '20' }]}
                            >
                                <Text style={[styles.tagText, { color: colors.primary }]}>
                                    {keyword}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}

            <View style={styles.bottomSpacing} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    loadingText: {
        fontSize: 15,
    },
    scoreCard: {
        padding: 20,
        borderRadius: 16,
        marginBottom: 20,
    },
    scoreHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 12,
    },
    scoreInfo: {
        flex: 1,
    },
    scoreValue: {
        fontSize: 32,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    scoreLabel: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        marginTop: 4,
    },
    scoreHint: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
    },
    scamCard: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
        marginBottom: 20,
    },
    scamHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 12,
    },
    scamTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    warningsList: {
        gap: 8,
    },
    warningItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
    },
    warningText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
    },
    scamSuccess: {
        fontSize: 14,
        fontWeight: '500',
    },
    card: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    cardHint: {
        fontSize: 13,
        marginBottom: 16,
    },
    criteriaList: {
        gap: 16,
    },
    criteriaItem: {
        gap: 8,
    },
    criteriaLabel: {
        fontSize: 14,
        fontWeight: '500',
    },
    criteriaBar: {
        height: 8,
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
        overflow: 'hidden',
    },
    criteriaFill: {
        height: '100%',
        borderRadius: 4,
    },
    criteriaValue: {
        fontSize: 13,
        textAlign: 'right',
    },
    tags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tag: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    tagText: {
        fontSize: 14,
        fontWeight: '500',
    },
    bottomSpacing: {
        height: 40,
    },
});

export default AIEnhancementsStep;
