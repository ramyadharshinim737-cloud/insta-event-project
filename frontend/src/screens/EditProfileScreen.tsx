import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { profileApi, UserProfileResponse } from '../services/profile.api';
import { useAuth } from '../context/AuthContext';

const EditProfileScreen = ({ route, navigation }: any) => {
  const { profileData: initialData } = route?.params || {};
  const { logout } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [headline, setHeadline] = useState(initialData?.profile?.headline || '');
  const [bio, setBio] = useState(initialData?.profile?.bio || '');
  const [location, setLocation] = useState(initialData?.profile?.location || '');
  const [website, setWebsite] = useState(initialData?.profile?.website || '');
  const [university, setUniversity] = useState(initialData?.profile?.university || '');
  const [course, setCourse] = useState(initialData?.profile?.course || '');
  const [year, setYear] = useState(initialData?.profile?.year || '');
  const [skills, setSkills] = useState(initialData?.profile?.skills?.join(', ') || '');
  const [openToWork, setOpenToWork] = useState(initialData?.profile?.openToWork || false);

  const handleSave = async () => {
    try {
      setLoading(true);
      
      const updateData = {
        headline: headline.trim(),
        bio: bio.trim(),
        location: location.trim(),
        website: website.trim(),
        university: university.trim(),
        course: course.trim(),
        year: year.trim(),
        skills: skills.split(',').map(s => s.trim()).filter(Boolean),
        openToWork,
      };

      await profileApi.updateProfile(updateData);
      
      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => {
              Alert.alert(
                'Settings',
                'Additional profile settings',
                [{ text: 'OK' }]
              );
            }}
          >
            <Ionicons name="settings-outline" size={18} color="#666" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="#0A66C2" />
          ) : (
            <Text style={styles.saveButton}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Professional Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Headline *</Text>
            <TextInput
              style={styles.input}
              value={headline}
              onChangeText={setHeadline}
              placeholder="e.g. Full Stack Developer at Microsoft"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="e.g. Mumbai, India"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Website</Text>
            <TextInput
              style={styles.input}
              value={website}
              onChangeText={setWebsite}
              placeholder="e.g. yourwebsite.com"
              placeholderTextColor="#999"
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell us about yourself..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Education */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Education</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>University</Text>
            <TextInput
              style={styles.input}
              value={university}
              onChangeText={setUniversity}
              placeholder="e.g. University of Mumbai"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Course</Text>
            <TextInput
              style={styles.input}
              value={course}
              onChangeText={setCourse}
              placeholder="e.g. Computer Science"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Year</Text>
            <TextInput
              style={styles.input}
              value={year}
              onChangeText={setYear}
              placeholder="e.g. 2024"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Skills */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Skills (comma separated)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={skills}
              onChangeText={setSkills}
              placeholder="e.g. JavaScript, React, Node.js"
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            <Text style={styles.hint}>Separate skills with commas</Text>
          </View>
        </View>

        {/* Open to Work */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Job Preferences</Text>
          
          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Open to Work</Text>
              <Text style={styles.switchDescription}>
                Show recruiters you're open to opportunities
              </Text>
            </View>
            <Switch
              value={openToWork}
              onValueChange={setOpenToWork}
              trackColor={{ false: '#ccc', true: '#0A66C2' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Logout Section */}
        <View style={styles.logoutSection}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => {
              Alert.alert(
                'Logout',
                'Are you sure you want to logout?',
                [
                  {
                    text: 'Cancel',
                    onPress: () => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    },
                    style: 'cancel',
                  },
                  {
                    text: 'Logout',
                    onPress: async () => {
                      try {
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                        await logout();
                      } catch (error) {
                        Alert.alert('Error', 'Failed to logout. Please try again.');
                      }
                    },
                    style: 'destructive',
                  },
                ],
              );
            }}
          >
            <Ionicons name="log-out-outline" size={22} color="#EF4444" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A66C2',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#000',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 10,
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchInfo: {
    flex: 1,
    marginRight: 16,
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: 13,
    color: '#666',
  },
  bottomSpace: {
    height: 32,
  },
  settingsButton: {
    marginRight: 12,
  },
  logoutSection: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    marginTop: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
});

export default EditProfileScreen;
