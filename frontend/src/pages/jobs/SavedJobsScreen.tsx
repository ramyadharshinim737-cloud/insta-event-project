/**
 * SavedJobsScreen
 * View and manage saved jobs
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { jobsApi } from '../../services/jobs.api';

interface Props {
    navigation?: any;
}

const SavedJobsScreen: React.FC<Props> = ({ navigation }) => {
    const { colors } = useTheme();
    const [savedJobs, setSavedJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadSavedJobs();
    }, []);

    const loadSavedJobs = async () => {
        try {
            setLoading(true);
            const response = await jobsApi.getSavedJobs(1, 100);
            setSavedJobs(response.savedJobs);
        } catch (error: any) {
            console.error('Failed to load saved jobs:', error);
            Alert.alert('Error', error.message || 'Failed to load saved jobs');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadSavedJobs();
        setRefreshing(false);
    };

    const handleUnsaveJob = async (jobId: string) => {
        try {
            await jobsApi.unsaveJob(jobId);
            setSavedJobs(prev => prev.filter(saved => {
                const savedJobId = typeof saved.job === 'string' ? saved.job : saved.job?._id;
                return savedJobId !== jobId;
            }));
            Alert.alert('Success', 'Job removed from saved');
        } catch (error: any) {
            console.error('Unsave job error:', error);
            Alert.alert('Error', error.message || 'Failed to unsave job');
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <LinearGradient
                colors={['#F59E0B', '#D97706']}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        onPress={() => navigation?.goBack?.()}
                        style={styles.backButton}
                    >
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Saved Jobs</Text>
                    <View style={styles.headerButton} />
                </View>

                <Text style={styles.headerSubtitle}>
                    {savedJobs.length} {savedJobs.length === 1 ? 'job' : 'jobs'} saved
                </Text>
            </LinearGradient>

            <ScrollView 
                style={styles.scrollView} 
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
            >
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.primary} />
                        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                            Loading saved jobs...
                        </Text>
                    </View>
                ) : savedJobs.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="bookmark-outline" size={64} color={colors.textSecondary} />
                        <Text style={[styles.emptyText, { color: colors.text }]}>
                            No saved jobs yet
                        </Text>
                        <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                            Save jobs to view them later
                        </Text>
                        <TouchableOpacity
                            style={[styles.browseButton, { backgroundColor: colors.primary }]}
                            onPress={() => navigation?.navigate?.('Jobs')}
                        >
                            <Text style={styles.browseButtonText}>Browse Jobs</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    savedJobs.map((saved) => {
                        const job = typeof saved.job === 'string' ? null : saved.job;
                        
                        return (
                            <TouchableOpacity
                                key={saved._id}
                                style={[styles.jobCard, { backgroundColor: colors.surface }]}
                                activeOpacity={0.7}
                                onPress={() => job && navigation?.navigate?.('JobDetail', { job })}
                            >
                                {/* Header */}
                                <View style={styles.cardHeader}>
                                    <View style={styles.companyLogo}>
                                        <Ionicons name="business" size={24} color={colors.primary} />
                                    </View>
                                    <View style={styles.cardInfo}>
                                        <Text style={[styles.jobTitle, { color: colors.text }]}>
                                            {job?.title || 'Job Title'}
                                        </Text>
                                        <Text style={[styles.companyName, { color: colors.textSecondary }]}>
                                            {job?.company || 'Company'}
                                        </Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => handleUnsaveJob(job?._id)}
                                        style={styles.unsaveButton}
                                    >
                                        <Ionicons name="bookmark" size={20} color="#F59E0B" />
                                    </TouchableOpacity>
                                </View>

                                {/* Details */}
                                <View style={styles.jobDetails}>
                                    <View style={styles.detailItem}>
                                        <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                                        <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                                            {job?.location || 'Location'}
                                        </Text>
                                    </View>
                                    {job?.salary && (
                                        <View style={styles.detailItem}>
                                            <Ionicons name="cash-outline" size={14} color={colors.textSecondary} />
                                            <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                                                {job.salary}
                                            </Text>
                                        </View>
                                    )}
                                    <View style={styles.detailItem}>
                                        <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                                        <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                                            {job?.level || 'Level'}
                                        </Text>
                                    </View>
                                </View>

                                {/* Tags */}
                                <View style={styles.tags}>
                                    <View style={[styles.tag, { backgroundColor: colors.primary + '20' }]}>
                                        <Text style={[styles.tagText, { color: colors.primary }]}>
                                            {job?.type || 'Full-time'}
                                        </Text>
                                    </View>
                                </View>

                                {/* Saved Date */}
                                <View style={styles.savedDateSection}>
                                    <Ionicons name="bookmark-outline" size={14} color={colors.textSecondary} />
                                    <Text style={[styles.savedDateText, { color: colors.textSecondary }]}>
                                        Saved {formatDate(saved.savedAt || saved.createdAt)}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })
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
        paddingTop: 60,
        paddingBottom: 30,
        paddingHorizontal: 20,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
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
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '500',
    },
    scrollView: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 14,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 80,
        paddingHorizontal: 40,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 24,
    },
    browseButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    browseButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    jobCard: {
        marginHorizontal: 20,
        marginVertical: 8,
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    companyLogo: {
        width: 48,
        height: 48,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    cardInfo: {
        flex: 1,
    },
    jobTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    companyName: {
        fontSize: 14,
    },
    unsaveButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    jobDetails: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 12,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    detailText: {
        fontSize: 13,
    },
    tags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 12,
    },
    tag: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    tagText: {
        fontSize: 12,
        fontWeight: '600',
    },
    savedDateSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    savedDateText: {
        fontSize: 13,
    },
    bottomSpacing: {
        height: 40,
    },
});

export default SavedJobsScreen;
