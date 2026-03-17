/**
 * JobSearchScreen
 * Advanced job search with comprehensive filters
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
import { JobSearchFilters } from '../../types/jobEnhancements.types';
import { getMockJobs } from '../../data/mockJobs';

interface Props {
    navigation?: any;
}

const JobSearchScreen: React.FC<Props> = ({ navigation }) => {
    const { colors } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<JobSearchFilters>({
        keywords: '',
        location: {
            city: 'Bengaluru',
            latitude: 12.9716,
            longitude: 77.5946,
            radius: 10,
        },
        salary: { min: 0, max: 10000000 },
        experience: { min: 0, max: 20 },
        workMode: [],
        jobType: [],
        companyType: [],
        postedWithin: 30,
    });

    const jobs = getMockJobs();
    const radiusOptions = [5, 10, 25, 50, 100];
    const workModes = ['remote', 'hybrid', 'onsite'];
    const jobTypes = ['full-time', 'part-time', 'internship', 'contract'];
    const companyTypes = ['startup', 'mnc', 'sme'];

    const activeFilterCount =
        filters.workMode.length +
        filters.jobType.length +
        filters.companyType.length +
        (filters.salary.min > 0 || filters.salary.max < 10000000 ? 1 : 0) +
        (filters.experience.min > 0 || filters.experience.max < 20 ? 1 : 0);

    const handleSaveSearch = () => {
        Alert.alert('Search Saved', 'You will receive alerts for new matching jobs');
    };

    const handleClearFilters = () => {
        setFilters({
            keywords: '',
            location: {
                city: 'Bengaluru',
                latitude: 12.9716,
                longitude: 77.5946,
                radius: 10,
            },
            salary: { min: 0, max: 10000000 },
            experience: { min: 0, max: 20 },
            workMode: [],
            jobType: [],
            companyType: [],
            postedWithin: 30,
        });
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.header}>
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation?.goBack?.()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Job Search</Text>
                    <TouchableOpacity onPress={handleSaveSearch} style={styles.headerButton}>
                        <Ionicons name="bookmark-outline" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="rgba(255,255,255,0.7)" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Job title, keywords, or company"
                        placeholderTextColor="rgba(255,255,255,0.7)"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color="rgba(255,255,255,0.7)" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Location & Radius */}
                <View style={styles.locationRow}>
                    <View style={styles.locationInfo}>
                        <Ionicons name="location" size={16} color="rgba(255,255,255,0.9)" />
                        <Text style={styles.locationText}>{filters.location.city}</Text>
                    </View>
                    <View style={styles.radiusSelector}>
                        <Ionicons name="navigate-circle" size={16} color="rgba(255,255,255,0.9)" />
                        <Text style={styles.radiusText}>Within {filters.location.radius}km</Text>
                    </View>
                </View>
            </LinearGradient>

            {/* Filter Toggle */}
            <View style={styles.filterToggleRow}>
                <TouchableOpacity
                    style={[styles.filterButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    onPress={() => setShowFilters(!showFilters)}
                >
                    <Ionicons name="options-outline" size={20} color={colors.text} />
                    <Text style={[styles.filterButtonText, { color: colors.text }]}>Filters</Text>
                    {activeFilterCount > 0 && (
                        <View style={[styles.filterBadge, { backgroundColor: colors.primary }]}>
                            <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
                        </View>
                    )}
                </TouchableOpacity>

                {activeFilterCount > 0 && (
                    <TouchableOpacity onPress={handleClearFilters}>
                        <Text style={[styles.clearText, { color: colors.primary }]}>Clear All</Text>
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Filters Section */}
                {showFilters && (
                    <View style={[styles.filtersSection, { backgroundColor: colors.surface }]}>
                        {/* Radius Selector */}
                        <View style={styles.filterGroup}>
                            <Text style={[styles.filterLabel, { color: colors.text }]}>Search Radius</Text>
                            <View style={styles.radiusOptions}>
                                {radiusOptions.map((radius) => (
                                    <TouchableOpacity
                                        key={radius}
                                        style={[
                                            styles.radiusChip,
                                            {
                                                backgroundColor: filters.location.radius === radius ? colors.primary : colors.background,
                                                borderColor: filters.location.radius === radius ? colors.primary : colors.border,
                                            },
                                        ]}
                                        onPress={() => setFilters({ ...filters, location: { ...filters.location, radius } })}
                                    >
                                        <Text
                                            style={[
                                                styles.radiusChipText,
                                                { color: filters.location.radius === radius ? '#FFFFFF' : colors.text },
                                            ]}
                                        >
                                            {radius}km
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Work Mode */}
                        <View style={styles.filterGroup}>
                            <Text style={[styles.filterLabel, { color: colors.text }]}>Work Mode</Text>
                            <View style={styles.filterChips}>
                                {workModes.map((mode) => (
                                    <TouchableOpacity
                                        key={mode}
                                        style={[
                                            styles.filterChip,
                                            {
                                                backgroundColor: filters.workMode.includes(mode as any) ? colors.primary : colors.background,
                                                borderColor: filters.workMode.includes(mode as any) ? colors.primary : colors.border,
                                            },
                                        ]}
                                        onPress={() => {
                                            const newModes = filters.workMode.includes(mode as any)
                                                ? filters.workMode.filter(m => m !== mode)
                                                : [...filters.workMode, mode as any];
                                            setFilters({ ...filters, workMode: newModes });
                                        }}
                                    >
                                        <Text
                                            style={[
                                                styles.filterChipText,
                                                { color: filters.workMode.includes(mode as any) ? '#FFFFFF' : colors.text },
                                            ]}
                                        >
                                            {mode.charAt(0).toUpperCase() + mode.slice(1)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Job Type */}
                        <View style={styles.filterGroup}>
                            <Text style={[styles.filterLabel, { color: colors.text }]}>Job Type</Text>
                            <View style={styles.filterChips}>
                                {jobTypes.map((type) => (
                                    <TouchableOpacity
                                        key={type}
                                        style={[
                                            styles.filterChip,
                                            {
                                                backgroundColor: filters.jobType.includes(type as any) ? colors.primary : colors.background,
                                                borderColor: filters.jobType.includes(type as any) ? colors.primary : colors.border,
                                            },
                                        ]}
                                        onPress={() => {
                                            const newTypes = filters.jobType.includes(type as any)
                                                ? filters.jobType.filter(t => t !== type)
                                                : [...filters.jobType, type as any];
                                            setFilters({ ...filters, jobType: newTypes });
                                        }}
                                    >
                                        <Text
                                            style={[
                                                styles.filterChipText,
                                                { color: filters.jobType.includes(type as any) ? '#FFFFFF' : colors.text },
                                            ]}
                                        >
                                            {type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Company Type */}
                        <View style={styles.filterGroup}>
                            <Text style={[styles.filterLabel, { color: colors.text }]}>Company Type</Text>
                            <View style={styles.filterChips}>
                                {companyTypes.map((type) => (
                                    <TouchableOpacity
                                        key={type}
                                        style={[
                                            styles.filterChip,
                                            {
                                                backgroundColor: filters.companyType.includes(type as any) ? colors.primary : colors.background,
                                                borderColor: filters.companyType.includes(type as any) ? colors.primary : colors.border,
                                            },
                                        ]}
                                        onPress={() => {
                                            const newTypes = filters.companyType.includes(type as any)
                                                ? filters.companyType.filter(t => t !== type)
                                                : [...filters.companyType, type as any];
                                            setFilters({ ...filters, companyType: newTypes });
                                        }}
                                    >
                                        <Text
                                            style={[
                                                styles.filterChipText,
                                                { color: filters.companyType.includes(type as any) ? '#FFFFFF' : colors.text },
                                            ]}
                                        >
                                            {type.toUpperCase()}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Experience Range */}
                        <View style={styles.filterGroup}>
                            <Text style={[styles.filterLabel, { color: colors.text }]}>
                                Experience: {filters.experience.min}-{filters.experience.max} years
                            </Text>
                            <View style={styles.rangeInputs}>
                                <TextInput
                                    style={[styles.rangeInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                                    placeholder="Min"
                                    placeholderTextColor={colors.textTertiary}
                                    keyboardType="numeric"
                                    value={filters.experience.min.toString()}
                                    onChangeText={(text) => setFilters({ ...filters, experience: { ...filters.experience, min: parseInt(text) || 0 } })}
                                />
                                <Text style={[styles.rangeSeparator, { color: colors.textSecondary }]}>to</Text>
                                <TextInput
                                    style={[styles.rangeInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                                    placeholder="Max"
                                    placeholderTextColor={colors.textTertiary}
                                    keyboardType="numeric"
                                    value={filters.experience.max.toString()}
                                    onChangeText={(text) => setFilters({ ...filters, experience: { ...filters.experience, max: parseInt(text) || 20 } })}
                                />
                            </View>
                        </View>

                        {/* Salary Range */}
                        <View style={styles.filterGroup}>
                            <Text style={[styles.filterLabel, { color: colors.text }]}>
                                Salary: ₹{(filters.salary.min / 100000).toFixed(0)}L - ₹{(filters.salary.max / 100000).toFixed(0)}L
                            </Text>
                            <View style={styles.rangeInputs}>
                                <TextInput
                                    style={[styles.rangeInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                                    placeholder="Min (Lakhs)"
                                    placeholderTextColor={colors.textTertiary}
                                    keyboardType="numeric"
                                    value={(filters.salary.min / 100000).toString()}
                                    onChangeText={(text) => setFilters({ ...filters, salary: { ...filters.salary, min: (parseInt(text) || 0) * 100000 } })}
                                />
                                <Text style={[styles.rangeSeparator, { color: colors.textSecondary }]}>to</Text>
                                <TextInput
                                    style={[styles.rangeInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                                    placeholder="Max (Lakhs)"
                                    placeholderTextColor={colors.textTertiary}
                                    keyboardType="numeric"
                                    value={(filters.salary.max / 100000).toString()}
                                    onChangeText={(text) => setFilters({ ...filters, salary: { ...filters.salary, max: (parseInt(text) || 100) * 100000 } })}
                                />
                            </View>
                        </View>
                    </View>
                )}

                {/* Results */}
                <View style={styles.resultsSection}>
                    <Text style={[styles.resultsCount, { color: colors.text }]}>
                        {jobs.length} jobs found
                    </Text>
                    <Text style={[styles.resultsHint, { color: colors.textSecondary }]}>
                        Based on your search and filters
                    </Text>
                </View>

                <View style={styles.bottomSpacing} />
            </ScrollView>

            {/* Apply Filters Button */}
            {showFilters && (
                <View style={[styles.bottomBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
                    <TouchableOpacity
                        style={[styles.applyButton, { backgroundColor: colors.primary }]}
                        onPress={() => setShowFilters(false)}
                    >
                        <Text style={styles.applyButtonText}>Apply Filters</Text>
                        <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            )}
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
    locationRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    locationInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    locationText: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 14,
        fontWeight: '600',
    },
    radiusSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    radiusText: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 14,
        fontWeight: '600',
    },
    filterToggleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1.5,
    },
    filterButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    filterBadge: {
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterBadgeText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '700',
    },
    clearText: {
        fontSize: 14,
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },
    filtersSection: {
        padding: 20,
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 16,
    },
    filterGroup: {
        marginBottom: 20,
    },
    filterLabel: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 12,
    },
    radiusOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    radiusChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1.5,
    },
    radiusChipText: {
        fontSize: 13,
        fontWeight: '600',
    },
    filterChips: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    filterChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1.5,
    },
    filterChipText: {
        fontSize: 13,
        fontWeight: '600',
    },
    rangeInputs: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    rangeInput: {
        flex: 1,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 10,
        fontSize: 14,
        borderWidth: 1.5,
    },
    rangeSeparator: {
        fontSize: 14,
        fontWeight: '600',
    },
    resultsSection: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    resultsCount: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    resultsHint: {
        fontSize: 13,
    },
    bottomSpacing: {
        height: 40,
    },
    bottomBar: {
        padding: 16,
        borderTopWidth: 1,
    },
    applyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 12,
    },
    applyButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});

export default JobSearchScreen;
