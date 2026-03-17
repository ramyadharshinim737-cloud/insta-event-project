// ProfilePreviewModal - Quick view of user profile with actions

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NetworkUser } from '../types/network.types';

interface ProfilePreviewModalProps {
  visible: boolean;
  user: NetworkUser | null;
  onClose: () => void;
  onConnect: (userId: string) => Promise<void>;
  onMessage: (userId: string, name: string) => void;
  checkMessagingPermission: (userId: string) => Promise<{ canMessage: boolean; reason?: string }>;
}

export const ProfilePreviewModal: React.FC<ProfilePreviewModalProps> = ({
  visible,
  user,
  onClose,
  onConnect,
  onMessage,
  checkMessagingPermission,
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [canMessage, setCanMessage] = useState(false);
  const [checkingPermission, setCheckingPermission] = useState(false);

  useEffect(() => {
    if (user && visible) {
      checkPermission();
    }
  }, [user, visible]);

  const checkPermission = async () => {
    if (!user) return;
    
    setCheckingPermission(true);
    try {
      const result = await checkMessagingPermission(user.id);
      setCanMessage(result.canMessage);
    } finally {
      setCheckingPermission(false);
    }
  };

  const handleConnect = async () => {
    if (!user) return;
    
    setIsConnecting(true);
    try {
      await onConnect(user.id);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleMessage = () => {
    if (user && canMessage) {
      onMessage(user.id, user.name);
      onClose();
    }
  };

  if (!user) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl max-h-[80%]">
          {/* Header */}
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <Text className="text-lg font-semibold text-gray-900">Profile</Text>
            <TouchableOpacity onPress={onClose} className="p-2">
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          <ScrollView className="p-6">
            {/* Avatar */}
            <View className="items-center mb-6">
              <View className="w-24 h-24 rounded-full bg-blue-100 items-center justify-center">
                <Ionicons name="person" size={48} color="#0a66c2" />
              </View>
            </View>

            {/* User Info */}
            <Text className="text-2xl font-bold text-gray-900 text-center">{user.name}</Text>
            <Text className="text-base text-gray-600 text-center mt-1">{user.role}</Text>
            <Text className="text-base text-gray-500 text-center mt-1">{user.organization}</Text>

            {user.location && (
              <View className="flex-row items-center justify-center mt-2">
                <Ionicons name="location-outline" size={16} color="#6b7280" />
                <Text className="text-sm text-gray-600 ml-1">{user.location}</Text>
              </View>
            )}

            {/* Bio */}
            {user.bio && (
              <View className="mt-6">
                <Text className="text-base text-gray-700">{user.bio}</Text>
              </View>
            )}

            {/* Skills */}
            {user.skills.length > 0 && (
              <View className="mt-6">
                <Text className="text-sm font-semibold text-gray-900 mb-3">Skills</Text>
                <View className="flex-row flex-wrap gap-2">
                  {user.skills.map((skill, index) => (
                    <View key={index} className="px-3 py-2 bg-blue-50 rounded-full">
                      <Text className="text-sm text-blue-700">{skill}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Actions */}
            <View className="mt-8 gap-3">
              {/* Connect Button */}
              {user.connectionStatus === 'none' && (
                <TouchableOpacity
                  onPress={handleConnect}
                  disabled={isConnecting}
                  className="bg-blue-600 py-4 rounded-lg items-center"
                >
                  {isConnecting ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text className="text-base font-semibold text-white">Connect</Text>
                  )}
                </TouchableOpacity>
              )}

              {user.connectionStatus === 'requested' && (
                <View className="bg-blue-100 py-4 rounded-lg items-center">
                  <Text className="text-base font-semibold text-blue-600">Request Pending</Text>
                </View>
              )}

              {user.connectionStatus === 'connected' && (
                <View className="bg-green-100 py-4 rounded-lg items-center">
                  <Text className="text-base font-semibold text-green-600">Connected</Text>
                </View>
              )}

              {/* Message Button - Only if permitted */}
              {canMessage && (
                <TouchableOpacity
                  onPress={handleMessage}
                  className="bg-gray-200 py-4 rounded-lg items-center flex-row justify-center"
                >
                  <Ionicons name="chatbubble-outline" size={20} color="#374151" />
                  <Text className="text-base font-semibold text-gray-700 ml-2">Message</Text>
                </TouchableOpacity>
              )}

              {checkingPermission && (
                <View className="py-2 items-center">
                  <ActivityIndicator size="small" color="#0a66c2" />
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
