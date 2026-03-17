/**
 * ApplicationsScreen
 * Track all job applications with status timeline
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
import { getApplicationStatusColor } from '../../utils/jobUtils';
import { ApplicationStatus } from '../../types/job.types';

interface Props {
    navigation?: any;
}

const ApplicationsScreen: React.FC<Props> = ({ navigation }) => {
    const { colors } = useTheme();
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<string>('all');

    useEffect(() => {
        loadApplications();
    }, []);

    const loadApplications = async () => {
        try {
            setLoading(true);
            const response = await jobsApi.getUserApplications(1, 100);
            setApplications(response.applications);
        } catch (error: any) {
            console.error('Failed to load applications:', error);
            Alert.alert('Error', error.message || 'Failed to load applications');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadApplications();
        setRefreshing(false);
    };

    const statusFilters: { id: string; label: string; count: number }[] = [
        { id: 'all', label: 'All', count: applications.length },
        { id: 'pending', label: 'Pending', count: applications.filter(a => a.status === 'pending').length },
        { id: 'reviewed', label: 'Reviewed', count: applications.filter(a => a.status === 'reviewed').length },
        { id: 'shortlisted', label: 'Shortlisted', count: applications.filter(a => a.status === 'shortlisted').length },
        { id: 'rejected', label: 'Rejected', count: applications.filter(a => a.status === 'rejected').length },
    ];

    const filteredApplications = filter === 'all'
        ? applications
        : applications.filter(app => app.status === filter);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return 'time';
            case 'reviewed': return 'eye';
            case 'shortlisted': return 'star';
            case 'rejected': return 'close-circle';
            case 'accepted': return 'checkmark-circle';
            default: return 'document';
        }
    };

    const getStatusLabel = (status: string) => {
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
                    <Text style={styles.headerTitle}>My Applications</Text>
                    <TouchableOpacity style={styles.headerButton}>
                        <Ionicons name="filter-outline" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>

                {/* Stats */}
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{applications.length}</Text>
                        <Text style={styles.statLabel}>Total</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>
                            {applications.filter(a => a.status === 'interview').length}
                        </Text>
                        <Text style={styles.statLabel}>Interviews</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>
                            {applications.filter(a => a.status === 'offer').length}
                        </Text>
                        <Text style={styles.statLabel}>Offers</Text>
                    </View>
                </View>
            </LinearGradient>

            {/* Filters */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filtersContainer}
            >
                {statusFilters.map((f) => (
                    <TouchableOpacity
                        key={f.id}
                        style={[
                            styles.filterChip,
                            {
                                backgroundColor: filter === f.id ? colors.primary : colors.surface,
                                borderColor: filter === f.id ? colors.primary : colors.border,
                            },
                        ]}
                        onPress={() => setFilter(f.id)}
                        activeOpacity={0.7}
                    >
                        <Text
                            style={[
                                styles.filterText,
                                { color: filter === f.id ? '#FFFFFF' : colors.text },
                            ]}
                        >
                            {f.label}
                        </Text>
                        {f.count > 0 && (
                            <View
                                style={[
                                    styles.filterBadge,
                                    {
                                        backgroundColor: filter === f.id ? 'rgba(255,255,255,0.3)' : colors.primary + '20',
                                    },
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.filterBadgeText,
                                        { color: filter === f.id ? '#FFFFFF' : colors.primary },
                                    ]}
                                >
                                    {f.count}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                ))}
            </ScrollView>

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
                            Loading applications...
                        </Text>
                    </View>
                ) : filteredApplications.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="folder-open-outline" size={64} color={colors.textSecondary} />
                        <Text style={[styles.emptyText, { color: colors.text }]}>
                            No applications found
                        </Text>
                        <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                            {filter === 'all' 
                                ? 'Start applying to jobs to see them here' 
                                : `No ${filter} applications`}
                        </Text>
                    </View>
                ) : (
                    filteredApplications.map((application) => {
                        const job = typeof application.job === 'string' ? null : application.job;
                        
                        return (
                            <TouchableOpacity
                                key={application._id}
                                style={[styles.applicationCard, { backgroundColor: colors.surface }]}
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
                                    <View
                                        style={[
                                            styles.statusBadge,
                                            { backgroundColor: getApplicationStatusColor(application.status) + '20' },
                                        ]}
                                    >
                                        <Ionicons
                                            name={getStatusIcon(application.status)}
                                            size={14}
                                            color={getApplicationStatusColor(application.status)}
                                        />
                                    </View>
                                </View>

                                {/* Status */}
                                <View style={styles.statusSection}>
                                    <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>Status:</Text>
                                    <Text
                                        style={[
                                            styles.statusText,
                                            { color: getApplicationStatusColor(application.status) },
                                        ]}
                                    >
                                        {getStatusLabel(application.status)}
                                    </Text>
                                </View>

                                {/* Applied Date */}
                                <View style={styles.dateSection}>
                                    <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                                    <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                                        Applied {formatDate(application.appliedDate || application.createdAt)}
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
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 20,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '600',
    },
    statDivider: {
        width: 1,
        backgroundColor: 'rgba(255,255,255,0.3)',
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
        borderWidth: 1.5,
        gap: 8,
    },
    filterText: {
        fontSize: 14,
        fontWeight: '600',
    },
    filterBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        minWidth: 20,
        alignItems: 'center',
    },
    filterBadgeText: {
        fontSize: 11,
        fontWeight: '700',
    },
    scrollView: {
        flex: 1,
    },
    applicationCard: {
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        gap: 12,
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
    cardInfo: {
        flex: 1,
    },
    jobTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    companyName: {
        fontSize: 14,
    },
    statusBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusSection: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
    },
    statusLabel: {
        fontSize: 14,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '700',
    },
    timeline: {
        marginBottom: 16,
    },
    timelineItem: {
        flexDirection: 'row',
        position: 'relative',
    },
    timelineDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginTop: 4,
    },
    timelineLine: {
        position: 'absolute',
        left: 5.5,
        top: 16,
        width: 1,
        height: 28,
    },
    timelineContent: {
        marginLeft: 12,
        marginBottom: 12,
    },
    timelineStatus: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 2,
    },
    timelineDate: {
        fontSize: 12,
    },
    interviewAlert: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        gap: 12,
        marginBottom: 12,
    },
    interviewInfo: {
        flex: 1,
    },
    interviewTitle: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 2,
    },
    interviewDate: {
        fontSize: 12,
    },
    prepButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#8B5CF6',
        borderRadius: 8,
    },
    prepButtonText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '600',
    },
    cardActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    appliedDate: {
        fontSize: 13,
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
        paddingVertical: 60,
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
    },
    dateSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 8,
    },
    dateText: {
        fontSize: 13,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginTop: 16,
        marginBottom: 8,
    },
    bottomSpacing: {
        height: 40,
    },
});

export default ApplicationsScreen;
