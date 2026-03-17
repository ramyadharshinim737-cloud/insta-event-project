import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { useAuth } from '../../context/AuthContext';
import ProfileHeader from '../../components/profile/ProfileHeader';
import ExperienceCard from '../../components/profile/ExperienceCard';
import SkillTag from '../../components/profile/SkillTag';
import MediaGrid from '../../components/profile/MediaGrid';
import { profileApi, UserProfileResponse } from '../../services/profile.api';

interface Props { navigation?: any; username?: string }

const ProfileScreen: React.FC<Props> = ({ navigation, username = 'johndoe' }) => {
  const { colors } = useTheme();
  const { logout: logoutUser } = useUser();
  const { logout: logoutAuth, user } = useAuth();
  const [profileData, setProfileData] = useState<UserProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
    
    // Add focus listener to refresh profile when returning from edit
    const unsubscribe = navigation?.addListener?.('focus', () => {
      fetchProfile();
    });

    return unsubscribe;
  }, [navigation]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await profileApi.getProfile();
      setProfileData(data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const onConnect = () => { };

  const handleLogout = async () => {
    try {
      await logoutAuth();  // Logout from AuthContext (clears isAuthenticated)
      logoutUser();        // Logout from UserContext (clears user state)
      console.log('✅ Logout successful, isAuthenticated should be false now');
      // Navigation will happen automatically via AppNavigator useEffect
    } catch (error) {
      console.error('❌ Logout error:', error);
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
            <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
          </View>
          <View style={{ width: 80 }} />
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
      {/* Enhanced Header Bar */}
      <View style={[styles.headerBar, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation?.goBack?.()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
        </View>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation?.navigate?.('ProfileEdit')}
          activeOpacity={0.7}
        >
          <Ionicons name="create-outline" size={20} color={colors.primary} />
          <Text style={[styles.editButtonText, { color: colors.primary }]}>Edit</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <ProfileHeader
          name={profileData?.user?.name || user?.name || 'User'}
          headline={profileData?.profile?.course || 'Student'}
          location={profileData?.profile?.university || 'University not set'}
          photoUrl={profileData?.profile?.profileImageUrl}
          relation="Edit"
          onActionPress={() => navigation?.navigate?.('ProfileEdit')}
        />

        <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
        <Text style={{ color: colors.text, marginBottom: 12 }}>
          {profileData?.profile?.course ? `Studying ${profileData.profile.course}` : 'No information available'}
          {profileData?.profile?.year ? ` - ${profileData.profile.year}` : ''}
          {profileData?.profile?.university ? ` at ${profileData.profile.university}` : ''}
        </Text>

        {profileData?.profile?.interests && profileData.profile.interests.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Interests</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 }}>
              {profileData.profile.interests.map((interest, index) => (
                <SkillTag key={index} label={interest} />
              ))}
            </View>
          </>
        )}

        {profileData?.profile?.university && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Education</Text>
            <ExperienceCard
              company={profileData.profile.university}
              role={profileData.profile.course || 'Student'}
              duration={profileData.profile.year || 'Current'}
            />
          </>
        )}

        {profileData?.profile?.skills && profileData.profile.skills.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Skills</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {profileData.profile.skills.map((skill, index) => (
                <SkillTag key={index} label={skill} endorsed />
              ))}
            </View>
          </>
        )}

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Media</Text>
        <MediaGrid items={[
          { id: 'm1', uri: 'https://picsum.photos/400/400?1', type: 'image' },
          { id: 'm2', uri: 'https://picsum.photos/400/400?2', type: 'image' },
          { id: 'm3', uri: 'https://picsum.photos/400/400?3', type: 'image' },
        ]} />

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.background, borderColor: colors.border }]}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={20} color="#dc2626" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBar: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
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
  backLink: { fontSize: 14 },
  link: { fontSize: 14, fontWeight: '700' },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginTop: 16, marginBottom: 8 },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 32,
    marginBottom: 100,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#dc2626',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
  },
});

export default ProfileScreen;
