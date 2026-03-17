/**
 * Enhanced Job Types
 * Additional types for advanced job features
 */

import { Job, Company, Application } from './job.types';

// Search & Filters
export interface JobSearchFilters {
    keywords: string;
    location: {
        city: string;
        latitude: number;
        longitude: number;
        radius: number; // in km: 5, 10, 50, 100
    };
    salary: {
        min: number;
        max: number;
    };
    experience: {
        min: number;
        max: number;
    };
    workMode: ('remote' | 'hybrid' | 'onsite')[];
    jobType: ('full-time' | 'part-time' | 'internship' | 'contract')[];
    companyType: ('startup' | 'mnc' | 'sme')[];
    postedWithin: number; // days
}

export interface SavedSearch {
    id: string;
    name: string;
    filters: JobSearchFilters;
    createdAt: string;
    alertEnabled: boolean;
    matchCount: number;
}

// AI Matching
export interface MatchExplanation {
    overallMatch: number;
    skillMatch: number;
    experienceMatch: number;
    locationMatch: number;
    salaryMatch: number;
    reasons: string[];
    missingSkills: string[];
    improvements: {
        skill: string;
        importance: 'high' | 'medium' | 'low';
        suggestion: string;
    }[];
}

// Scam Detection
export type ScamRiskLevel = 'low' | 'medium' | 'high';

export interface ScamDetection {
    riskLevel: ScamRiskLevel;
    score: number; // 0-100
    reasons: string[];
    flags: {
        unrealisticSalary: boolean;
        poorDescription: boolean;
        suspiciousCompany: boolean;
        urgentHiring: boolean;
        upfrontPayment: boolean;
    };
}

export interface JobReport {
    jobId: string;
    reason: 'scam' | 'spam' | 'inappropriate' | 'duplicate' | 'other';
    description: string;
    reportedBy: string;
    reportedAt: string;
}

// Job Alerts
export interface JobAlert {
    id: string;
    type: 'new_match' | 'status_update' | 'recruiter_message' | 'application_viewed';
    jobId?: string;
    applicationId?: string;
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
    actionUrl?: string;
}

export interface AlertPreferences {
    newJobs: {
        enabled: boolean;
        frequency: 'instant' | 'daily' | 'weekly';
        channels: ('inApp' | 'email' | 'push')[];
    };
    statusUpdates: {
        enabled: boolean;
        channels: ('inApp' | 'email' | 'push')[];
    };
    recruiterMessages: {
        enabled: boolean;
        channels: ('inApp' | 'email' | 'push')[];
    };
}

// Application Timeline
export type ApplicationStage =
    | 'applied'
    | 'viewed'
    | 'shortlisted'
    | 'interview'
    | 'offer'
    | 'rejected'
    | 'withdrawn';

export interface TimelineEvent {
    id: string;
    stage: ApplicationStage;
    timestamp: string;
    description: string;
    companyAction?: boolean; // true if company took action
}

export interface EnhancedApplication extends Application {
    timeline: TimelineEvent[];
    recruiterViewed: boolean;
    viewedAt?: string;
    companyActivity: {
        lastActive: string;
        responseTime: number; // in hours
    };
    canWithdraw: boolean;
}

// Company Insights
export interface SalaryInsight {
    role: string;
    min: number;
    max: number;
    average: number;
    currency: string;
    experienceLevel: string;
    dataPoints: number;
}

export interface CompanyInsights {
    companyId: string;
    salaryInsights: SalaryInsight[];
    workCulture: {
        rating: number;
        tags: string[];
        highlights: string[];
    };
    benefits: {
        category: string;
        items: string[];
    }[];
    photos: string[];
    testimonials: {
        id: string;
        author: string;
        role: string;
        rating: number;
        text: string;
        date: string;
    }[];
}

// Job Feed
export interface JobFeedItem {
    id: string;
    type: 'job' | 'company_update' | 'recommendation';
    job?: Job;
    company?: Company;
    reason?: string;
    timestamp: string;
    priority: number;
}

// Followed Companies
export interface FollowedCompany {
    companyId: string;
    company: Company;
    followedAt: string;
    alertsEnabled: boolean;
    openPositions: number;
}

// Resume Strength
export interface ResumeStrength {
    overallScore: number;
    completeness: number;
    atsOptimization: number;
    keywordDensity: number;
    sections: {
        name: string;
        score: number;
        suggestions: string[];
    }[];
    improvements: string[];
}

// Skill Endorsements
export interface SkillEndorsement {
    skillId: string;
    skillName: string;
    endorsements: {
        userId: string;
        userName: string;
        userRole: string;
        date: string;
    }[];
    totalCount: number;
}

// Career Recommendations
export interface CareerRecommendation {
    id: string;
    type: 'job' | 'skill' | 'course' | 'company';
    title: string;
    description: string;
    reason: string;
    priority: 'high' | 'medium' | 'low';
    actionUrl?: string;
}
