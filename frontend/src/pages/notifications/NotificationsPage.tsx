/**
 * Enhanced NotificationsPage Component
 * Full-screen professional notification view with all features
 * Instagram/LinkedIn style with grouping, filters, and actions
 */

import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
    StatusBar,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Notification } from '../../types/notification.types';
import {
    markAsRead,
    markAllAsRead,
    countUnreadNotifications,
} from '../../utils/notificationUtils';
import { getMockNotifications } from '../../data/mockNotifications';
import NotificationList from '../../components/notifications/NotificationList';
import NotificationBadge from '../../components/notifications/NotificationBadge';

interface Props {
    navigation?: any;
}

type FilterType = 'all' | 'unread';

const NotificationsPage: React.FC<Props> = ({ navigation }) => {
    const { colors } = useTheme();
    const [filter, setFilter] = useState<FilterType>('all');
    const [notifications, setNotifications] = useState<Notification[]>(
        getMockNotifications()
    );
    const [loading, setLoading] = useState(false);

    const unreadCount = countUnreadNotifications(notifications);

    const filteredNotifications =
        filter === 'unread'
            ? notifications.filter((n) => !n.read)
            : notifications;

    // Handle notification press
    const handleNotificationPress = useCallback(
        (notification: Notification) => {
            // Mark as read
            if (!notification.read) {
                setNotifications((prev) => markAsRead(prev, notification.id));
            }

            // Navigate based on notification type
            switch (notification.type) {
                case 'event':
                    // Navigate to event detail
                    Alert.alert('Navigate', `Opening event: ${notification.content}`);
                    break;
                case 'message':
                    // Navigate to chat
                    navigation?.navigate?.('Messages');
                    break;
                case 'connection':
                    // Navigate to profile
                    Alert.alert('Navigate', `Opening profile: ${notification.user.name}`);
                    break;
                default:
                    Alert.alert('Notification', notification.content);
            }
        },
        [navigation]
    );

    // Handle mark single as read
    const handleMarkAsRead = useCallback((notificationId: string) => {
        setNotifications((prev) => markAsRead(prev, notificationId));
    }, []);

    // Handle mark all as read
    const handleMarkAllAsRead = useCallback(() => {
        setNotifications((prev) => markAllAsRead(prev));
        Alert.alert('Success', 'All notifications marked as read');
    }, []);

    // Handle action button press
    const handleActionPress = useCallback(
        (notificationId: string, actionType: string) => {
            const notification = notifications.find((n) => n.id === notificationId);
            if (!notification) return;

            switch (actionType) {
                case 'accept':
                    Alert.alert(
                        'Connection Accepted',
                        `You are now connected with ${notification.user.name}`
                    );
                    // Mark as read and remove from list
                    setNotifications((prev) =>
                        prev.map((n) =>
                            n.id === notificationId ? { ...n, read: true, actionable: false } : n
                        )
                    );
                    break;
                case 'reject':
                    Alert.alert('Connection Rejected', 'Request declined');
                    setNotifications((prev) =>
                        prev.map((n) =>
                            n.id === notificationId ? { ...n, read: true, actionable: false } : n
                        )
                    );
                    break;
                case 'view':
                    handleNotificationPress(notification);
                    break;
                case 'reply':
                    navigation?.navigate?.('Chat', {
                        chatId: notification.user.id,
                        chatName: notification.user.name,
                    });
                    break;
            }
        },
        [notifications, navigation, handleNotificationPress]
    );

    return (
        <SafeAreaView
            style={[styles.container, { backgroundColor: colors.background }]}
            edges={['left', 'right', 'bottom']}
        >
            <StatusBar
                barStyle="light-content"
                backgroundColor="#0A66C2"
                translucent={false}
            />

            {/* Enhanced Header with Gradient */}
            <LinearGradient
                colors={['#0A66C2', '#378FE9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.headerGradient}
            >
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => navigation?.goBack?.()}
                        style={styles.backButton}
                        activeOpacity={0.7}
                        accessible={true}
                        accessibilityLabel="Go back"
                        accessibilityRole="button"
                    >
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>

                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle} numberOfLines={1}>
                            Notifications
                        </Text>
                        {unreadCount > 0 && (
                            <NotificationBadge count={unreadCount} size="small" />
                        )}
                    </View>

                    <View style={styles.headerRight}>
                        {unreadCount > 0 && (
                            <TouchableOpacity
                                style={styles.markReadButton}
                                activeOpacity={0.7}
                                onPress={handleMarkAllAsRead}
                                accessible={true}
                                accessibilityLabel="Mark all as read"
                                accessibilityRole="button"
                            >
                                <Ionicons name="checkmark-done" size={22} color="#FFFFFF" />
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            style={styles.iconButton}
                            activeOpacity={0.7}
                            accessible={true}
                            accessibilityLabel="Notification settings"
                            accessibilityRole="button"
                        >
                            <Ionicons name="settings-outline" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                </View>
            </LinearGradient>

            {/* Filter Tabs */}
            <View
                style={[
                    styles.filterContainer,
                    {
                        backgroundColor: colors.card,
                        borderBottomColor: colors.border,
                    },
                ]}
            >
                <TouchableOpacity
                    style={[
                        styles.filterTab,
                        filter === 'all' && styles.filterTabActive,
                    ]}
                    onPress={() => setFilter('all')}
                    activeOpacity={0.7}
                    accessible={true}
                    accessibilityLabel="Show all notifications"
                    accessibilityRole="button"
                    accessibilityState={{ selected: filter === 'all' }}
                >
                    <Text
                        style={[
                            styles.filterText,
                            { color: colors.textSecondary },
                            filter === 'all' && styles.filterTextActive,
                        ]}
                    >
                        All
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.filterTab,
                        filter === 'unread' && styles.filterTabActive,
                    ]}
                    onPress={() => setFilter('unread')}
                    activeOpacity={0.7}
                    accessible={true}
                    accessibilityLabel={`Show unread notifications, ${unreadCount} unread`}
                    accessibilityRole="button"
                    accessibilityState={{ selected: filter === 'unread' }}
                >
                    <Text
                        style={[
                            styles.filterText,
                            { color: colors.textSecondary },
                            filter === 'unread' && styles.filterTextActive,
                        ]}
                    >
                        Unread {unreadCount > 0 && `(${unreadCount})`}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Notification List */}
            <NotificationList
                notifications={filteredNotifications}
                loading={loading}
                onNotificationPress={handleNotificationPress}
                onMarkAsRead={handleMarkAsRead}
                onActionPress={handleActionPress}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerGradient: {
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 4,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        padding: 4,
        marginRight: 12,
    },
    headerCenter: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 0.3,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        padding: 4,
        marginLeft: 8,
    },
    markReadButton: {
        padding: 4,
        marginLeft: 4,
    },
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        gap: 12,
    },
    filterTab: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
    },
    filterTabActive: {
        backgroundColor: '#0A66C2',
    },
    filterText: {
        fontSize: 14,
        fontWeight: '600',
    },
    filterTextActive: {
        color: '#FFFFFF',
    },
});

export default NotificationsPage;
