import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiUrl } from './api';

export interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  level: 'Entry' | 'Mid' | 'Senior' | 'Lead';
  salary?: string;
  description: string;
  requirements: string[];
  postedBy: string;
  postedDate: string;
  expiryDate?: string;
  applicants: string[];
  status: 'active' | 'closed' | 'draft';
  logo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobData {
  title: string;
  company: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  level: 'Entry' | 'Mid' | 'Senior' | 'Lead';
  salary?: string;
  description: string;
  requirements?: string[];
}

export interface JobApplication {
  _id: string;
  job: string | Job;
  applicant: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'accepted';
  coverLetter?: string;
  resume?: string;
  appliedDate: string;
  createdAt: string;
  updatedAt: string;
}

// Helper to get authorization headers
const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

export const jobsApi = {
  // Get all jobs
  getJobs: async (
    page: number = 1,
    limit: number = 20,
    filters?: {
      type?: string;
      level?: string;
      location?: string;
      company?: string;
    }
  ): Promise<{ jobs: Job[]; total: number; page: number; totalPages: number }> => {
    try {
      const apiUrl = await getApiUrl();
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(filters?.type && { type: filters.type }),
        ...(filters?.level && { level: filters.level }),
        ...(filters?.location && { location: filters.location }),
        ...(filters?.company && { company: filters.company }),
      });

      const response = await fetch(`${apiUrl}/api/jobs?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch jobs');
      }

      const data = await response.json();
      return {
        jobs: data.jobs,
        total: data.total,
        page: data.page,
        totalPages: data.totalPages,
      };
    } catch (error: any) {
      console.error('Get jobs error:', error);
      throw error;
    }
  },

  // Get job by ID
  getJobById: async (jobId: string): Promise<Job> => {
    try {
      const apiUrl = await getApiUrl();
      const response = await fetch(`${apiUrl}/api/jobs/${jobId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch job');
      }

      const data = await response.json();
      return data.job;
    } catch (error: any) {
      console.error('Get job by ID error:', error);
      throw error;
    }
  },

  // Apply for job
  applyForJob: async (
    jobId: string,
    applicationData?: { coverLetter?: string; resume?: string }
  ): Promise<JobApplication> => {
    try {
      const apiUrl = await getApiUrl();
      const headers = await getAuthHeaders();

      const response = await fetch(`${apiUrl}/api/jobs/${jobId}/apply`, {
        method: 'POST',
        headers,
        body: JSON.stringify(applicationData || {}),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to apply for job');
      }

      const data = await response.json();
      return data.application;
    } catch (error: any) {
      console.error('Apply for job error:', error);
      throw error;
    }
  },

  // Get user's applications
  getUserApplications: async (
    page: number = 1,
    limit: number = 20
  ): Promise<{ applications: JobApplication[]; total: number; page: number; totalPages: number }> => {
    try {
      const apiUrl = await getApiUrl();
      const headers = await getAuthHeaders();

      const response = await fetch(
        `${apiUrl}/api/jobs/applications/my-applications?page=${page}&limit=${limit}`,
        {
          method: 'GET',
          headers,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch applications');
      }

      const data = await response.json();
      return {
        applications: data.applications,
        total: data.total,
        page: data.page,
        totalPages: data.totalPages,
      };
    } catch (error: any) {
      console.error('Get user applications error:', error);
      throw error;
    }
  },

  // Search jobs
  searchJobs: async (
    query: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ jobs: Job[]; total: number; page: number; totalPages: number }> => {
    try {
      const apiUrl = await getApiUrl();
      const response = await fetch(
        `${apiUrl}/api/jobs/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to search jobs');
      }

      const data = await response.json();
      return {
        jobs: data.jobs,
        total: data.total,
        page: data.page,
        totalPages: data.totalPages,
      };
    } catch (error: any) {
      console.error('Search jobs error:', error);
      throw error;
    }
  },

  // Create job
  createJob: async (jobData: CreateJobData): Promise<Job> => {
    try {
      const apiUrl = await getApiUrl();
      const headers = await getAuthHeaders();

      console.log('📤 Creating job with data:', JSON.stringify(jobData, null, 2));

      const response = await fetch(`${apiUrl}/api/jobs`, {
        method: 'POST',
        headers,
        body: JSON.stringify(jobData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Create job error response:', errorData);
        throw new Error(errorData.error || errorData.message || 'Failed to create job');
      }

      const data = await response.json();
      console.log('✅ Job created successfully:', data);
      return data.job;
    } catch (error: any) {
      console.error('Create job error:', error);
      throw error;
    }
  },

  // Save job
  saveJob: async (jobId: string): Promise<any> => {
    try {
      const apiUrl = await getApiUrl();
      const headers = await getAuthHeaders();

      const response = await fetch(`${apiUrl}/api/jobs/${jobId}/save`, {
        method: 'POST',
        headers,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save job');
      }

      const data = await response.json();
      return data.savedJob;
    } catch (error: any) {
      console.error('Save job error:', error);
      throw error;
    }
  },

  // Unsave job
  unsaveJob: async (jobId: string): Promise<void> => {
    try {
      const apiUrl = await getApiUrl();
      const headers = await getAuthHeaders();

      const response = await fetch(`${apiUrl}/api/jobs/${jobId}/save`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to unsave job');
      }
    } catch (error: any) {
      console.error('Unsave job error:', error);
      throw error;
    }
  },

  // Get saved jobs
  getSavedJobs: async (
    page: number = 1,
    limit: number = 20
  ): Promise<{ savedJobs: any[]; total: number; page: number; totalPages: number }> => {
    try {
      const apiUrl = await getApiUrl();
      const headers = await getAuthHeaders();

      const response = await fetch(
        `${apiUrl}/api/jobs/saved/my-saved-jobs?page=${page}&limit=${limit}`,
        {
          method: 'GET',
          headers,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch saved jobs');
      }

      const data = await response.json();
      return {
        savedJobs: data.savedJobs,
        total: data.total,
        page: data.page,
        totalPages: data.totalPages,
      };
    } catch (error: any) {
      console.error('Get saved jobs error:', error);
      throw error;
    }
  },
};
