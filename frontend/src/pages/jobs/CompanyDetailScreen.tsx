/**
 * CompanyDetailScreen
 * Detailed company information with reviews and ratings
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
import { Company } from '../../types/job.types';

interface Props {
    navigation?: any;
    route?: any;
}

const CompanyDetailScreen: React.FC<Props> = ({ navigation, route }) => {
    const { colors } = useTheme();
    const company: Company = route?.params?.company;
    const [activeTab, setActiveTab] = useState<'about' | 'reviews' | 'jobs'>('about');

    if (!company) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <Text style={{ color: colors.text }}>Company not found</Text>
            </View>
        );
    }

    const reviews = [
        {
            id: '1',
            userName: 'Anonymous',
            userRole: 'Software Engineer',
            rating: 4.5,
            title: 'Great place to work',
            pros: 'Good work-life balance, supportive management, learning opportunities',
            cons: 'Could improve compensation',
            date: '2024-01-15',
        },
        {
            id: '2',
            userName: 'Anonymous',
            userRole: 'Product Manager',
            rating: 4.0,
            title: 'Innovative culture',
            pros: 'Fast-paced environment, latest technologies, smart colleagues',
            cons: 'Sometimes overwhelming workload',
            date: '2024-01-10',
        },
    ];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <LinearGradient
                colors={[colors.primary, colors.primary + 'DD']}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        onPress={() => navigation?.goBack?.()}
                        style={styles.backButton}
                    >
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Company Details</Text>
                    <TouchableOpacity style={styles.headerButton}>
                        <Ionicons name="share-social-outline" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>

                {/* Company Info */}
                <View style={styles.companyInfo}>
                    <View style={styles.companyLogo}>
                        <Ionicons name="business" size={48} color="#FFFFFF" />
                    </View>
                    <Text style={styles.companyName}>{company.name}</Text>
                    <Text style={styles.companyIndustry}>{company.industry}</Text>
                    <View style={styles.ratingRow}>
                        <Ionicons name="star" size={20} color="#F59E0B" />
                        <Text style={styles.ratingText}>{company.ratings.overall.toFixed(1)}</Text>
                        <Text style={styles.ratingCount}>({company.size} employees)</Text>
                    </View>
                </View>
            </LinearGradient>

            {/* Tabs */}
            <View style={[styles.tabs, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'about' && styles.activeTab]}
                    onPress={() => setActiveTab('about')}
                >
                    <Text style={[styles.tabText, { color: activeTab === 'about' ? colors.primary : colors.textSecondary }]}>
                        About
                    </Text>
                    {activeTab === 'about' && <View style={[styles.tabIndicator, { backgroundColor: colors.primary }]} />}
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'reviews' && styles.activeTab]}
                    onPress={() => setActiveTab('reviews')}
                >
                    <Text style={[styles.tabText, { color: activeTab === 'reviews' ? colors.primary : colors.textSecondary }]}>
                        Reviews
                    </Text>
                    {activeTab === 'reviews' && <View style={[styles.tabIndicator, { backgroundColor: colors.primary }]} />}
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'jobs' && styles.activeTab]}
                    onPress={() => setActiveTab('jobs')}
                >
                    <Text style={[styles.tabText, { color: activeTab === 'jobs' ? colors.primary : colors.textSecondary }]}>
                        Jobs
                    </Text>
                    {activeTab === 'jobs' && <View style={[styles.tabIndicator, { backgroundColor: colors.primary }]} />}
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {activeTab === 'about' && (
                    <>
                        {/* Ratings Breakdown */}
                        <View style={[styles.section, { backgroundColor: colors.surface }]}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Ratings Breakdown</Text>
                            <View style={styles.ratingsGrid}>
                                <View style={styles.ratingItem}>
                                    <Text style={[styles.ratingLabel, { color: colors.textSecondary }]}>Work-Life Balance</Text>
                                    <View style={styles.ratingBar}>
                                        <View style={[styles.ratingFill, { width: `${(company.ratings.workLife / 5) * 100}%`, backgroundColor: colors.primary }]} />
                                    </View>
                                    <Text style={[styles.ratingValue, { color: colors.text }]}>{company.ratings.workLife.toFixed(1)}</Text>
                                </View>
                                <View style={styles.ratingItem}>
                                    <Text style={[styles.ratingLabel, { color: colors.textSecondary }]}>Culture & Values</Text>
                                    <View style={styles.ratingBar}>
                                        <View style={[styles.ratingFill, { width: `${(company.ratings.culture / 5) * 100}%`, backgroundColor: colors.primary }]} />
                                    </View>
                                    <Text style={[styles.ratingValue, { color: colors.text }]}>{company.ratings.culture.toFixed(1)}</Text>
                                </View>
                                <View style={styles.ratingItem}>
                                    <Text style={[styles.ratingLabel, { color: colors.textSecondary }]}>Career Growth</Text>
                                    <View style={styles.ratingBar}>
                                        <View style={[styles.ratingFill, { width: `${(company.ratings.growth / 5) * 100}%`, backgroundColor: colors.primary }]} />
                                    </View>
                                    <Text style={[styles.ratingValue, { color: colors.text }]}>{company.ratings.growth.toFixed(1)}</Text>
                                </View>
                                <View style={styles.ratingItem}>
                                    <Text style={[styles.ratingLabel, { color: colors.textSecondary }]}>Compensation</Text>
                                    <View style={styles.ratingBar}>
                                        <View style={[styles.ratingFill, { width: `${(company.ratings.compensation / 5) * 100}%`, backgroundColor: colors.primary }]} />
                                    </View>
                                    <Text style={[styles.ratingValue, { color: colors.text }]}>{company.ratings.compensation.toFixed(1)}</Text>
                                </View>
                            </View>
                        </View>

                        {/* About */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>About {company.name}</Text>
                            <Text style={[styles.description, { color: colors.textSecondary }]}>{company.description}</Text>
                        </View>

                        {/* Benefits */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Benefits & Perks</Text>
                            <View style={styles.benefitsGrid}>
                                {company.benefits.map((benefit, index) => (
                                    <View key={index} style={[styles.benefitCard, { backgroundColor: colors.surface }]}>
                                        <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                                        <Text style={[styles.benefitText, { color: colors.text }]}>{benefit}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* Company Info */}
                        <View style={[styles.section, { backgroundColor: colors.surface }]}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Company Information</Text>
                            <View style={styles.infoRow}>
                                <Ionicons name="business-outline" size={20} color={colors.textSecondary} />
                                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Industry:</Text>
                                <Text style={[styles.infoValue, { color: colors.text }]}>{company.industry}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Ionicons name="people-outline" size={20} color={colors.textSecondary} />
                                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Company Size:</Text>
                                <Text style={[styles.infoValue, { color: colors.text }]}>{company.size} employees</Text>
                            </View>
                            {company.founded && (
                                <View style={styles.infoRow}>
                                    <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
                                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Founded:</Text>
                                    <Text style={[styles.infoValue, { color: colors.text }]}>{company.founded}</Text>
                                </View>
                            )}
                            <View style={styles.infoRow}>
                                <Ionicons name="globe-outline" size={20} color={colors.textSecondary} />
                                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Website:</Text>
                                <Text style={[styles.infoValue, { color: colors.primary }]}>{company.website}</Text>
                            </View>
                        </View>
                    </>
                )}

                {activeTab === 'reviews' && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Employee Reviews</Text>
                        {reviews.map((review) => (
                            <View key={review.id} style={[styles.reviewCard, { backgroundColor: colors.surface }]}>
                                <View style={styles.reviewHeader}>
                                    <View>
                                        <Text style={[styles.reviewerName, { color: colors.text }]}>{review.userName}</Text>
                                        <Text style={[styles.reviewerRole, { color: colors.textSecondary }]}>{review.userRole}</Text>
                                    </View>
                                    <View style={styles.reviewRating}>
                                        <Ionicons name="star" size={16} color="#F59E0B" />
                                        <Text style={[styles.reviewRatingText, { color: colors.text }]}>{review.rating.toFixed(1)}</Text>
                                    </View>
                                </View>
                                <Text style={[styles.reviewTitle, { color: colors.text }]}>{review.title}</Text>
                                <View style={styles.reviewSection}>
                                    <Text style={[styles.reviewLabel, { color: '#10B981' }]}>Pros:</Text>
                                    <Text style={[styles.reviewText, { color: colors.textSecondary }]}>{review.pros}</Text>
                                </View>
                                <View style={styles.reviewSection}>
                                    <Text style={[styles.reviewLabel, { color: '#EF4444' }]}>Cons:</Text>
                                    <Text style={[styles.reviewText, { color: colors.textSecondary }]}>{review.cons}</Text>
                                </View>
                                <Text style={[styles.reviewDate, { color: colors.textTertiary }]}>
                                    {new Date(review.date).toLocaleDateString()}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                {activeTab === 'jobs' && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Open Positions</Text>
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                            View all jobs from this company in the Jobs tab
                        </Text>
                    </View>
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
    companyInfo: {
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    companyLogo: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    companyName: {
        fontSize: 24,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    companyIndustry: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
        marginBottom: 12,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    ratingText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    ratingCount: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
    },
    tabs: {
        flexDirection: 'row',
        borderBottomWidth: 1,
    },
    tab: {
        flex: 1,
        paddingVertical: 16,
        alignItems: 'center',
        position: 'relative',
    },
    activeTab: {},
    tabText: {
        fontSize: 15,
        fontWeight: '600',
    },
    tabIndicator: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 3,
        borderTopLeftRadius: 3,
        borderTopRightRadius: 3,
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
        marginBottom: 16,
    },
    ratingsGrid: {
        gap: 16,
    },
    ratingItem: {
        gap: 8,
    },
    ratingLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    ratingBar: {
        height: 8,
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
        overflow: 'hidden',
    },
    ratingFill: {
        height: '100%',
        borderRadius: 4,
    },
    ratingValue: {
        fontSize: 14,
        fontWeight: '700',
        textAlign: 'right',
    },
    description: {
        fontSize: 15,
        lineHeight: 24,
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
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    infoLabel: {
        fontSize: 14,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
    },
    reviewCard: {
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    reviewerName: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 2,
    },
    reviewerRole: {
        fontSize: 13,
    },
    reviewRating: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    reviewRatingText: {
        fontSize: 14,
        fontWeight: '700',
    },
    reviewTitle: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 12,
    },
    reviewSection: {
        marginBottom: 12,
    },
    reviewLabel: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 4,
    },
    reviewText: {
        fontSize: 14,
        lineHeight: 22,
    },
    reviewDate: {
        fontSize: 12,
        marginTop: 8,
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
        paddingVertical: 40,
    },
    bottomSpacing: {
        height: 40,
    },
});

export default CompanyDetailScreen;
