/**
 * Enhanced NotificationsScreen Component
 * Full-screen professional notification view with all features
 * Instagram/LinkedIn style with grouping, filters, and actions
 * Now connected to backend with real-time Socket.IO notifications
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadCount,
  Notification as ApiNotification,
} from '../../services/notifications.api';
import { useNotificationSocket } from '../../hooks/useNotificationSocket';
import { Notification } from '../../types/notification.types';
import NotificationList from '../../components/notifications/NotificationList';
import NotificationBadge from '../../components/notifications/NotificationBadge';
import NotificationCategoryTabs from '../../components/notifications/NotificationCategoryTabs';
import {
  NotificationCategory,
  notificationCategories,
} from '../../types/notificationSettings.types';

interface Props {
  navigation?: any;
}

type FilterType = 'all' | 'unread';

const NotificationsScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const { isAuthenticated, user } = useAuth();
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedCategory, setSelectedCategory] = useState<NotificationCategory>('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasToken, setHasToken] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Socket connection for real-time notifications
  const { isConnected, newNotification } = useNotificationSocket((notification) => {
    // Handle new notification received via socket
    console.log('🔔 New notification in screen:', notification);

    // Convert API notification to UI notification format
    const uiNotification = convertApiToUiNotification(notification);

    // Add to notifications list
    setNotifications((prev) => [uiNotification, ...prev]);
    setUnreadCount((prev) => prev + 1);

    // Show alert for new notification
    if (notification.message) {
      Alert.alert('New Notification', notification.message);
    }
  });

  // Convert API notification to UI notification format
  const convertApiToUiNotification = (apiNotif: ApiNotification): Notification => {
    // Map notification types
    let type: Notification['type'] = 'system';
    let icon = 'notifications-outline';

    switch (apiNotif.type) {
      case 'LIKE':
        type = 'like';
        icon = 'heart';
        break;
      case 'COMMENT':
        type = 'comment';
        icon = 'chatbubble';
        break;
      case 'EVENT_RSVP':
        type = 'event';
        icon = 'calendar';
        break;
      case 'NEW_STORY':
        type = 'system';
        icon = 'radio-button-on';
        break;
      case 'NEW_POST':
        type = 'system';
        icon = 'images';
        break;
      case 'NEW_EVENT':
        type = 'event';
        icon = 'calendar';
        break;
    }

    return {
      id: apiNotif._id,
      type,
      content: apiNotif.message,
      user: {
        id: apiNotif.userId,
        name: apiNotif.actorName || 'Someone',
        avatar: apiNotif.actorAvatar || 'person-circle',
      },
      timestamp: new Date(apiNotif.createdAt).toISOString(),
      read: apiNotif.isRead,
      actionable: false,
    };
  };

  // Check for token and authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('token');
      console.log('🔐 NotificationsScreen - Token check:', token ? 'Found' : 'Not found');
      console.log('🔐 NotificationsScreen - isAuthenticated:', isAuthenticated);
      console.log('🔐 NotificationsScreen - user:', user);

      if (!token) {
        console.error('❌ No token found - user needs to log in');
        Alert.alert(
          'Authentication Required',
          'Please log in to view notifications.',
          [{ text: 'OK', onPress: () => navigation?.navigate?.('Login') }]
        );
        return;
      }

      setHasToken(true);
      loadNotifications();
      loadUnreadCount();
    };

    checkAuth();
  }, []);

  // Fetch notifications on mount
  // useEffect(() => {
  //   loadNotifications();
  //   loadUnreadCount();
  // }, []);

  const loadNotifications = async () => {
    try {
      console.log('📥 Loading notifications...');
      setLoading(true);
      const data = await fetchNotifications(50, 0);
      console.log('✅ Notifications loaded:', data?.length || 0, 'items');
      console.log('📋 Raw notification data:', JSON.stringify(data, null, 2));
      
      if (!data || data.length === 0) {
        console.log('ℹ️ No notifications found');
        setNotifications([]);
        return;
      }
      
      const uiNotifications = data.map(convertApiToUiNotification);
      console.log('✅ Converted notifications:', uiNotifications.length);
      setNotifications(uiNotifications);
    } catch (error: any) {
      console.error('❌ Failed to load notifications:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      // Handle authentication errors
      if (error.message?.includes('Invalid or expired token') || 
          error.message?.includes('401') ||
          error.message?.includes('Unauthorized')) {
        Alert.alert(
          'Session Expired',
          'Your session has expired. Please log in again.',
          [
            { 
              text: 'Login', 
              onPress: () => navigation?.navigate?.('Login') 
            }
          ]
        );
      } else {
        Alert.alert('Error', `Failed to load notifications: ${error.message}`);
      }
    } finally {
      setLoading(false);
      console.log('✅ Loading complete');
    }
  };

  const loadUnreadCount = async () => {
    try {
      console.log('📊 Loading unread count...');
      const count = await getUnreadCount();
      console.log('✅ Unread count loaded:', count);
      setUnreadCount(count);
    } catch (error: any) {
      console.error('❌ Failed to load unread count:', error);
      console.error('❌ Error details:', error.message);
      
      // Silently fail for unread count - it's not critical
      // User will still see notifications
    }
  };

  const countUnreadNotifications = (notifs: Notification[]): number => {
    return notifs.filter(n => !n.read).length;
  };

  // Filter by read/unread status
  const statusFilteredNotifications = useMemo(() => {
    return filter === 'unread'
      ? notifications.filter((n) => !n.read)
      : notifications;
  }, [notifications, filter]);

  // Filter by category
  const filteredNotifications = useMemo(() => {
    if (selectedCategory === 'all') {
      return statusFilteredNotifications;
    }

    const categoryDef = notificationCategories.find(c => c.id === selectedCategory);
    if (!categoryDef) return statusFilteredNotifications;

    return statusFilteredNotifications.filter(n =>
      categoryDef.types.includes(n.type)
    );
  }, [statusFilteredNotifications, selectedCategory]);

  // Handle notification press
  const handleNotificationPress = useCallback(
    async (notification: Notification) => {
      // Mark as read
      if (!notification.read) {
        try {
          await markNotificationAsRead(notification.id);
          setNotifications((prev) =>
            prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
          );
          setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (error) {
          console.error('Failed to mark as read:', error);
        }
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
  const handleMarkAsRead = useCallback(async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
      Alert.alert('Error', 'Failed to mark notification as read');
    }
  }, []);

  // Handle mark all as read
  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      Alert.alert('Success', 'All notifications marked as read');
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      Alert.alert('Error', 'Failed to mark all notifications as read');
    }
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
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          {!hasToken ? (
            <>
              <Text style={styles.headerTitle}>Notifications</Text>
              <View style={styles.headerRight}>
                <TouchableOpacity
                  onPress={() => navigation?.navigate?.('Login')}
                  style={styles.loginButton}
                >
                  <Ionicons name="log-in-outline" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
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
                  onPress={() => navigation?.navigate?.('NotificationSettings')}
                  accessible={true}
                  accessibilityLabel="Notification settings"
                  accessibilityRole="button"
                >
                  <Ionicons name="settings-outline" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </LinearGradient>

      {/* Filter Tabs */}
      <View
        style={[
          styles.filterContainer,
          {
            backgroundColor: colors.surface,
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

      {/* Category Tabs */}
      <NotificationCategoryTabs
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        notifications={notifications}
      />

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
  loginButton: {
    padding: 4,
    marginLeft: 8,
  },
});

export default NotificationsScreen;

