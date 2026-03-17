/**
 * Resume Types
 * Type definitions for Resume Builder feature
 */

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type ResumeStatus = 'draft' | 'published' | 'archived';

export interface PersonalInfo {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    portfolio?: string;
    github?: string;
    summary: string;
}

export interface Experience {
    id: string;
    company: string;
    role: string;
    location: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    description: string[];
    achievements: string[];
}

export interface Education {
    id: string;
    institution: string;
    degree: string;
    field: string;
    location: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    gpa?: string;
    achievements?: string[];
}

export interface Skill {
    id: string;
    name: string;
    level: SkillLevel;
    category: string;
    yearsOfExperience?: number;
}

export interface Project {
    id: string;
    name: string;
    description: string;
    technologies: string[];
    link?: string;
    startDate: string;
    endDate?: string;
    highlights: string[];
}

export interface Certification {
    id: string;
    name: string;
    issuer: string;
    issueDate: string;
    expiryDate?: string;
    credentialId?: string;
    link?: string;
}

export interface AIScore {
    overall: number;
    atsCompatibility: number;
    contentQuality: number;
    keywordOptimization: number;
    formatScore: number;
    suggestions: string[];
    strengths: string[];
    weaknesses: string[];
}

export interface Resume {
    id: string;
    userId: string;
    title: string;
    templateId: string;
    version: number;
    status: ResumeStatus;

    personalInfo: PersonalInfo;
    experience: Experience[];
    education: Education[];
    skills: Skill[];
    projects: Project[];
    certifications: Certification[];
    languages?: Language[];

    aiScore: AIScore;

    targetRole?: string;
    targetIndustry?: string;

    createdAt: string;
    updatedAt: string;
    lastExportedAt?: string;
}

export interface Language {
    id: string;
    name: string;
    proficiency: 'basic' | 'conversational' | 'fluent' | 'native';
}

export interface ResumeTemplate {
    id: string;
    name: string;
    description: string;
    category: 'professional' | 'creative' | 'modern' | 'minimal' | 'technical';
    thumbnail: string;
    atsOptimized: boolean;
    colors: {
        primary: string;
        secondary: string;
        accent: string;
    };
}

export interface CoverLetter {
    id: string;
    resumeId: string;
    jobTitle: string;
    companyName: string;
    content: string;
    createdAt: string;
    updatedAt: string;
}

export interface SkillGapAnalysis {
    resumeId: string;
    jobDescription: string;
    matchPercentage: number;
    matchingSkills: string[];
    missingSkills: string[];
    recommendations: {
        skill: string;
        importance: 'high' | 'medium' | 'low';
        learningResources?: string[];
    }[];
    overallFeedback: string;
}

export interface ResumeFilters {
    status?: ResumeStatus;
    targetRole?: string;
    minScore?: number;
    sortBy?: 'updatedAt' | 'createdAt' | 'score' | 'title';
    sortOrder?: 'asc' | 'desc';
}
