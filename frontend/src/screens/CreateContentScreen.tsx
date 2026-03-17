import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import BottomNavigation from '../components/BottomNavigation';

interface CreateContentScreenProps {
  navigation?: any;
}

const CreateContentScreen: React.FC<CreateContentScreenProps> = ({ navigation }) => {
  const contentOptions = [
    {
      id: 'story',
      icon: 'flash',
      label: 'Share Story',
      description: 'Quick update for your network',
      gradient: ['#FF6B6B', '#FF8E53'] as const,
      onPress: () => {
        if (navigation) {
          navigation.navigate('CreateStory');
        }
      },
    },
    {
      id: 'post',
      icon: 'create',
      label: 'Write Article',
      description: 'Share insights and ideas',
      gradient: ['#0A66C2', '#0077B5'] as const,
      onPress: () => {
        if (navigation) {
          navigation.navigate('CreateArticle');
        }
      },
    },
    {
      id: 'event',
      icon: 'calendar',
      label: 'Create Event',
      description: 'Host a gathering or meetup',
      gradient: ['#7C3AED', '#A855F7'] as const,
      onPress: () => {
        if (navigation) {
          navigation.navigate('CreateEvent');
        }
      },
    },
    {
      id: 'reel',
      icon: 'videocam',
      label: 'Share Reel',
      description: 'A short video',
      gradient: ['#EC4899', '#F472B6'] as const,
      onPress: () => {
        if (navigation) {
          navigation.navigate('CreateReel');
        }
      },
    },
    {
      id: 'resume',
      icon: 'document-text',
      label: 'Resume Builder',
      description: 'Create AI-powered professional resumes',
      gradient: ['#10B981', '#059669'] as const,
      onPress: () => {
        if (navigation) {
          navigation.navigate('ResumeBuilder');
        }
      },
    },
    {
      id: 'jobs',
      icon: 'briefcase',
      label: 'Jobs',
      description: 'Find your dream job with AI matching',
      gradient: ['#3B82F6', '#2563EB'] as const,
      onPress: () => {
        if (navigation) {
          navigation.navigate('Jobs');
        }
      },
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation?.navigate('Home')}
        >
          <Ionicons name="close" size={28} color="#262626" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content Grid */}
      <View style={styles.content}>
        <Text style={styles.subtitle}>What would you like to share?</Text>

        <View style={styles.grid}>
          {contentOptions.map((option, index) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.gridItem,
                index % 2 === 0 ? styles.gridItemLeft : styles.gridItemRight,
              ]}
              onPress={option.onPress}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={option.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientCard}
              >
                <View style={styles.iconContainer}>
                  <Ionicons name={option.icon as any} size={40} color="#fff" />
                </View>
                <Text style={styles.optionLabel}>{option.label}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab="Create" navigation={navigation} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#efefef',
  },
  backButton: {
    padding: 4,
    width: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#262626',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 80, // Space for bottom navigation
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  gridItem: {
    width: '50%',
    padding: 8,
    marginBottom: 16,
  },
  gridItemLeft: {
    paddingRight: 8,
  },
  gridItemRight: {
    paddingLeft: 8,
  },
  gradientCard: {
    borderRadius: 16,
    padding: 20,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  optionLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
    textAlign: 'center',
  },
  optionDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default CreateContentScreen;
