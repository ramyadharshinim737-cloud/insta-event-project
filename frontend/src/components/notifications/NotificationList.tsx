/**
 * NotificationList Component
 * Grouped notification list with time sections (Today, Yesterday, This Week)
 * Includes empty states and loading skeletons
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Notification, TimeGroup } from '../../types/notification.types';
import {
    groupNotificationsByTime,
    getTimeGroupLabel,
} from '../../utils/notificationUtils';
import NotificationItem from './NotificationItem';

interface NotificationListProps {
    notifications: Notification[];
    loading?: boolean;
    onNotificationPress: (notification: Notification) => void;
    onMarkAsRead?: (notificationId: string) => void;
    onActionPress?: (notificationId: string, actionType: string) => void;
    showSkeleton?: boolean;
}

const NotificationList: React.FC<NotificationListProps> = ({
    notifications,
    loading = false,
    onNotificationPress,
    onMarkAsRead,
    onActionPress,
    showSkeleton = false,
}) => {
    const { colors } = useTheme();

    // Show loading skeleton
    if (loading || showSkeleton) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                    Loading notifications...
                </Text>
            </View>
        );
    }

    // Show empty state
    if (notifications.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <View
                    style={[
                        styles.emptyIconContainer,
                        { backgroundColor: colors.isDark ? '#1F2937' : '#F3F4F6' },
                    ]}
                >
                    <Ionicons
                        name="notifications-off-outline"
                        size={64}
                        color={colors.textTertiary}
                    />
                </View>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                    No notifications yet
                </Text>
                <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                    When you get notifications, they'll show up here
                </Text>
            </View>
        );
    }

    // Group notifications by time
    const groupedNotifications = groupNotificationsByTime(notifications);

    // Define the order of time groups to display
    const timeGroups: TimeGroup[] = ['today', 'yesterday', 'thisWeek', 'older'];

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: colors.background }]}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
            accessible={true}
            accessibilityLabel="Notifications list"
        >
            {timeGroups.map((group) => {
                const groupNotifications = groupedNotifications[group];

                // Skip empty groups
                if (groupNotifications.length === 0) {
                    return null;
                }

                return (
                    <View key={group} style={styles.section}>
                        {/* Section Header */}
                        <View
                            style={[
                                styles.sectionHeader,
                                { backgroundColor: colors.background },
                            ]}
                        >
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                {getTimeGroupLabel(group)}
                            </Text>
                            <View style={styles.sectionDivider} />
                        </View>

                        {/* Notification Items */}
                        <View
                            style={[
                                styles.sectionContent,
                                { backgroundColor: colors.card },
                            ]}
                        >
                            {groupNotifications.map((notification, index) => (
                                <NotificationItem
                                    key={notification.id}
                                    notification={notification}
                                    onPress={onNotificationPress}
                                    onMarkAsRead={onMarkAsRead}
                                    onActionPress={onActionPress}
                                />
                            ))}
                        </View>
                    </View>
                );
            })}

            {/* Bottom spacing */}
            <View style={styles.bottomSpacing} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        paddingTop: 8,
    },
    section: {
        marginBottom: 16,
    },
    sectionHeader: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 0.3,
        textTransform: 'uppercase',
    },
    sectionDivider: {
        flex: 1,
        height: 1,
        backgroundColor: '#E5E7EB',
        marginLeft: 12,
    },
    sectionContent: {
        borderRadius: 0,
        overflow: 'hidden',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 80,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 14,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 80,
        paddingHorizontal: 32,
    },
    emptyIconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
    bottomSpacing: {
        height: 24,
    },
});

export default NotificationList;
