/**
 * NotificationItem Component
 * Individual notification card with avatar, content, timestamp, and actions
 * Professional design matching Instagram/LinkedIn
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Notification } from '../../types/notification.types';
import {
    formatNotificationTime,
    getNotificationIcon,
    getNotificationColor,
} from '../../utils/notificationUtils';

interface NotificationItemProps {
    notification: Notification;
    onPress: (notification: Notification) => void;
    onMarkAsRead?: (notificationId: string) => void;
    onActionPress?: (notificationId: string, actionType: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
    notification,
    onPress,
    onMarkAsRead,
    onActionPress,
}) => {
    const { colors } = useTheme();

    const handlePress = () => {
        // Mark as read when pressed
        if (!notification.read && onMarkAsRead) {
            onMarkAsRead(notification.id);
        }
        onPress(notification);
    };

    const handleActionPress = (actionType: string) => {
        if (onActionPress) {
            onActionPress(notification.id, actionType);
        }
    };

    return (
        <TouchableOpacity
            style={[
                styles.container,
                {
                    backgroundColor: notification.read
                        ? colors.card
                        : colors.isDark
                            ? 'rgba(10, 102, 194, 0.1)'
                            : '#E7F3FF',
                    borderBottomColor: colors.border,
                },
            ]}
            onPress={handlePress}
            activeOpacity={0.7}
            accessible={true}
            accessibilityLabel={`${notification.user.name} ${notification.content}`}
            accessibilityRole="button"
            accessibilityState={{ selected: !notification.read }}
        >
            {/* Avatar with notification type icon */}
            <View style={styles.avatarContainer}>
                <Image
                    source={{ uri: notification.user.avatar }}
                    style={styles.avatar}
                    accessibilityLabel={`${notification.user.name}'s avatar`}
                />
                {/* Type indicator badge */}
                <View
                    style={[
                        styles.typeBadge,
                        { backgroundColor: getNotificationColor(notification.type) },
                    ]}
                >
                    <Ionicons
                        name={getNotificationIcon(notification.type) as any}
                        size={12}
                        color="#FFFFFF"
                    />
                </View>
            </View>

            {/* Content */}
            <View style={styles.content}>
                {/* Text content */}
                <View style={styles.textContainer}>
                    <Text
                        style={[styles.text, { color: colors.text }]}
                        numberOfLines={2}
                    >
                        <Text style={styles.username}>{notification.user.name}</Text>
                        {notification.user.verified && (
                            <Text> </Text>
                        )}
                        {notification.user.verified && (
                            <Ionicons name="checkmark-circle" size={14} color="#0095f6" />
                        )}
                        <Text style={{ color: colors.textSecondary }}>
                            {' '}
                            {notification.content}
                        </Text>
                    </Text>

                    {/* Timestamp */}
                    <Text style={[styles.timestamp, { color: colors.textTertiary }]}>
                        {formatNotificationTime(notification.timestamp)}
                    </Text>
                </View>

                {/* Action buttons */}
                {notification.actionable && notification.actions && (
                    <View style={styles.actionsContainer}>
                        {notification.actions.map((action, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.actionButton,
                                    action.type === 'accept' && styles.acceptButton,
                                    action.type === 'reject' && styles.rejectButton,
                                    action.type === 'view' && [
                                        styles.viewButton,
                                        { borderColor: colors.border },
                                    ],
                                    action.type === 'reply' && [
                                        styles.replyButton,
                                        { backgroundColor: colors.primary },
                                    ],
                                ]}
                                onPress={() => handleActionPress(action.type)}
                                activeOpacity={0.8}
                                accessible={true}
                                accessibilityLabel={action.label}
                                accessibilityRole="button"
                            >
                                <Text
                                    style={[
                                        styles.actionText,
                                        action.type === 'accept' && styles.acceptText,
                                        action.type === 'reject' && styles.rejectText,
                                        action.type === 'view' && { color: colors.text },
                                        action.type === 'reply' && styles.replyText,
                                    ]}
                                >
                                    {action.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>

            {/* Unread indicator dot */}
            {!notification.read && (
                <View style={styles.unreadDot} accessible={false} />
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: 12,
        borderBottomWidth: 0.5,
        position: 'relative',
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 12,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#E1E8ED',
    },
    typeBadge: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
    },
    textContainer: {
        marginBottom: 4,
    },
    text: {
        fontSize: 14,
        lineHeight: 20,
    },
    username: {
        fontWeight: '600',
    },
    timestamp: {
        fontSize: 12,
        marginTop: 4,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#0095f6',
        position: 'absolute',
        top: 16,
        right: 12,
    },
    actionsContainer: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 8,
    },
    actionButton: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    acceptButton: {
        backgroundColor: '#0A66C2',
    },
    rejectButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#DBDBDB',
    },
    viewButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
    },
    replyButton: {
        backgroundColor: '#0095f6',
    },
    actionText: {
        fontSize: 13,
        fontWeight: '600',
    },
    acceptText: {
        color: '#FFFFFF',
    },
    rejectText: {
        color: '#8E8E8E',
    },
    replyText: {
        color: '#FFFFFF',
    },
});

export default NotificationItem;
