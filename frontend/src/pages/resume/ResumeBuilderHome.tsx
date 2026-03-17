/**
 * ResumeBuilderHome
 * Main screen for Resume Builder feature
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import * as resumeApi from '../../services/resume.api';

interface Props {
    navigation?: any;
}

const ResumeBuilderHome: React.FC<Props> = ({ navigation }) => {
    const { colors } = useTheme();
    const [resumes, setResumes] = useState<resumeApi.Resume[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadResumes();
    }, []);

    const loadResumes = async () => {
        try {
            setLoading(true);
            const fetchedResumes = await resumeApi.getUserResumes();
            setResumes(fetchedResumes);
        } catch (error: any) {
            console.error('❌ Failed to load resumes:', error);
            Alert.alert('Error', error.message || 'Failed to load resumes');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadResumes();
        setRefreshing(false);
    };

    const handleDeleteResume = async (id: string) => {
        Alert.alert(
            'Delete Resume',
            'Are you sure you want to delete this resume?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await resumeApi.deleteResume(id);
                            Alert.alert('Success', 'Resume deleted successfully');
                            loadResumes();
                        } catch (error: any) {
                            console.error('❌ Failed to delete resume:', error);
                            Alert.alert('Error', error.message || 'Failed to delete resume');
                        }
                    },
                },
            ]
        );
    };

    const calculateAiScore = (resume: resumeApi.Resume) => {
        let score = 50; // Base score

        // Add points for completeness
        if (resume.personalInfo?.fullName) score += 5;
        if (resume.personalInfo?.email) score += 5;
        if (resume.personalInfo?.phone) score += 5;
        if (resume.summary) score += 10;
        if (resume.experience?.length > 0) score += 15;
        if (resume.education?.length > 0) score += 10;
        if (resume.skills?.length > 0) score += 10;
        if (resume.projects && resume.projects.length > 0) score += 5;
        if (resume.certifications && resume.certifications.length > 0) score += 5;

        return Math.min(score, 100);
    };

    const getScoreColor = (score: number) => {
        if (score >= 90) return '#10B981';
        if (score >= 75) return '#3B82F6';
        if (score >= 60) return '#F59E0B';
        return '#EF4444';
    };

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
                    <Text style={styles.headerTitle}>Resume Builder</Text>
                    <TouchableOpacity
                        onPress={loadResumes}
                        style={styles.settingsButton}
                    >
                        <Ionicons name="refresh" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {loading && resumes.length === 0 ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                        Loading resumes...
                    </Text>
                </View>
            ) : (
                <ScrollView 
                    style={styles.scrollView} 
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                    }
                >
                    {/* Quick Actions */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
                        <View style={styles.actionsGrid}>
                            <TouchableOpacity
                                style={[styles.actionCard, { backgroundColor: colors.surface }]}
                                activeOpacity={0.7}
                                onPress={() => resumes.length > 0 && navigation?.navigate?.('CoverLetter', { resume: resumes[0] })}
                            >
                                <View style={[styles.actionIcon, { backgroundColor: '#3B82F620' }]}>
                                    <Ionicons name="document-text" size={24} color="#3B82F6" />
                                </View>
                                <Text style={[styles.actionLabel, { color: colors.text }]}>Cover Letter</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionCard, { backgroundColor: colors.surface }]}
                                activeOpacity={0.7}
                                onPress={() => navigation?.navigate?.('CreateResume')}
                            >
                                <View style={[styles.actionIcon, { backgroundColor: '#10B98120' }]}>
                                    <Ionicons name="add-circle" size={24} color="#10B981" />
                                </View>
                                <Text style={[styles.actionLabel, { color: colors.text }]}>Create Resume</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* My Resumes */}
                    {resumes.length > 0 ? (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                    My Resumes ({resumes.length})
                                </Text>
                                <TouchableOpacity onPress={loadResumes}>
                                    <Text style={[styles.viewAll, { color: colors.primary }]}>View All</Text>
                                </TouchableOpacity>
                            </View>

                            {resumes.map((resume) => {
                                const aiScore = calculateAiScore(resume);
                                return (
                                    <TouchableOpacity
                                        key={resume._id}
                                        style={[styles.resumeCard, { backgroundColor: colors.surface }]}
                                        activeOpacity={0.7}
                                        onPress={() => {
                                            Alert.alert(
                                                resume.title,
                                                `Created: ${new Date(resume.createdAt).toLocaleDateString()}\n` +
                                                `Updated: ${new Date(resume.updatedAt).toLocaleDateString()}\n` +
                                                `AI Score: ${aiScore}/100\n\n` +
                                                `${resume.personalInfo?.fullName || 'No name'}\n` +
                                                `${resume.personalInfo?.email || 'No email'}\n` +
                                                `${resume.personalInfo?.phone || 'No phone'}\n` +
                                                `${resume.personalInfo?.location || 'No location'}\n\n` +
                                                `Experience: ${resume.experience?.length || 0}\n` +
                                                `Education: ${resume.education?.length || 0}\n` +
                                                `Skills: ${resume.skills?.length || 0}`,
                                                [{ text: 'OK' }]
                                            );
                                        }}
                                    >
                                        <View style={styles.resumeHeader}>
                                            <View style={styles.resumeInfo}>
                                                <Ionicons name="document-text" size={24} color={colors.primary} />
                                                <View style={styles.resumeDetails}>
                                                    <Text style={[styles.resumeTitle, { color: colors.text }]}>
                                                        {resume.title}
                                                    </Text>
                                                    <Text style={[styles.resumeSubtitle, { color: colors.textSecondary }]}>
                                                        Updated {new Date(resume.updatedAt).toLocaleDateString()}
                                                    </Text>
                                                </View>
                                            </View>
                                            <View style={[styles.scoreBadge, { backgroundColor: getScoreColor(aiScore) + '20' }]}>
                                                <Text style={[styles.scoreText, { color: getScoreColor(aiScore) }]}>
                                                    {aiScore}/100
                                                </Text>
                                            </View>
                                        </View>

                                        <View style={styles.resumeStats}>
                                            <View style={styles.stat}>
                                                <Ionicons name="briefcase-outline" size={16} color={colors.textSecondary} />
                                                <Text style={[styles.statText, { color: colors.textSecondary }]}>
                                                    {resume.experience?.length || 0} experiences
                                                </Text>
                                            </View>
                                            <View style={styles.stat}>
                                                <Ionicons name="school-outline" size={16} color={colors.textSecondary} />
                                                <Text style={[styles.statText, { color: colors.textSecondary }]}>
                                                    {resume.education?.length || 0} education
                                                </Text>
                                            </View>
                                            <View style={styles.stat}>
                                                <Ionicons name="code-slash-outline" size={16} color={colors.textSecondary} />
                                                <Text style={[styles.statText, { color: colors.textSecondary }]}>
                                                    {resume.skills?.length || 0} skills
                                                </Text>
                                            </View>
                                        </View>

                                        <View style={styles.resumeActions}>
                                            <TouchableOpacity 
                                                style={styles.actionBtn}
                                                onPress={() => navigation?.navigate?.('EditResume', { resumeId: resume._id })}
                                            >
                                                <Ionicons name="create-outline" size={18} color={colors.text} />
                                                <Text style={[styles.actionBtnText, { color: colors.text }]}>Edit</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity 
                                                style={styles.actionBtn}
                                                onPress={() => handleDeleteResume(resume._id)}
                                            >
                                                <Ionicons name="trash-outline" size={18} color="#EF4444" />
                                                <Text style={[styles.actionBtnText, { color: '#EF4444' }]}>Delete</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity 
                                                style={[styles.actionBtn, styles.primaryBtn, { backgroundColor: colors.primary }]}
                                                onPress={() => Alert.alert('Export', 'Export feature coming soon!')}
                                            >
                                                <Ionicons name="download-outline" size={18} color="#FFFFFF" />
                                                <Text style={styles.primaryBtnText}>Export</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    ) : (
                        <View style={styles.emptyState}>
                            <Ionicons name="document-text-outline" size={64} color={colors.textSecondary} />
                            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Resumes Yet</Text>
                            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                                Create your first resume to get started
                            </Text>
                        </View>
                    )}

                    {/* Create New Resume */}
                    <TouchableOpacity
                        style={[styles.createButton, { backgroundColor: colors.primary }]}
                        activeOpacity={0.8}
                        onPress={() => navigation?.navigate?.('CreateResume')}
                    >
                        <Ionicons name="add-circle" size={24} color="#FFFFFF" />
                        <Text style={styles.createButtonText}>Create New Resume</Text>
                    </TouchableOpacity>

                    <View style={styles.bottomSpacing} />
                </ScrollView>
            )}
        </View>
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
        fontSize: 14,
        fontWeight: '500',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
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
    settingsButton: {
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
        fontSize: 48,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 12,
    },
    progressBar: {
        width: '100%',
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 4,
    },
    scoreHint: {
        fontSize: 13,
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
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 16,
    },
    viewAll: {
        fontSize: 14,
        fontWeight: '600',
    },
    actionsGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    actionCard: {
        flex: 1,
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    actionIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    actionLabel: {
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
    },
    resumeCard: {
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    resumeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    resumeInfo: {
        flexDirection: 'row',
        gap: 12,
        flex: 1,
    },
    resumeDetails: {
        flex: 1,
    },
    resumeTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    resumeSubtitle: {
        fontSize: 13,
    },
    scoreBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    scoreText: {
        fontSize: 14,
        fontWeight: '700',
    },
    resumeStats: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    stat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statText: {
        fontSize: 12,
    },
    resumeActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    actionBtnText: {
        fontSize: 13,
        fontWeight: '600',
    },
    primaryBtn: {
        borderWidth: 0,
    },
    primaryBtnText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        marginHorizontal: 20,
        paddingVertical: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    createButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    bottomSpacing: {
        height: 40,
    },
});

export default ResumeBuilderHome;
