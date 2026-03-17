/**
 * JobDetailScreen
 * Detailed job view with AI match score and quick apply
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { Job } from '../../types/job.types';
import { formatSalary, getMatchColor, formatPostedDate, calculateJobMatch } from '../../utils/jobUtils';

interface Props {
    navigation?: any;
    route?: any;
}

const JobDetailScreen: React.FC<Props> = ({ navigation, route }) => {
    const { colors } = useTheme();
    const job: Job = route?.params?.job;
    const [isSaved, setIsSaved] = useState(false);

    if (!job) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <Text style={{ color: colors.text }}>Job not found</Text>
            </View>
        );
    }

    const matchScore = calculateJobMatch(job, ['React', 'Node.js', 'TypeScript', 'AWS']);

    const handleSave = () => {
        setIsSaved(!isSaved);
        Alert.alert(isSaved ? 'Removed from Saved' : 'Saved', isSaved ? 'Job removed from saved jobs' : 'Job saved successfully');
    };

    const handleShare = () => {
        Alert.alert('Share Job', 'Share this job with your network');
    };

    const handleQuickApply = () => {
        Alert.alert(
            'Quick Apply',
            'Apply to this job with your resume?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Apply',
                    onPress: () => Alert.alert('Success', 'Application submitted successfully!'),
                },
            ]
        );
    };

    const handleReportScam = () => {
        Alert.alert('Report Job', 'Report this job as spam or scam?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Report', style: 'destructive', onPress: () => Alert.alert('Reported', 'Thank you for reporting') },
        ]);
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation?.goBack?.()} style={styles.headerButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Job Details</Text>
                <View style={styles.headerActions}>
                    <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
                        <Ionicons
                            name={isSaved ? 'bookmark' : 'bookmark-outline'}
                            size={24}
                            color={isSaved ? colors.primary : colors.text}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
                        <Ionicons name="share-social-outline" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Company Header */}
                <View style={[styles.companyHeader, { backgroundColor: colors.surface }]}>
                    <View style={styles.companyLogo}>
                        <Ionicons name="business" size={40} color={colors.primary} />
                    </View>
                    <View style={styles.companyInfo}>
                        <Text style={[styles.companyName, { color: colors.text }]}>{job.company.name}</Text>
                        <View style={styles.companyRating}>
                            <Ionicons name="star" size={16} color="#F59E0B" />
                            <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
                                {job.company.ratings.overall.toFixed(1)} ({job.company.size})
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Job Title & Match */}
                <View style={styles.section}>
                    <Text style={[styles.jobTitle, { color: colors.text }]}>{job.title}</Text>
                    <View style={[styles.matchBadge, { backgroundColor: getMatchColor(matchScore.overallMatch) + '20' }]}>
                        <Ionicons name="checkmark-circle" size={20} color={getMatchColor(matchScore.overallMatch)} />
                        <Text style={[styles.matchText, { color: getMatchColor(matchScore.overallMatch) }]}>
                            {matchScore.overallMatch}% Match
                        </Text>
                    </View>
                </View>

                {/* Key Info */}
                <View style={[styles.section, styles.keyInfo]}>
                    <View style={styles.infoRow}>
                        <Ionicons name="location" size={20} color={colors.primary} />
                        <Text style={[styles.infoText, { color: colors.text }]}>
                            {job.location.city}, {job.location.state}
                        </Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="cash" size={20} color={colors.primary} />
                        <Text style={[styles.infoText, { color: colors.text }]}>
                            {formatSalary(job.salary.min, job.salary.max)} per year
                        </Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="briefcase" size={20} color={colors.primary} />
                        <Text style={[styles.infoText, { color: colors.text }]}>
                            {job.experience.min}-{job.experience.max} years
                        </Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="time" size={20} color={colors.primary} />
                        <Text style={[styles.infoText, { color: colors.text }]}>{formatPostedDate(job.postedDate)}</Text>
                    </View>
                </View>

                {/* Tags */}
                <View style={styles.section}>
                    <View style={styles.tags}>
                        <View style={[styles.tag, { backgroundColor: colors.primary + '20' }]}>
                            <Text style={[styles.tagText, { color: colors.primary }]}>{job.workMode}</Text>
                        </View>
                        <View style={[styles.tag, { backgroundColor: colors.border }]}>
                            <Text style={[styles.tagText, { color: colors.textSecondary }]}>{job.jobType}</Text>
                        </View>
                        {job.featured && (
                            <View style={[styles.tag, { backgroundColor: '#F59E0B20' }]}>
                                <Ionicons name="star" size={14} color="#F59E0B" />
                                <Text style={[styles.tagText, { color: '#F59E0B' }]}>Featured</Text>
                            </View>
                        )}
                        {job.aiVerified && (
                            <View style={[styles.tag, { backgroundColor: '#10B98120' }]}>
                                <Ionicons name="shield-checkmark" size={14} color="#10B981" />
                                <Text style={[styles.tagText, { color: '#10B981' }]}>Verified</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Match Breakdown */}
                <View style={[styles.section, { backgroundColor: colors.surface, padding: 16, borderRadius: 16 }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Match Breakdown</Text>
                    <View style={styles.matchBreakdown}>
                        <View style={styles.matchItem}>
                            <Text style={[styles.matchLabel, { color: colors.textSecondary }]}>Skills</Text>
                            <View style={styles.matchBar}>
                                <View style={[styles.matchFill, { width: `${matchScore.skillMatch}%`, backgroundColor: colors.primary }]} />
                            </View>
                            <Text style={[styles.matchValue, { color: colors.text }]}>{matchScore.skillMatch}%</Text>
                        </View>
                        <View style={styles.matchItem}>
                            <Text style={[styles.matchLabel, { color: colors.textSecondary }]}>Experience</Text>
                            <View style={styles.matchBar}>
                                <View style={[styles.matchFill, { width: `${matchScore.experienceMatch}%`, backgroundColor: colors.primary }]} />
                            </View>
                            <Text style={[styles.matchValue, { color: colors.text }]}>{matchScore.experienceMatch}%</Text>
                        </View>
                    </View>
                    <View style={styles.matchingSkills}>
                        <Text style={[styles.matchingLabel, { color: colors.text }]}>Matching Skills:</Text>
                        <View style={styles.skillTags}>
                            {matchScore.matchingSkills.map((skill, index) => (
                                <View key={index} style={[styles.skillTag, { backgroundColor: '#10B98120' }]}>
                                    <Ionicons name="checkmark" size={14} color="#10B981" />
                                    <Text style={[styles.skillTagText, { color: '#10B981' }]}>{skill}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Description */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>About the Role</Text>
                    <Text style={[styles.description, { color: colors.textSecondary }]}>{job.description}</Text>
                </View>

                {/* Requirements */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Requirements</Text>
                    {job.requirements.map((req, index) => (
                        <View key={index} style={styles.listItem}>
                            <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                            <Text style={[styles.listText, { color: colors.textSecondary }]}>{req}</Text>
                        </View>
                    ))}
                </View>

                {/* Responsibilities */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Responsibilities</Text>
                    {job.responsibilities.map((resp, index) => (
                        <View key={index} style={styles.listItem}>
                            <Ionicons name="arrow-forward-circle" size={20} color={colors.primary} />
                            <Text style={[styles.listText, { color: colors.textSecondary }]}>{resp}</Text>
                        </View>
                    ))}
                </View>

                {/* Benefits */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Benefits</Text>
                    <View style={styles.benefitsGrid}>
                        {job.benefits.map((benefit, index) => (
                            <View key={index} style={[styles.benefitCard, { backgroundColor: colors.surface }]}>
                                <Ionicons name="gift-outline" size={20} color={colors.primary} />
                                <Text style={[styles.benefitText, { color: colors.text }]}>{benefit}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Company Insights */}
                <TouchableOpacity
                    style={[styles.section, { backgroundColor: colors.surface, padding: 16, borderRadius: 16 }]}
                    onPress={() => navigation?.navigate?.('CompanyDetail', { company: job.company })}
                >
                    <View style={styles.companyInsightHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Company Insights</Text>
                        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                    </View>
                    <View style={styles.ratingsGrid}>
                        <View style={styles.ratingItem}>
                            <Text style={[styles.ratingLabel, { color: colors.textSecondary }]}>Work-Life</Text>
                            <Text style={[styles.ratingValue, { color: colors.text }]}>{job.company.ratings.workLife.toFixed(1)}</Text>
                        </View>
                        <View style={styles.ratingItem}>
                            <Text style={[styles.ratingLabel, { color: colors.textSecondary }]}>Culture</Text>
                            <Text style={[styles.ratingValue, { color: colors.text }]}>{job.company.ratings.culture.toFixed(1)}</Text>
                        </View>
                        <View style={styles.ratingItem}>
                            <Text style={[styles.ratingLabel, { color: colors.textSecondary }]}>Growth</Text>
                            <Text style={[styles.ratingValue, { color: colors.text }]}>{job.company.ratings.growth.toFixed(1)}</Text>
                        </View>
                    </View>
                </TouchableOpacity>

                {/* Report Scam */}
                {job.scamScore > 5 && (
                    <TouchableOpacity style={styles.reportButton} onPress={handleReportScam}>
                        <Ionicons name="warning-outline" size={16} color="#EF4444" />
                        <Text style={styles.reportText}>Report this job</Text>
                    </TouchableOpacity>
                )}

                <View style={styles.bottomSpacing} />
            </ScrollView>

            {/* Bottom Actions */}
            <View style={[styles.bottomBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
                <TouchableOpacity
                    style={[styles.secondaryButton, { borderColor: colors.border }]}
                    onPress={() => navigation?.navigate?.('InterviewPrep', { jobId: job.id })}
                >
                    <Ionicons name="school-outline" size={20} color={colors.text} />
                    <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Interview Prep</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.applyButton, { backgroundColor: colors.primary }]}
                    onPress={handleQuickApply}
                >
                    <Ionicons name="send" size={20} color="#FFFFFF" />
                    <Text style={styles.applyButtonText}>Quick Apply</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingTop: 50,
        borderBottomWidth: 1,
    },
    headerButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    headerActions: {
        flexDirection: 'row',
        gap: 8,
    },
    scrollView: {
        flex: 1,
    },
    companyHeader: {
        flexDirection: 'row',
        padding: 20,
        gap: 16,
    },
    companyLogo: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    companyInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    companyName: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 4,
    },
    companyRating: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        fontSize: 14,
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    jobTitle: {
        fontSize: 24,
        fontWeight: '800',
        marginBottom: 12,
    },
    matchBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        gap: 6,
    },
    matchText: {
        fontSize: 14,
        fontWeight: '700',
    },
    keyInfo: {
        gap: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    infoText: {
        fontSize: 15,
    },
    tags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        gap: 4,
    },
    tagText: {
        fontSize: 13,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 12,
    },
    matchBreakdown: {
        gap: 16,
        marginBottom: 16,
    },
    matchItem: {
        gap: 8,
    },
    matchLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    matchBar: {
        height: 8,
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
        overflow: 'hidden',
    },
    matchFill: {
        height: '100%',
        borderRadius: 4,
    },
    matchValue: {
        fontSize: 14,
        fontWeight: '700',
        textAlign: 'right',
    },
    matchingSkills: {
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    matchingLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    skillTags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    skillTag: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    skillTagText: {
        fontSize: 12,
        fontWeight: '600',
    },
    description: {
        fontSize: 15,
        lineHeight: 24,
    },
    listItem: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    listText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 22,
    },
    benefitsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    benefitCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 12,
        gap: 8,
        minWidth: '45%',
    },
    benefitText: {
        fontSize: 13,
        fontWeight: '600',
    },
    companyInsightHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    ratingsGrid: {
        flexDirection: 'row',
        gap: 16,
    },
    ratingItem: {
        flex: 1,
        alignItems: 'center',
    },
    ratingLabel: {
        fontSize: 12,
        marginBottom: 4,
    },
    ratingValue: {
        fontSize: 20,
        fontWeight: '700',
    },
    reportButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 12,
        marginHorizontal: 20,
    },
    reportText: {
        color: '#EF4444',
        fontSize: 14,
        fontWeight: '600',
    },
    bottomSpacing: {
        height: 100,
    },
    bottomBar: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
        borderTopWidth: 1,
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
    applyButton: {
        flex: 1.5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 12,
    },
    applyButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});

export default JobDetailScreen;
