import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator, TextInput, Alert, Image } from 'react-native';
import { useState, useEffect } from 'react';
import ScreenWrapper from '../../components/layout/ScreenWrapper';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { TabParamList } from '../../navigation/types';
import { profileApi, UserProfileResponse } from '../../services/profile.api';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

type Props = BottomTabScreenProps<TabParamList, 'Profile'>;

const ProfileScreen = (_: Props) => {
  const { colors, typography } = useTheme();
  const { user, logout } = useAuth();
  const [profileData, setProfileData] = useState<UserProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Edit form state
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
      // Initialize edit form with current data
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
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera roll is required!');
        return;
      }

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

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    // Reset form to original data
    setUniversity(profileData?.profile?.university || '');
    setCourse(profileData?.profile?.course || '');
    setYear(profileData?.profile?.year || '');
    setSkillsInput(profileData?.profile?.skills?.join(', ') || '');
    setInterestsInput(profileData?.profile?.interests?.join(', ') || '');
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Convert comma-separated strings to arrays
      const skills = skillsInput
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const interests = interestsInput
        .split(',')
        .map(i => i.trim())
        .filter(i => i.length > 0);

      const updatedData = await profileApi.updateProfile({
        university: university.trim() || undefined,
        course: course.trim() || undefined,
        year: year.trim() || undefined,
        skills,
        interests,
      });

      setProfileData(updatedData);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={[styles.container, styles.centered]}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text, fontSize: typography.size.xxl }]}>
            Profile
          </Text>
          {!isEditing ? (
            <TouchableOpacity
              style={[styles.editButton, { backgroundColor: colors.primary }]}
              onPress={handleEdit}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.editActions}>
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: colors.textSecondary }]}
                onPress={handleCancel}
                disabled={saving}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: colors.primary }]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.userInfo}>
          <TouchableOpacity onPress={pickImage} activeOpacity={0.8} disabled={!isEditing}>
            {profileImageUri ? (
              <Image source={{ uri: profileImageUri }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                <Text style={styles.avatarText}>
                  {profileData?.user?.name?.charAt(0).toUpperCase() || user?.name?.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            {isEditing && (
              <View style={[styles.editImageBadge, { backgroundColor: colors.primary }]}>
                <Ionicons name="camera" size={18} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
          <Text style={[styles.name, { color: colors.text, fontSize: typography.size.lg }]}>
            {profileData?.user?.name || user?.name}
          </Text>
          <Text style={[styles.email, { color: colors.textSecondary, fontSize: typography.size.md }]}>
            {profileData?.user?.email || user?.email}
          </Text>
          <Text style={[styles.joinDate, { color: colors.textSecondary, fontSize: typography.size.sm }]}>
            Joined {profileData?.user?.createdAt ? new Date(profileData.user.createdAt).toLocaleDateString() : 'Recently'}
          </Text>
        </View>

        {/* Profile Details */}
        <View style={styles.profileDetails}>
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>University</Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                value={university}
                onChangeText={setUniversity}
                placeholder="Enter university"
                placeholderTextColor={colors.textSecondary}
              />
            ) : (
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {profileData?.profile?.university || 'Not set'}
              </Text>
            )}
          </View>

          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Course</Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                value={course}
                onChangeText={setCourse}
                placeholder="Enter course"
                placeholderTextColor={colors.textSecondary}
              />
            ) : (
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {profileData?.profile?.course || 'Not set'}
              </Text>
            )}
          </View>

          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Year</Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                value={year}
                onChangeText={setYear}
                placeholder="Enter year (e.g., 2nd Year)"
                placeholderTextColor={colors.textSecondary}
              />
            ) : (
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {profileData?.profile?.year || 'Not set'}
              </Text>
            )}
          </View>

          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Skills</Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                value={skillsInput}
                onChangeText={setSkillsInput}
                placeholder="Enter skills (comma separated)"
                placeholderTextColor={colors.textSecondary}
                multiline
              />
            ) : (
              profileData?.profile?.skills && profileData.profile.skills.length > 0 ? (
                <View style={styles.tagContainer}>
                  {profileData.profile.skills.map((skill, index) => (
                    <View key={index} style={[styles.tag, { backgroundColor: colors.primary + '20' }]}>
                      <Text style={[styles.tagText, { color: colors.primary }]}>{skill}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={[styles.detailValue, { color: colors.text }]}>Not set</Text>
              )
            )}
          </View>

          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Interests</Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                value={interestsInput}
                onChangeText={setInterestsInput}
                placeholder="Enter interests (comma separated)"
                placeholderTextColor={colors.textSecondary}
                multiline
              />
            ) : (
              profileData?.profile?.interests && profileData.profile.interests.length > 0 ? (
                <View style={styles.tagContainer}>
                  {profileData.profile.interests.map((interest, index) => (
                    <View key={index} style={[styles.tag, { backgroundColor: colors.primary + '20' }]}>
                      <Text style={[styles.tagText, { color: colors.primary }]}>{interest}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={[styles.detailValue, { color: colors.text }]}>Not set</Text>
              )
            )}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.danger }]}
          onPress={logout}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontWeight: 'bold',
    flex: 1,
  },
  editButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  editActions: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
  name: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  email: {
    marginBottom: 5,
  },
  joinDate: {
    marginTop: 5,
  },
  editImageBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  profileDetails: {
    marginBottom: 30,
  },
  detailItem: {
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginTop: 5,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '600',
  },
  logoutButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;

