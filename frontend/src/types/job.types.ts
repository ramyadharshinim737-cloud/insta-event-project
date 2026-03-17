/**
 * Job Types
 * Type definitions for Job Search feature
 */

export type WorkMode = 'remote' | 'hybrid' | 'onsite';
export type JobType = 'full-time' | 'part-time' | 'contract' | 'internship';
export type ExperienceLevel = 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
export type ApplicationStatus = 'draft' | 'submitted' | 'in-review' | 'interview' | 'offer' | 'rejected' | 'accepted' | 'withdrawn';

export interface Location {
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode?: string;
    latitude: number;
    longitude: number;
    remote: boolean;
}

export interface Salary {
    min: number;
    max: number;
    currency: string;
    period: 'yearly' | 'monthly' | 'hourly';
}

export interface Company {
    id: string;
    name: string;
    logo: string;
    size: string;
    industry: string;
    website: string;
    description: string;
    founded?: string;

    ratings: {
        overall: number;
        workLife: number;
        culture: number;
        growth: number;
        compensation: number;
        management: number;
    };

    benefits: string[];
    verified: boolean;
}

export interface CompanyReview {
    id: string;
    companyId: string;
    userId: string;
    userName: string;
    userRole: string;
    rating: number;
    title: string;
    pros: string;
    cons: string;
    advice?: string;
    createdAt: string;
    helpful: number;
}

export interface Job {
    id: string;
    title: string;
    company: Company;
    location: Location;

    salary: Salary;

    experience: {
        min: number;
        max: number;
        level: ExperienceLevel;
    };

    workMode: WorkMode;
    jobType: JobType;

    description: string;
    requirements: string[];
    responsibilities: string[];
    skills: string[];
    requiredSkills?: string[];
    preferredSkills?: string[];

    benefits: string[];
    perks?: string[]

    ;

    postedDate: string;
    expiryDate?: string;
    applicationDeadline?: string;

    applicants: number;
    views: number;
    openings: number;

    aiVerified: boolean;
    scamScore: number;
    scamFlags?: string[];

    featured: boolean;
    urgent: boolean;

    contactEmail?: string;
    applicationUrl?: string;
}

export interface JobMatchScore {
    jobId: string;
    resumeId: string;
    overallMatch: number;
    skillMatch: number;
    experienceMatch: number;
    educationMatch: number;
    locationMatch: number;

    matchingSkills: string[];
    missingSkills: string[];

    strengths: string[];
    gaps: string[];

    recommendation: string;
    applicationTips: string[];
}

export interface JobApplication {
    id: string;
    jobId: string;
    job: Job;
    resumeId: string;
    coverLetterId?: string;

    status: ApplicationStatus;
    appliedDate: string;
    lastUpdated: string;

    timeline: ApplicationTimeline[];

    notes?: string;
    followUpDate?: string;

    interviewDetails?: InterviewDetails;
}

export interface ApplicationTimeline {
    id: string;
    status: ApplicationStatus;
    date: string;
    note?: string;
}

export interface InterviewDetails {
    scheduledDate?: string;
    interviewType: 'phone' | 'video' | 'onsite' | 'technical' | 'hr';
    interviewers?: string[];
    location?: string;
    meetingLink?: string;
    notes?: string;
    completed: boolean;
    feedback?: string;
}

export interface JobAlert {
    id: string;
    userId: string;
    name: string;

    filters: JobFilters;

    frequency: 'instant' | 'daily' | 'weekly';
    enabled: boolean;

    lastSent?: string;
    createdAt: string;
}

export interface JobFilters {
    keywords?: string;
    location?: string;
    radius?: number; // in km
    workMode?: WorkMode[];
    jobType?: JobType[];
    experienceLevel?: ExperienceLevel[];
    salary?: {
        min?: number;
        max?: number;
    };
    companies?: string[];
    industries?: string[];
    postedWithin?: number; // days
    remote?: boolean;
    sortBy?: 'relevance' | 'date' | 'salary' | 'distance' | 'match';
    sortOrder?: 'asc' | 'desc';
}

export interface InterviewPrep {
    jobId: string;
    jobTitle: string;
    companyName: string;

    commonQuestions: InterviewQuestion[];
    technicalQuestions: InterviewQuestion[];
    behavioralQuestions: InterviewQuestion[];

    companyInsights: string[];
    interviewTips: string[];

