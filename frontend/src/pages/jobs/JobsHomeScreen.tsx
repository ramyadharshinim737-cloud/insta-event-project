/**
 * JobsHomeScreen
 * Main screen for Job Search feature with location-based search
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
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

const JobsHomeScreen: React.FC<Props> = ({ navigation }) => {
    const { colors } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedType, setSelectedType] = useState<string>('');
    const [refreshKey, setRefreshKey] = useState(0);
    const [applicationsCount, setApplicationsCount] = useState(0);
    const [savedCount, setSavedCount] = useState(0);
    const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        loadJobs();
        loadStats();
    }, [selectedType, refreshKey]);

    // Refresh jobs when screen is mounted or navigation changes
    useEffect(() => {
        const timer = setTimeout(() => {
            setRefreshKey(prev => prev + 1);
        }, 100);
        return () => clearTimeout(timer);
    }, [navigation]);

    const loadJobs = async () => {
        try {
            setLoading(true);
            const filters: any = {};
            if (selectedType) filters.type = selectedType;
            
            const response = await jobsApi.getJobs(1, 20, filters);
            setJobs(response.jobs);
        } catch (error: any) {
            console.error('Failed to load jobs:', error);
            Alert.alert('Error', error.message || 'Failed to load jobs');
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            // Load applications count
            const appsResponse = await jobsApi.getUserApplications(1, 1000);
            setApplicationsCount(appsResponse.total || 0);
            
            // Load saved jobs
            const savedResponse = await jobsApi.getSavedJobs(1, 1000);
            setSavedCount(savedResponse.total || 0);
            
            // Track saved job IDs
            const savedIds = new Set(savedResponse.savedJobs.map((saved: any) => 
                typeof saved.job === 'string' ? saved.job : saved.job?._id
            ));
            setSavedJobIds(savedIds);
        } catch (error: any) {
            console.error('Failed to load stats:', error);
            // Don't show alert for stats errors, just use default values
            setApplicationsCount(0);
            setSavedCount(0);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadJobs();
        await loadStats();
        setRefreshing(false);
    };

    const handleSaveJob = async (jobId: string) => {
        try {
            const isSaved = savedJobIds.has(jobId);
            
            if (isSaved) {
                await jobsApi.unsaveJob(jobId);
                setSavedJobIds(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(jobId);
                    return newSet;
                });
                setSavedCount(prev => prev - 1);
                Alert.alert('Success', 'Job removed from saved');
            } else {
                await jobsApi.saveJob(jobId);
                setSavedJobIds(prev => new Set([...prev, jobId]));
                setSavedCount(prev => prev + 1);
                Alert.alert('Success', 'Job saved successfully');
            }
        } catch (error: any) {
            console.error('Save job error:', error);
            Alert.alert('Error', error.message || 'Failed to save job');
        }
    };

    const handleQuickApply = async (job: any) => {
        try {
            // Check if already applied
            const appsResponse = await jobsApi.getUserApplications(1, 1000);
            const alreadyApplied = appsResponse.applications.some(
                (app: any) => {
                    const appJobId = typeof app.job === 'string' ? app.job : app.job?._id;
                    return appJobId === job._id;
                }
            );

            if (alreadyApplied) {
                Alert.alert('Already Applied', 'You have already applied to this job');
                return;
            }

            // Quick apply without cover letter
            await jobsApi.applyForJob(job._id);
            setApplicationsCount(prev => prev + 1);
            Alert.alert('Success!', 'Application submitted successfully');
        } catch (error: any) {
            console.error('Quick apply error:', error);
            Alert.alert('Error', error.message || 'Failed to apply for job');
        }
    };

    const getMatchColor = (match: number) => {
        if (match >= 90) return '#10B981';
        if (match >= 75) return '#3B82F6';
        if (match >= 60) return '#F59E0B';
        return '#EF4444';
    };

    const calculateDistance = (lat: number, lng: number) => {
        // Simple distance calculation (mock)
        return (Math.random() * 10 + 0.5).toFixed(1);
    };

    const formatSalary = (min: number, max: number) => {
        const formatLPA = (amount: number) => {
            return `₹${(amount / 100000).toFixed(0)}L`;
        };
        return `${formatLPA(min)}-${formatLPA(max)} PA`;
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <LinearGradient
                colors={['#3B82F6', '#2563EB']}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        onPress={() => navigation?.goBack?.()}
                        style={styles.backButton}
                    >
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Jobs</Text>
                    <TouchableOpacity style={styles.notificationButton}>
                        <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
                        <View style={styles.notificationBadge}>
                            <Text style={styles.notificationBadgeText}>3</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="rgba(255,255,255,0.7)" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search jobs, companies..."
                        placeholderTextColor="rgba(255,255,255,0.7)"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    <TouchableOpacity>
                        <Ionicons name="options-outline" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>

                {/* Location */}
                <View style={styles.locationContainer}>
                    <Ionicons name="location" size={16} color="rgba(255,255,255,0.9)" />
                    <Text style={styles.locationText}>Bengaluru, Karnataka</Text>
                    <TouchableOpacity>
                        <Ionicons name="chevron-down" size={16} color="rgba(255,255,255,0.9)" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <ScrollView 
                style={styles.scrollView} 
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
            >
                {/* Quick Filters */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filtersContainer}
                >
                    <TouchableOpacity 
                        style={[styles.filterChip, { backgroundColor: selectedType === '' ? colors.primary : colors.surface }]}
                        onPress={() => setSelectedType('')}
                    >
                        <Ionicons name="location" size={16} color={selectedType === '' ? "#FFFFFF" : colors.text} />
                        <Text style={selectedType === '' ? styles.filterChipTextActive : [styles.filterChipText, { color: colors.text }]}>All</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.filterChip, { backgroundColor: selectedType === 'Remote' ? colors.primary : colors.surface }]}
                        onPress={() => setSelectedType('Remote')}
                    >
                        <Text style={selectedType === 'Remote' ? styles.filterChipTextActive : [styles.filterChipText, { color: colors.text }]}>Remote</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.filterChip, { backgroundColor: selectedType === 'Full-time' ? colors.primary : colors.surface }]}
                        onPress={() => setSelectedType('Full-time')}
                    >
                        <Text style={selectedType === 'Full-time' ? styles.filterChipTextActive : [styles.filterChipText, { color: colors.text }]}>Full-time</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.filterChip, { backgroundColor: colors.surface }]}>
                        <Text style={[styles.filterChipText, { color: colors.text }]}>₹10L+</Text>
                    </TouchableOpacity>
                </ScrollView>

                {/* Stats */}
                <View style={styles.statsContainer}>
                    <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
                        <Ionicons name="briefcase" size={24} color={colors.primary} />
                        <Text style={[styles.statValue, { color: colors.text }]}>{jobs.length}</Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Jobs Found</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.statCard, { backgroundColor: colors.surface }]}
                        onPress={() => navigation?.navigate?.('SavedJobs')}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="bookmark" size={24} color="#F59E0B" />
                        <Text style={[styles.statValue, { color: colors.text }]}>{savedCount}</Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Saved</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.statCard, { backgroundColor: colors.surface }]}
                        onPress={() => navigation?.navigate?.('Applications')}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="send" size={24} color="#10B981" />
                        <Text style={[styles.statValue, { color: colors.text }]}>{applicationsCount}</Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Applied</Text>
                    </TouchableOpacity>
                </View>

                {/* Jobs Near You */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            Jobs Near You
                        </Text>
                        <TouchableOpacity>
                            <Ionicons name="map-outline" size={20} color={colors.primary} />
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={colors.primary} />
                            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                                Loading jobs...
                            </Text>
                        </View>
                    ) : jobs.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="briefcase-outline" size={64} color={colors.textSecondary} />
                            <Text style={[styles.emptyText, { color: colors.text }]}>
                                No jobs found
                            </Text>
                            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                                Try adjusting your filters or check back later
                            </Text>
                        </View>
                    ) : (
                        jobs.map((job) => {
                            const matchScore = Math.floor(Math.random() * 30) + 70; // Mock match score
                            const distance = 'Remote'; // Since location is now a string

                            return (
                                <TouchableOpacity
                                    key={job._id || job.id}
                                    style={[styles.jobCard, { backgroundColor: colors.surface }]}
                                    activeOpacity={0.7}
                                    onPress={() => navigation?.navigate?.('JobDetail', { job })}
                                >
                                    {/* Company Logo & Match */}
                                    <View style={styles.jobHeader}>
                                        <View style={styles.companyLogo}>
                                            <Ionicons name="business" size={24} color={colors.primary} />
                                        </View>
                                        <View style={[styles.matchBadge, { backgroundColor: getMatchColor(matchScore) + '20' }]}>
                                            <Ionicons name="checkmark-circle" size={14} color={getMatchColor(matchScore)} />
                                            <Text style={[styles.matchText, { color: getMatchColor(matchScore) }]}>
                                                {matchScore}% Match
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Job Info */}
                                    <Text style={[styles.jobTitle, { color: colors.text }]}>
                                        {job.title}
                                    </Text>
                                    <Text style={[styles.companyName, { color: colors.textSecondary }]}>
                                        {typeof job.company === 'string' ? job.company : job.company?.name || 'Unknown Company'}
                                    </Text>

                                    {/* Details */}
                                    <View style={styles.jobDetails}>
                                        <View style={styles.detailItem}>
                                            <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                                            <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                                                {typeof job.location === 'string' ? job.location : `${job.location?.city || 'Unknown'}`}
                                            </Text>
                                        </View>
                                        {job.salary && (
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
                                                {job.level}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Tags */}
                                    <View style={styles.tags}>
                                        <View style={[styles.tag, { backgroundColor: colors.primary + '20' }]}>
                                            <Text style={[styles.tagText, { color: colors.primary }]}>
                                                {job.type}
                                            </Text>
                                        </View>
                                        {job.status === 'active' && (
                                            <View style={[styles.tag, { backgroundColor: '#10B98120' }]}>
                                                <Ionicons name="checkmark-circle" size={12} color="#10B981" />
                                                <Text style={[styles.tagText, { color: '#10B981' }]}>Active</Text>
                                            </View>
                                        )}
                                    </View>

                                    {/* Actions */}
                                    <View style={styles.jobActions}>
                                        <TouchableOpacity 
                                            style={styles.saveButton}
                                            onPress={() => handleSaveJob(job._id)}
                                        >
                                            <Ionicons 
                                                name={savedJobIds.has(job._id) ? "bookmark" : "bookmark-outline"} 
                                                size={20} 
                                                color={savedJobIds.has(job._id) ? "#F59E0B" : colors.text} 
                                            />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.applyButton, { backgroundColor: colors.primary }]}
                                            onPress={() => handleQuickApply(job)}
                                        >
                                            <Text style={styles.applyButtonText}>Quick Apply</Text>
                                        </TouchableOpacity>
                                    </View>
                                </TouchableOpacity>
                            );
                        })
                    )}
                </View>

                <View style={styles.bottomSpacing} />
            </ScrollView>

            {/* Floating Action Button */}
            <TouchableOpacity
                style={[styles.fab, { backgroundColor: colors.primary }]}
                onPress={() => navigation?.navigate?.('CreateJob')}
                activeOpacity={0.8}
            >
                <Ionicons name="add" size={28} color="#FFFFFF" />
            </TouchableOpacity>
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
    notificationButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    notificationBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#EF4444',
        width: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationBadgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '700',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        marginHorizontal: 20,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        gap: 10,
        marginBottom: 12,
    },
    searchInput: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 15,
        padding: 0,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    locationText: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 14,
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },
    filtersContainer: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        gap: 10,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        gap: 6,
    },
    filterChipText: {
        fontSize: 14,
        fontWeight: '600',
    },
    filterChipTextActive: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 12,
        marginBottom: 20,
    },
    statCard: {
        flex: 1,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
        marginTop: 8,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
    section: {
        paddingHorizontal: 20,
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
    },
    jobCard: {
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    jobHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    companyLogo: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    matchBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 4,
    },
    matchText: {
        fontSize: 12,
        fontWeight: '700',
    },
    jobTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    companyName: {
        fontSize: 14,
        marginBottom: 12,
    },
    jobDetails: {
        gap: 8,
        marginBottom: 12,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    detailText: {
        fontSize: 13,
    },
    tags: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    tagText: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    jobActions: {
        flexDirection: 'row',
        gap: 10,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    saveButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    applyButton: {
        flex: 1,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    applyButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
    fab: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    bottomSpacing: {
        height: 40,
    },
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
    },
});

export default JobsHomeScreen;
