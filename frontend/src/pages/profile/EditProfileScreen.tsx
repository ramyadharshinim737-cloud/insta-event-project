import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { profileApi, UserProfileResponse } from '../../services/profile.api';

interface Props { navigation?: any }

const EditProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState<UserProfileResponse | null>(null);

  // Form fields
  const [university, setUniversity] = useState('');
  const [course, setCourse] = useState('');
  const [year, setYear] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [interestsInput, setInterestsInput] = useState('');
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await profileApi.getProfile();
      setProfileData(data);
      // Initialize form with current data
      setUniversity(data.profile?.university || '');
      setCourse(data.profile?.course || '');
      setYear(data.profile?.year || '');
      setSkillsInput(data.profile?.skills?.join(', ') || '');
      setInterestsInput(data.profile?.interests?.join(', ') || '');
      // Load existing profile image if available
      if (data.profile?.profileImageUrl) {
        setProfileImageUri(data.profile.profileImageUrl);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera roll is required!');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setProfileImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const onSave = async () => {
    try {
      setSaving(true);

      // Upload profile image first if a new one was selected
      // Check if image is local (not from Cloudinary)
      if (profileImageUri && !profileImageUri.startsWith('http')) {
        console.log('🖼️ Uploading new profile image to Cloudinary...');
        await profileApi.uploadProfileImage(profileImageUri);
        console.log('✅ Profile image uploaded successfully');
      }

      // Convert comma-separated strings to arrays
      const skills = skillsInput
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const interests = interestsInput
        .split(',')
        .map(i => i.trim())
        .filter(i => i.length > 0);

      console.log('📝 Updating profile data...');
      await profileApi.updateProfile({
        university: university.trim() || undefined,
        course: course.trim() || undefined,
        year: year.trim() || undefined,
        skills,
        interests,
      });

      Alert.alert('Success', 'Profile updated successfully!');
      navigation?.goBack?.();
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.headerBar, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation?.goBack?.()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={[styles.title, { color: colors.text }]}>Edit Profile</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading profile...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Enhanced Header */}
      <View style={[styles.headerBar, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation?.goBack?.()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.title, { color: colors.text }]}>Edit Profile</Text>
        </View>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={onSave}
          disabled={saving}
          activeOpacity={0.7}
        >
          {saving ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Ionicons name="checkmark" size={24} color={colors.primary} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Image Section */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            <Ionicons name="image-outline" size={18} color={colors.text} /> Profile Picture
          </Text>
          <View style={styles.imageContainer}>
            <TouchableOpacity onPress={pickImage} activeOpacity={0.7}>
              {profileImageUri ? (
                <Image source={{ uri: profileImageUri }} style={styles.profileImage} />
              ) : (
                <View style={[styles.profileImage, { backgroundColor: colors.primary }]}>
                  <Text style={styles.avatarText}>
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </Text>
                </View>
              )}
              <View style={[styles.editBadge, { backgroundColor: colors.primary }]}>
                <Ionicons name="camera" size={20} color="#fff" />
              </View>
            </TouchableOpacity>
            <Text style={[styles.imageHint, { color: colors.textSecondary }]}>
              Tap to change profile picture
            </Text>
          </View>
        </View>

        {/* User Info (Read-only) */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            <Ionicons name="person-outline" size={18} color={colors.text} /> Account Information
          </Text>
          <View style={[styles.infoCard, { backgroundColor: colors.background }]}>
            <View style={styles.userDetails}>
              <Text style={[styles.userName, { color: colors.text }]}>{user?.name}</Text>
              <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user?.email}</Text>
            </View>
          </View>
        </View>

        {/* Education Section */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            <Ionicons name="school-outline" size={18} color={colors.text} /> Education
          </Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>University</Text>
            <TextInput
              value={university}
              onChangeText={setUniversity}
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholderTextColor={colors.textSecondary}
              placeholder="Enter your university"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Course</Text>
            <TextInput
              value={course}
              onChangeText={setCourse}
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholderTextColor={colors.textSecondary}
              placeholder="e.g., Computer Science"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Year</Text>
            <TextInput
              value={year}
              onChangeText={setYear}
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholderTextColor={colors.textSecondary}
              placeholder="e.g., 2nd Year, Final Year"
            />
          </View>
        </View>

        {/* Skills Section */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            <Ionicons name="bulb-outline" size={18} color={colors.text} /> Skills
          </Text>
          <TextInput
            value={skillsInput}
            onChangeText={setSkillsInput}
            style={[styles.textarea, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
            placeholderTextColor={colors.textSecondary}
            placeholder="Enter your skills (comma separated)&#10;e.g., React Native, TypeScript, Node.js"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          <Text style={[styles.hint, { color: colors.textSecondary }]}>
            Separate skills with commas
          </Text>
        </View>

        {/* Interests Section */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            <Ionicons name="heart-outline" size={18} color={colors.text} /> Interests
          </Text>
          <TextInput
            value={interestsInput}
            onChangeText={setInterestsInput}
            style={[styles.textarea, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
            placeholderTextColor={colors.textSecondary}
            placeholder="Enter your interests (comma separated)&#10;e.g., Photography, Travel, Gaming"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          <Text style={[styles.hint, { color: colors.textSecondary }]}>
            Separate interests with commas
          </Text>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          onPress={onSave}
          disabled={saving}
          style={[
            styles.saveButtonLarge,
            { backgroundColor: saving ? colors.textSecondary : colors.primary }
          ]}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={24} color="#fff" />
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  saveButton: {
    padding: 8,
    minWidth: 40,
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  imageContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  imageHint: {
    marginTop: 12,
    fontSize: 13,
    fontStyle: 'italic',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontWeight: '600',
    marginBottom: 8,
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
  },
  textarea: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    minHeight: 100,
    fontSize: 15,
  },
  hint: {
    fontSize: 12,
    marginTop: 6,
    fontStyle: 'italic',
  },
  saveButtonLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
    marginTop: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});

export default EditProfileScreen;
