/**
 * useNotificationSocket Hook
 * Manages real-time notification subscriptions via Socket.IO
 */

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { getApiUrl } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Notification } from '../services/notifications.api';

interface UseNotificationSocketReturn {
  isConnected: boolean;
  newNotification: Notification | null;
  unreadCount: number;
}

export const useNotificationSocket = (
  onNotificationReceived?: (notification: Notification) => void
): UseNotificationSocketReturn => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [newNotification, setNewNotification] = useState<Notification | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const initializeSocket = async () => {
      try {
        // Get API URL and auth token
        const apiUrl = await getApiUrl();
        const token = await AsyncStorage.getItem('token'); // Using 'token' key to match login storage

        if (!token) {
          console.log('⚠️ No auth token found, skipping socket connection');
          return;
        }

        // Create socket connection
        const socket = io(apiUrl, {
          auth: {
            token: token,
          },
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5,
        });

        socketRef.current = socket;

        // Connection events
        socket.on('connect', () => {
          if (isMounted) {
            console.log('✅ Notification socket connected');
            setIsConnected(true);
            
            // Subscribe to notifications
            socket.emit('subscribe_notifications');
          }
        });

        socket.on('disconnect', () => {
          if (isMounted) {
            console.log('❌ Notification socket disconnected');
            setIsConnected(false);
          }
        });

        socket.on('connect_error', (error) => {
          console.error('❌ Notification socket connection error:', error.message);
          if (isMounted) {
            setIsConnected(false);
          }
        });

        // Notification subscription confirmation
        socket.on('notification_subscribed', (data) => {
          console.log('✅ Subscribed to notifications:', data.message);
        });

        // Receive real-time notifications
        socket.on('notification', (notification: Notification) => {
          console.log('🔔 New notification received:', notification);
          
          if (isMounted) {
            setNewNotification(notification);
            setUnreadCount((prev) => prev + 1);
            
            // Call callback if provided
            if (onNotificationReceived) {
              onNotificationReceived(notification);
            }
          }
        });

        socket.on('error', (error) => {
          console.error('❌ Notification socket error:', error);
        });

      } catch (error) {
        console.error('❌ Failed to initialize notification socket:', error);
      }
    };

    initializeSocket();

    // Cleanup
    return () => {
      isMounted = false;
      
      if (socketRef.current) {
        console.log('🧹 Cleaning up notification socket');
        socketRef.current.emit('unsubscribe_notifications');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [onNotificationReceived]);

  return {
    isConnected,
    newNotification,
    unreadCount,
  };
};
