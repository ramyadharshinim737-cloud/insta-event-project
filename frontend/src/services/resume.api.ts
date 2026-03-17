import { apiRequest } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Resume {
  _id: string;
  userId: string;
  title: string;
  personalInfo: {
    fullName: string;
    email: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    portfolio?: string;
  };
  summary?: string;
  experience: Array<{
    company: string;
    position: string;
    location?: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    description?: string;
    achievements?: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field?: string;
    location?: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    gpa?: string;
  }>;
  skills: string[];
  certifications?: Array<{
    name: string;
    issuer: string;
    date: string;
    credentialId?: string;
  }>;
  projects?: Array<{
    name: string;
    description: string;
    technologies: string[];
    url?: string;
  }>;
  languages?: Array<{
    name: string;
    proficiency: string;
  }>;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

// Create a new resume
export const createResume = async (resumeData: Partial<Resume>): Promise<Resume> => {
  return await apiRequest<Resume>('POST', '/resumes', resumeData);
};

// Get all resumes for the authenticated user
export const getUserResumes = async (): Promise<Resume[]> => {
  return await apiRequest<Resume[]>('GET', '/resumes');
};

// Get a single resume by ID
export const getResumeById = async (id: string): Promise<Resume> => {
  return await apiRequest<Resume>('GET', `/resumes/${id}`);
};

// Update a resume
export const updateResume = async (id: string, resumeData: Partial<Resume>): Promise<Resume> => {
  return await apiRequest<Resume>('PUT', `/resumes/${id}`, resumeData);
};

// Delete a resume
export const deleteResume = async (id: string): Promise<void> => {
  await apiRequest<void>('DELETE', `/resumes/${id}`);
};

// Get public resume of another user
export const getPublicResume = async (userId: string): Promise<Resume> => {
  return await apiRequest<Resume>('GET', `/resumes/public/${userId}`);
};
