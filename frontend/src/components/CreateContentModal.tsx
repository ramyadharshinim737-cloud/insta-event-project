import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CreateContentModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateStory: () => void;
  onCreatePost: () => void;
  onCreateEvent: () => void;
  onCreateReel: () => void;
}

const CreateContentModal: React.FC<CreateContentModalProps> = ({
  visible,
  onClose,
  onCreateStory,
  onCreatePost,
  onCreateEvent,
  onCreateReel,
}) => {
  const contentOptions = [
    {
      id: 'story',
      icon: 'flash',
      label: 'Share Story',
      description: 'Quick update',
      color: '#FF6B6B',
      onPress: onCreateStory,
    },
    {
      id: 'post',
      icon: 'create',
      label: 'Write Article',
      description: 'Share insights',
      color: '#0A66C2',
      onPress: onCreatePost,
    },
    {
      id: 'event',
      icon: 'calendar',
      label: 'Create Event',
      description: 'Host gathering',
      color: '#7C3AED',
      onPress: onCreateEvent,
    },
    {
      id: 'reel',
      icon: 'videocam',
      label: 'Record Reel',
      description: 'Short video',
      color: '#EC4899',
      onPress: onCreateReel,
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="fade"
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
              <Text style={styles.headerTitle}>Create</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={28} color="#262626" />
              </TouchableOpacity>
            </View>

            {/* Content Grid */}
            <View style={styles.grid}>
              {contentOptions.map((option, index) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.gridItem,
                    index % 2 === 0 ? styles.gridItemLeft : styles.gridItemRight,
                  ]}
                  onPress={() => {
                    option.onPress();
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconContainer, { backgroundColor: option.color }]}>
                    <Ionicons name={option.icon as any} size={32} color="#fff" />
                  </View>
                  <Text style={styles.optionLabel}>{option.label}</Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: SCREEN_WIDTH - 40,
    maxWidth: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#efefef',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#262626',
  },
  closeButton: {
    padding: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
  },
  gridItem: {
    width: '50%',
    padding: 8,
  },
  gridItemLeft: {
    paddingRight: 4,
  },
  gridItemRight: {
    paddingLeft: 4,
  },
  iconContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#262626',
    marginBottom: 4,
    textAlign: 'center',
  },
  optionDescription: {
    fontSize: 13,
    color: '#8e8e8e',
    textAlign: 'center',
  },
});

export default CreateContentModal;
