import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../context/ThemeContext';
import { networkAPI } from '../../services/network.http';
import { Community, UpdateCommunityData } from '../../types/network.types';

interface Props {
  navigation: any;
  route: {
    params: {
      community: Community;
    };
  };
}

const CATEGORIES = [
  'Technology',
  'Business',
  'Healthcare',
  'Education',
  'Finance',
  'Marketing',
  'Design',
  'Engineering',
  'Sales',
  'Other',
];

const CommunitySettingsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { community } = route.params;

  const [formData, setFormData] = useState<UpdateCommunityData>({
    name: community.name || '',
    description: community.description || '',
    category: community.category || 'Other',
    visibility: community.visibility || 'public',
    tags: community.tags || [],
    rules: community.rules || '',
  });

  const [coverImage, setCoverImage] = useState<string | null>(community.coverImageUrl || null);
  const [avatarImage, setAvatarImage] = useState<string | null>(community.imageUrl || null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Check if form has changes
    const changed =
      formData.name !== community.name ||
      formData.description !== (community.description || '') ||
      formData.category !== community.category ||
      formData.visibility !== (community.visibility || 'public') ||
      JSON.stringify(formData.tags) !== JSON.stringify(community.tags || []) ||
      formData.rules !== (community.rules || '') ||
      coverImage !== (community.coverImageUrl || null) ||
      avatarImage !== (community.imageUrl || null);

    setHasChanges(changed);
  }, [formData, coverImage, avatarImage]);

  const handleBack = () => {
    if (hasChanges) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Are you sure you want to leave?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const pickImage = async (type: 'cover' | 'avatar') => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === 'cover' ? [16, 9] : [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      if (type === 'cover') {
        setCoverImage(result.assets[0].uri);
      } else {
        setAvatarImage(result.assets[0].uri);
      }
    }
  };

  const addTag = () => {
    const trimmedTag = tagInput.trim();
    const currentTags = formData.tags || [];
    if (trimmedTag && !currentTags.includes(trimmedTag) && currentTags.length < 5) {
      setFormData({ ...formData, tags: [...currentTags, trimmedTag] });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    const currentTags = formData.tags || [];
    setFormData({ ...formData, tags: currentTags.filter(t => t !== tag) });
  };

  const handleSave = async () => {
    const name = formData.name || '';
    if (name.trim().length < 3) {
      Alert.alert('Error', 'Community name must be at least 3 characters');
      return;
    }

    setLoading(true);
    try {
      await networkAPI.updateCommunity(community.id, formData);
      Alert.alert('Success', 'Community updated successfully', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update community');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const name = formData.name || '';
    if (deleteConfirmation !== name) {
      Alert.alert('Error', 'Community name does not match');
      return;
    }

    setLoading(true);
    try {
      await networkAPI.deleteCommunity(community.id);
      Alert.alert('Success', 'Community deleted successfully', [
        {
          text: 'OK',
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Communities' }],
            });
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to delete community');
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
    }
  };

  const isFormValid = (formData.name || '').trim().length >= 3;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Community Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Cover Image */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Cover Image</Text>
          <TouchableOpacity
            style={styles.coverImageContainer}
            onPress={() => pickImage('cover')}
          >
            {coverImage ? (
              <Image source={{ uri: coverImage }} style={styles.coverImage} />
            ) : (
              <View style={styles.coverPlaceholder}>
                <Ionicons name="image-outline" size={40} color="#9ca3af" />
                <Text style={styles.placeholderText}>Tap to upload cover</Text>
              </View>
            )}
            <View style={styles.uploadOverlay}>
              <Ionicons name="camera" size={24} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Avatar Image */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Community Avatar</Text>
          <TouchableOpacity style={styles.avatarContainer} onPress={() => pickImage('avatar')}>
            {avatarImage ? (
              <Image source={{ uri: avatarImage }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="people" size={40} color="#9ca3af" />
              </View>
            )}
            <View style={styles.avatarOverlay}>
              <Ionicons name="camera" size={16} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Name */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>
            Name <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: '#e5e7eb' }]}
            value={formData.name || ''}
            onChangeText={text => setFormData({ ...formData, name: text })}
            placeholder="Enter community name"
            placeholderTextColor="#9ca3af"
            maxLength={50}
          />
          <Text style={styles.charCount}>{(formData.name || '').length}/50</Text>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Description</Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              { color: colors.text, borderColor: '#e5e7eb' },
            ]}
            value={formData.description || ''}
            onChangeText={text => setFormData({ ...formData, description: text })}
            placeholder="Describe your community"
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={4}
            maxLength={500}
          />
          <Text style={styles.charCount}>{(formData.description || '').length}/500</Text>
        </View>

        {/* Category */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Category</Text>
          <TouchableOpacity
            style={[styles.dropdown, { borderColor: '#e5e7eb' }]}
            onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
          >
            <Text style={[styles.dropdownText, { color: colors.text }]}>
              {formData.category}
            </Text>
            <Ionicons
              name={showCategoryDropdown ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#9ca3af"
            />
          </TouchableOpacity>
          {showCategoryDropdown && (
            <View style={styles.dropdownList}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setFormData({ ...formData, category: cat });
                    setShowCategoryDropdown(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      formData.category === cat && { color: '#0A66C2', fontWeight: '600' },
                    ]}
                  >
                    {cat}
                  </Text>
                  {formData.category === cat && (
                    <Ionicons name="checkmark" size={20} color="#0A66C2" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Visibility */}
        <View style={styles.section}>
          <View style={styles.switchRow}>
            <View style={styles.switchLabel}>
              <Text style={[styles.label, { color: colors.text }]}>Private Community</Text>
              <Text style={styles.switchSubtext}>
                {formData.visibility === 'private'
                  ? 'Requires admin approval to join'
                  : 'Anyone can join instantly'}
              </Text>
            </View>
            <Switch
              value={formData.visibility === 'private'}
              onValueChange={value =>
                setFormData({ ...formData, visibility: value ? 'private' : 'public' })
              }
              trackColor={{ false: '#d1d5db', true: '#0A66C2' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Tags */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>
            Tags (max 5)
          </Text>
          <View style={styles.tagInputContainer}>
            <TextInput
              style={[styles.tagInput, { color: colors.text, borderColor: '#e5e7eb' }]}
              value={tagInput}
              onChangeText={setTagInput}
              placeholder="Add a tag"
              placeholderTextColor="#9ca3af"
              onSubmitEditing={addTag}
              editable={(formData.tags || []).length < 5}
            />
            <TouchableOpacity
              style={[
                styles.addTagButton,
                (formData.tags || []).length >= 5 && styles.addTagButtonDisabled,
              ]}
              onPress={addTag}
              disabled={(formData.tags || []).length >= 5 || !tagInput.trim()}
            >
              <Ionicons name="add" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={styles.tagsContainer}>
            {(formData.tags || []).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
                <TouchableOpacity onPress={() => removeTag(tag)}>
                  <Ionicons name="close-circle" size={16} color="#0369a1" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Rules */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Community Rules</Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              { color: colors.text, borderColor: '#e5e7eb' },
            ]}
            value={formData.rules || ''}
            onChangeText={text => setFormData({ ...formData, rules: text })}
            placeholder="Set community guidelines"
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={6}
            maxLength={1000}
          />
          <Text style={styles.charCount}>{(formData.rules || '').length}/1000</Text>
        </View>

        {/* Danger Zone */}
        <View style={styles.dangerZone}>
          <Text style={styles.dangerTitle}>Danger Zone</Text>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => setShowDeleteModal(true)}
          >
            <Ionicons name="trash-outline" size={20} color="#dc2626" />
            <Text style={styles.deleteButtonText}>Delete Community</Text>
          </TouchableOpacity>
          <Text style={styles.dangerSubtext}>
            This action cannot be undone. All members and content will be removed.
          </Text>
        </View>
      </ScrollView>

      {/* Save Button */}
      {hasChanges && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              { backgroundColor: isFormValid ? '#0A66C2' : '#d1d5db' },
            ]}
            onPress={handleSave}
            disabled={!isFormValid || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Delete Modal */}
      <Modal visible={showDeleteModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="warning" size={48} color="#dc2626" />
              <Text style={styles.modalTitle}>Delete Community</Text>
              <Text style={styles.modalSubtext}>
                This action is permanent and cannot be undone. All members will be removed.
              </Text>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.confirmLabel}>
                Type <Text style={styles.communityName}>{formData.name || ''}</Text> to confirm:
              </Text>
              <TextInput
                style={styles.confirmInput}
                value={deleteConfirmation}
                onChangeText={setDeleteConfirmation}
                placeholder="Community name"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmation('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.confirmDeleteButton,
                  deleteConfirmation !== (formData.name || '') && styles.confirmDeleteButtonDisabled,
                ]}
                onPress={handleDelete}
                disabled={deleteConfirmation !== (formData.name || '') || loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.confirmDeleteButtonText}>Delete Forever</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  required: {
    color: '#dc2626',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'right',
    marginTop: 4,
  },
  coverImageContainer: {
    height: 180,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 14,
    color: '#9ca3af',
  },
  uploadOverlay: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarContainer: {
    alignSelf: 'flex-start',
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  dropdownText: {
    fontSize: 15,
  },
  dropdownList: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#374151',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchLabel: {
    flex: 1,
    marginRight: 12,
  },
  switchSubtext: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
  },
  tagInputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tagInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
  },
  addTagButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#0A66C2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTagButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    color: '#0369a1',
    fontSize: 13,
    fontWeight: '500',
  },
  dangerZone: {
    padding: 16,
    backgroundColor: '#fef2f2',
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#dc2626',
    marginBottom: 12,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dc2626',
  },
  deleteButtonText: {
    color: '#dc2626',
    fontSize: 15,
    fontWeight: '600',
  },
  dangerSubtext: {
    fontSize: 12,
    color: '#991b1b',
    marginTop: 8,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  saveButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#dc2626',
    marginTop: 12,
  },
  modalSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
  },
  modalBody: {
    padding: 24,
  },
  confirmLabel: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  communityName: {
    fontWeight: '700',
    color: '#dc2626',
  },
  confirmInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  confirmDeleteButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#dc2626',
    alignItems: 'center',
  },
  confirmDeleteButtonDisabled: {
    backgroundColor: '#fca5a5',
  },
  confirmDeleteButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});

export default CommunitySettingsScreen;
