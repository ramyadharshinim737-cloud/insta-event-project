import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Job } from '../types/job.types';

interface JobCardProps {
  job: Job;
  onApply: (jobId: string) => void;
  onPress?: (job: Job) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onApply, onPress }) => {
  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => onPress?.(job)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Ionicons name={job.logo as any || 'briefcase'} size={40} color="#0A66C2" />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.title} numberOfLines={1}>{job.title}</Text>
          <Text style={styles.company}>{job.company}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={14} color="#666" />
            <Text style={styles.location}>{job.location}</Text>
          </View>
        </View>
      </View>

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

      <Text style={styles.description} numberOfLines={2}>
        {job.description}
      </Text>

      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <Ionicons name="time-outline" size={14} color="#666" />
          <Text style={styles.postedDate}>{job.postedDate}</Text>
          {job.applicants && (
            <>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.applicants}>{job.applicants} applicants</Text>
            </>
          )}
        </View>
        <TouchableOpacity
          style={styles.applyButton}
          onPress={(e) => {
            e.stopPropagation();
            onApply((job as any)._id || job.id);
          }}
        >
          <Text style={styles.applyButtonText}>Apply</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  header: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  company: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  salaryTag: {
    backgroundColor: '#dbeafe',
  },
  salaryText: {
    fontSize: 12,
    color: '#1e40af',
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  postedDate: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  dot: {
    fontSize: 12,
    color: '#666',
    marginHorizontal: 6,
  },
  applicants: {
    fontSize: 12,
    color: '#666',
  },
  applyButton: {
    backgroundColor: '#0A66C2',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
