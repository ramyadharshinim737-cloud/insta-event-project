import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { networkAPI } from '../../services/network.http';
import * as ImagePicker from 'expo-image-picker';

interface Props {
  navigation: any;
}

const CATEGORIES = [
  'Technology',
  'Business',
  'Education',
  'Health & Wellness',
  'Arts & Culture',
  'Sports',
  'Gaming',
  'Professional',
  'Social',
  'Other',
];

const CreateCommunityScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [rules, setRules] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed) && tags.length < 5) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const pickImage = async (type: 'avatar' | 'cover') => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === 'avatar' ? [1, 1] : [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      // In production, upload to server and get URL
      const uri = result.assets[0].uri;
      if (type === 'avatar') {
        setAvatarUrl(uri);
      } else {
        setCoverUrl(uri);
      }
    }
  };

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Community name is required');
      return false;
    }
    if (name.length < 3) {
      Alert.alert('Error', 'Community name must be at least 3 characters');
      return false;
    }
    return true;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await networkAPI.createCommunity({
        name: name.trim(),
        description: description.trim() || undefined,
        category: category || undefined,
        visibility,
        tags,
        rules: rules.trim() || undefined,
        imageUrl: avatarUrl || undefined,
        coverImageUrl: coverUrl || undefined,
      });

      Alert.alert('Success', 'Community created successfully!', [
        {
          text: 'OK',
          onPress: () => {
            navigation.goBack();
            // Optionally navigate to the new community detail
            if (response.community) {
              navigation.navigate('CommunityDetail', { community: response.community });
            }
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create community');
    } finally {
      setLoading(false);
    }
  };

  const isValid = name.trim().length >= 3;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Create Community</Text>
        <TouchableOpacity
          onPress={handleCreate}
          disabled={!isValid || loading}
          style={[
            styles.createButton,
            { backgroundColor: isValid && !loading ? '#0A66C2' : '#ccc' },
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.createButtonText}>Create</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Cover Image */}
        <TouchableOpacity
          style={[styles.coverContainer, { backgroundColor: '#e5e7eb' }]}
          onPress={() => pickImage('cover')}
        >
          {coverUrl ? (
            <Image source={{ uri: coverUrl }} style={styles.coverImage} />
          ) : (
            <View style={styles.coverPlaceholder}>
              <Ionicons name="image-outline" size={40} color="#9ca3af" />
              <Text style={styles.coverPlaceholderText}>Add cover image</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <TouchableOpacity
            style={[styles.avatarContainer, { backgroundColor: '#fff' }]}
            onPress={() => pickImage('avatar')}
          >
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <Ionicons name="people" size={40} color="#9ca3af" />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          {/* Name */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Community Name *</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: '#e5e7eb' }]}
              placeholder="Enter community name"
              placeholderTextColor="#9ca3af"
              value={name}
              onChangeText={setName}
              maxLength={50}
            />
            <Text style={styles.charCount}>{name.length}/50</Text>
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Description</Text>
            <TextInput
              style={[styles.textarea, { color: colors.text, borderColor: '#e5e7eb' }]}
              placeholder="What's your community about?"
              placeholderTextColor="#9ca3af"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={500}
            />
            <Text style={styles.charCount}>{description.length}/500</Text>
          </View>

          {/* Category */}
          <View style={[styles.inputGroup, styles.categoryInputGroup]}>
            <Text style={[styles.label, { color: colors.text }]}>Category</Text>
            <TouchableOpacity
              style={[styles.dropdown, { borderColor: '#e5e7eb' }]}
              onPress={() => setShowCategoryPicker(!showCategoryPicker)}
            >
              <Text style={[styles.dropdownText, { color: category ? colors.text : '#9ca3af' }]}>
                {category || 'Select a category'}
              </Text>
              <Ionicons 
                name={showCategoryPicker ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#9ca3af" 
              />
            </TouchableOpacity>
            {showCategoryPicker && (
              <View style={styles.categoryList}>
                <ScrollView 
                  style={styles.categoryScrollView}
                  nestedScrollEnabled
                  showsVerticalScrollIndicator={false}
                >
                  {CATEGORIES.map(cat => (
                    <TouchableOpacity
                      key={cat}
                      style={styles.categoryItem}
                      onPress={() => {
                        setCategory(cat);
                        setShowCategoryPicker(false);
                      }}
                    >
                      <Text style={[styles.categoryItemText, { color: colors.text }]}>{cat}</Text>
                      {category === cat && <Ionicons name="checkmark" size={20} color="#0A66C2" />}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Visibility */}
          <View style={styles.inputGroup}>
            <View style={styles.rowBetween}>
              <View>
                <Text style={[styles.label, { color: colors.text }]}>Private Community</Text>
                <Text style={styles.hint}>Requires admin approval to join</Text>
              </View>
              <Switch
                value={visibility === 'private'}
                onValueChange={v => setVisibility(v ? 'private' : 'public')}
                trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
                thumbColor={visibility === 'private' ? '#0A66C2' : '#f4f3f4'}
              />
            </View>
          </View>

          {/* Tags */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Tags (max 5)</Text>
            <View style={styles.tagInputContainer}>
              <TextInput
                style={[styles.tagInput, { color: colors.text }]}
                placeholder="Add a tag"
                placeholderTextColor="#9ca3af"
                value={tagInput}
                onChangeText={setTagInput}
                onSubmitEditing={handleAddTag}
                returnKeyType="done"
              />
              <TouchableOpacity
                onPress={handleAddTag}
                disabled={!tagInput.trim() || tags.length >= 5}
                style={[styles.addTagButton, { opacity: tagInput.trim() && tags.length < 5 ? 1 : 0.5 }]}
              >
                <Ionicons name="add" size={20} color="#0A66C2" />
              </TouchableOpacity>
            </View>
            <View style={styles.tagsContainer}>
              {tags.map(tag => (
                <View key={tag} style={styles.tagChip}>
                  <Text style={styles.tagText}>{tag}</Text>
                  <TouchableOpacity onPress={() => handleRemoveTag(tag)}>
                    <Ionicons name="close-circle" size={16} color="#6b7280" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          {/* Rules */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Community Rules</Text>
            <TextInput
              style={[styles.textarea, { color: colors.text, borderColor: '#e5e7eb' }]}
              placeholder="Community guidelines and rules..."
              placeholderTextColor="#9ca3af"
              value={rules}
              onChangeText={setRules}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              maxLength={1000}
            />
            <Text style={styles.charCount}>{rules.length}/1000</Text>
          </View>
        </View>
      </ScrollView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  createButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  coverContainer: {
    height: 180,
    width: '100%',
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
  coverPlaceholderText: {
    marginTop: 8,
    color: '#9ca3af',
    fontSize: 14,
  },
  avatarSection: {
    alignItems: 'center',
    marginTop: -50,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  formContainer: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 24,
    position: 'relative',
    zIndex: 1,
  },
  categoryInputGroup: {
    zIndex: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
  },
  textarea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    minHeight: 100,
  },
  charCount: {
    textAlign: 'right',
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
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
  categoryList: {
    position: 'absolute',
    top: 74,
    left: 0,
    right: 0,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    backgroundColor: '#fff',
    maxHeight: 250,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    marginTop: 4,
  },
  categoryScrollView: {
    maxHeight: 250,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    backgroundColor: '#fff',
  },
  categoryItemText: {
    fontSize: 15,
    color: '#374151',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  tagInput: {
    flex: 1,
    padding: 12,
    fontSize: 15,
  },
  addTagButton: {
    padding: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  tagText: {
    color: '#0369a1',
    fontSize: 13,
    fontWeight: '500',
  },
});

export default CreateCommunityScreen;
