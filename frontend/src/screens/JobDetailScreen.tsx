import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Job } from '../types/job.types';

interface JobDetailScreenProps {
  route?: any;
  navigation?: any;
}

const JobDetailScreen: React.FC<JobDetailScreenProps> = ({ route, navigation }) => {
  const { job } = route?.params ?? {};
  const [isSaved, setIsSaved] = useState(false);

  if (!job) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Job not found</Text>
      </SafeAreaView>
    );
  }

  const handleApply = () => {
    Alert.alert(
      'Apply for Job',
      `Are you sure you want to apply for ${job.title} at ${job.company}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Apply',
          onPress: () => {
            Alert.alert('Success', 'Your application has been submitted successfully!');
          },
        },
      ]
    );
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    Alert.alert(
      isSaved ? 'Job Removed' : 'Job Saved',
      isSaved ? 'Job removed from saved jobs' : 'Job added to saved jobs'
    );
  };

  const handleShare = () => {
    Alert.alert('Share Job', 'Share functionality coming soon!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['#0A66C2', '#0052A3']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Job Details</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <Ionicons name="share-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Job Header Card */}
        <View style={styles.jobHeader}>
          <View style={styles.logoContainer}>
            <Ionicons name="briefcase" size={48} color="#0A66C2" />
          </View>
          
          <Text style={styles.jobTitle}>{job.title}</Text>
          <Text style={styles.company}>{job.company}</Text>
          
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={styles.location}>{job.location}</Text>
          </View>

          {/* Tags */}
          <View style={styles.tags}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{job.type}</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{job.level}</Text>
            </View>
            {job.salary && (
              <View style={[styles.tag, styles.salaryTag]}>
                <Text style={styles.salaryText}>{job.salary}</Text>
              </View>
            )}
          </View>

          {/* Meta Info */}
          <View style={styles.metaInfo}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={16} color="#666" />
              <Text style={styles.metaText}>{job.postedDate}</Text>
            </View>
            {job.applicants && (
              <View style={styles.metaItem}>
                <Ionicons name="people-outline" size={16} color="#666" />
                <Text style={styles.metaText}>{job.applicants} applicants</Text>
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.applyButton}
            onPress={handleApply}
          >
            <Text style={styles.applyButtonText}>Apply Now</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.saveButton, isSaved && styles.savedButton]}
            onPress={handleSave}
          >
            <Ionicons
              name={isSaved ? 'bookmark' : 'bookmark-outline'}
              size={24}
              color={isSaved ? '#0A66C2' : '#666'}
            />
          </TouchableOpacity>
        </View>

        {/* Job Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Job Description</Text>
          <Text style={styles.description}>{job.description}</Text>
        </View>

        {/* Requirements */}
        {job.requirements && job.requirements.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Requirements</Text>
            {job.requirements.map((req: string, index: number) => (
              <View key={index} style={styles.requirementItem}>
                <View style={styles.bullet} />
                <Text style={styles.requirementText}>{req}</Text>
              </View>
            ))}
          </View>
        )}

        {/* About Company */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About {job.company}</Text>
          <Text style={styles.description}>
            {job.company} is a leading technology company committed to innovation and excellence. 
            Join our team to work on cutting-edge projects and grow your career.
          </Text>
        </View>

        {/* Similar Jobs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Similar Jobs</Text>
          <Text style={styles.comingSoon}>Coming soon...</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Bottom Apply Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.bottomApplyButton}
          onPress={handleApply}
        >
          <Text style={styles.bottomApplyButtonText}>Apply for this Position</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F6F8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  shareButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  jobHeader: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 12,
    alignItems: 'center',
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#F0F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  jobTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  company: {
    fontSize: 16,
    color: '#0A66C2',
    fontWeight: '600',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
    justifyContent: 'center',
  },
  tag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  salaryTag: {
    backgroundColor: '#dbeafe',
  },
  salaryText: {
    fontSize: 13,
    color: '#1e40af',
    fontWeight: '600',
  },
  metaInfo: {
    flexDirection: 'row',
    gap: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 12,
  },
  applyButton: {
    flex: 1,
    backgroundColor: '#0A66C2',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  savedButton: {
    backgroundColor: '#F0F7FF',
    borderColor: '#0A66C2',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 24,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0A66C2',
    marginTop: 8,
    marginRight: 12,
  },
  requirementText: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
    lineHeight: 24,
  },
  comingSoon: {
    fontSize: 14,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  bottomBar: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  bottomApplyButton: {
    backgroundColor: '#0A66C2',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  bottomApplyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default JobDetailScreen;
