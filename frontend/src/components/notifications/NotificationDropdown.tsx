/**
 * NotificationDropdown Component
 * In-app notification dropdown overlay with slide-in animation
 * Instagram/LinkedIn style dropdown menu
 */

import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
    Modal,
    TouchableWithoutFeedback,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Notification } from '../../types/notification.types';
import NotificationList from './NotificationList';
import NotificationBadge from './NotificationBadge';

const SCREEN_WIDTH = Dimensions.get('window').width;
const DROPDOWN_WIDTH = Math.min(SCREEN_WIDTH - 32, 400);

interface NotificationDropdownProps {
    visible: boolean;
    notifications: Notification[];
    unreadCount: number;
    onClose: () => void;
    onNotificationPress: (notification: Notification) => void;
    onMarkAsRead?: (notificationId: string) => void;
    onMarkAllAsRead?: () => void;
    onViewAll?: () => void;
    onActionPress?: (notificationId: string, actionType: string) => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
    visible,
    notifications,
    unreadCount,
    onClose,
    onNotificationPress,
    onMarkAsRead,
    onMarkAllAsRead,
    onViewAll,
    onActionPress,
}) => {
    const { colors } = useTheme();
    const slideAnim = useRef(new Animated.Value(-300)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            // Slide in and fade in
            Animated.parallel([
                Animated.spring(slideAnim, {
                    toValue: 0,
                    useNativeDriver: true,
                    tension: 65,
                    friction: 11,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            // Slide out and fade out
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: -300,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    // Show only recent notifications (max 5)
    const recentNotifications = notifications.slice(0, 5);

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="none"
            onRequestClose={onClose}
            statusBarTranslucent={true}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <Animated.View
                        style={[
                            styles.backdrop,
                            {
                                opacity: fadeAnim,
                            },
                        ]}
                    />
                </View>
            </TouchableWithoutFeedback>

            <Animated.View
                style={[
                    styles.dropdown,
                    {
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                        transform: [{ translateY: slideAnim }],
                        opacity: fadeAnim,
                    },
                ]}
            >
                {/* Header */}
                <View
                    style={[
                        styles.header,
                        { borderBottomColor: colors.border },
                    ]}
                >
                    <View style={styles.headerLeft}>
                        <Text style={[styles.headerTitle, { color: colors.text }]}>
                            Notifications
                        </Text>
                        {unreadCount > 0 && (
                            <NotificationBadge count={unreadCount} size="small" />
                        )}
                    </View>

                    <View style={styles.headerRight}>
                        {unreadCount > 0 && onMarkAllAsRead && (
                            <TouchableOpacity
                                onPress={onMarkAllAsRead}
                                style={styles.headerButton}
                                activeOpacity={0.7}
                                accessible={true}
                                accessibilityLabel="Mark all as read"
                                accessibilityRole="button"
                            >
                                <Ionicons
                                    name="checkmark-done"
                                    size={20}
                                    color={colors.primary}
                                />
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            onPress={onClose}
                            style={styles.headerButton}
                            activeOpacity={0.7}
                            accessible={true}
                            accessibilityLabel="Close notifications"
                            accessibilityRole="button"
                        >
                            <Ionicons name="close" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Notification List */}
                <View style={styles.listContainer}>
                    <NotificationList
                        notifications={recentNotifications}
                        onNotificationPress={(notification) => {
                            onNotificationPress(notification);
                            onClose();
                        }}
                        onMarkAsRead={onMarkAsRead}
                        onActionPress={onActionPress}
                    />
                </View>

                {/* Footer */}
                {notifications.length > 5 && onViewAll && (
                    <TouchableOpacity
                        style={[
                            styles.footer,
                            {
                                backgroundColor: colors.card,
                                borderTopColor: colors.border,
                            },
                        ]}
                        onPress={() => {
                            onViewAll();
                            onClose();
                        }}
                        activeOpacity={0.7}
                        accessible={true}
                        accessibilityLabel="View all notifications"
                        accessibilityRole="button"
                    >
                        <Text style={[styles.footerText, { color: colors.primary }]}>
                            View All Notifications
                        </Text>
                        <Ionicons
                            name="chevron-forward"
                            size={18}
                            color={colors.primary}
                        />
                    </TouchableOpacity>
                )}
            </Animated.View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    dropdown: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 60 : 80,
        right: 16,
        width: DROPDOWN_WIDTH,
        maxHeight: 500,
        borderRadius: 12,
        borderWidth: 1,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerButton: {
        padding: 4,
    },
    listContainer: {
        maxHeight: 400,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderTopWidth: 1,
        gap: 6,
    },
    footerText: {
        fontSize: 14,
        fontWeight: '600',
    },
});

export default NotificationDropdown;