    mockInterviewAvailable: boolean;
}

export interface InterviewQuestion {
    id: string;
    question: string;
    category: 'technical' | 'behavioral' | 'situational' | 'company-specific';
    difficulty: 'easy' | 'medium' | 'hard';
    suggestedAnswer?: string;
    tips: string[];
}

export interface SavedJob {
    id: string;
    userId: string;
    jobId: string;
    job: Job;
    savedAt: string;
    notes?: string;
    tags?: string[];
}

// Application type for enhanced features
export interface Application {
    id: string;
    jobId: string;
    job: Job;
    status: ApplicationStatus;
    appliedDate: string;
    lastUpdated: string;
}

// Job Creation Types
export type JobCategory =
    | 'IT & Software'
    | 'Finance & Accounting'
    | 'Marketing & Sales'
    | 'Healthcare & Medical'
    | 'Education & Training'
    | 'Engineering & Manufacturing'
    | 'Design & Creative'
    | 'Customer Service'
    | 'Human Resources'
    | 'Legal & Compliance'
    | 'Operations & Logistics'
    | 'Real Estate'
    | 'Hospitality & Tourism'
    | 'Media & Communications'
    | 'Retail & E-commerce'
    | 'Other';

export type SalaryType = 'monthly' | 'yearly' | 'hourly';
export type HiringUrgency = 'immediate' | 'normal';
export type InterviewProcessType = 'online' | 'offline' | 'hybrid';
export type ApplicationMethod = 'email' | 'url' | 'in-app';

export interface JobFormData {
    // Step 1: Basic Information
    title: string;
    companyName: string;
    category: JobCategory;
    jobType: JobType;
    workMode: WorkMode;
    location: {
        city: string;
        state: string;
        country: string;
        isRemote: boolean;
    };

    // Step 2: Job Description
    roleOverview: string;
    keyResponsibilities: string[];
    requiredSkills: string[];
    preferredSkills: string[];

    // Step 3: Candidate Requirements
    experience: {
        min: number;
        max: number;
        level: ExperienceLevel;
    };
    education: string;
    certifications: string[];
    languages: string[];

    // Step 4: Compensation & Benefits
    salary: {
        min: number;
        max: number;
        currency: string;
        type: SalaryType;
        showSalary: boolean;
    };
    benefits: string[];
    customBenefits: string[];

    // Step 5: Hiring Details
    openings: number;
    applicationDeadline: string;
    hiringUrgency: HiringUrgency;
    interviewProcess: InterviewProcessType;
    applicationMethod: ApplicationMethod;
    contactEmail?: string;
    applicationUrl?: string;

    // Step 6: Additional Information
    companyDescription: string;
    companyWebsite: string;
    companyLogo?: string;
    equalOpportunity: boolean;
    customMessage?: string;
    tags: string[];
}

export interface AIJobSuggestions {
    generatedDescription: string;
    suggestedSkills: string[];
    suggestedResponsibilities: string[];
    matchCriteria: {
        skillWeight: number;
        experienceWeight: number;
        educationWeight: number;
        locationWeight: number;
    };
    seoKeywords: string[];
    qualityScore: number;
}

export interface JobScamDetection {
    riskLevel: 'low' | 'medium' | 'high';
    score: number; // 0-100
    warnings: string[];
    flags: {
        unrealisticSalary: boolean;
        poorDescription: boolean;
        suspiciousContact: boolean;
        urgentHiring: boolean;
        upfrontPayment: boolean;
        vagueDetails: boolean;
    };
}

export interface JobValidationErrors {
    step1?: {
        title?: string;
        companyName?: string;
        category?: string;
        location?: string;
    };
    step2?: {
        roleOverview?: string;
        keyResponsibilities?: string;
        requiredSkills?: string;
    };
    step3?: {
        experience?: string;
        education?: string;
    };
    step4?: {
        salary?: string;
        benefits?: string;
    };
    step5?: {
        openings?: string;
        applicationDeadline?: string;
        contactInfo?: string;
    };
    step6?: {
        companyDescription?: string;
        companyWebsite?: string;
    };
}

export interface JobDraft {
    id: string;
    formData: Partial<JobFormData>;
    currentStep: number;
    lastSaved: string;
    createdAt: string;
}

export interface JobPublishResult {
    success: boolean;
    jobId?: string;
    message: string;
    errors?: string[];
}
