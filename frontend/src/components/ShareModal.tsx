import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Share as RNShare,
  Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
  postId: string;
  postContent: string;
}

const ShareModal: React.FC<ShareModalProps> = ({
  visible,
  onClose,
  postId,
  postContent,
}) => {
  const shareUrl = `https://linsta.app/post/${postId}`;

  const handleCopyLink = async () => {
    await Clipboard.setStringAsync(shareUrl);
    Alert.alert('Link copied!', 'The link has been copied to your clipboard.');
    onClose();
  };

  const handleShare = async () => {
    try {
      const content = postContent.length > 50 ? postContent.substring(0, 50) + '...' : postContent;
      await RNShare.share({
        message: `Check out this post: ${content}\n${shareUrl}`,
      });
      onClose();
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const shareOptions = [
    {
      id: 'copy',
      icon: 'copy-outline',
      label: 'Copy Link',
      onPress: handleCopyLink,
    },
    {
      id: 'share',
      icon: 'share-social-outline',
      label: 'Share via...',
      onPress: handleShare,
    },
    {
      id: 'message',
      icon: 'chatbubble-outline',
      label: 'Send in Message',
      onPress: () => {
        Alert.alert('Coming Soon', 'This feature will be available soon!');
        onClose();
      },
    },
    {
      id: 'bookmark',
      icon: 'bookmark-outline',
      label: 'Save Post',
      onPress: () => {
        Alert.alert('Saved!', 'Post saved to your bookmarks.');
        onClose();
      },
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.container}>
          <TouchableOpacity activeOpacity={1}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.handle} />
              <Text style={styles.headerTitle}>Share</Text>
            </View>

            {/* Share Options */}
            <View style={styles.optionsContainer}>
              {shareOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={styles.option}
                  onPress={option.onPress}
                >
                  <View style={styles.optionIcon}>
                    <Ionicons name={option.icon as any} size={28} color="#0A66C2" />
                  </View>
                  <Text style={styles.optionLabel}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Cancel Button */}
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#efefef',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#262626',
  },
  optionsContainer: {
    paddingVertical: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionLabel: {
    fontSize: 16,
    color: '#262626',
    fontWeight: '500',
  },
  cancelButton: {
    marginHorizontal: 20,
    marginTop: 8,
    paddingVertical: 14,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#262626',
  },
});

export default ShareModal;
