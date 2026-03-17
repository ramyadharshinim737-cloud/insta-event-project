/**
 * Job Creation Utilities
 * Helper functions for creating and validating job postings
 */

import {
    JobFormData,
    JobValidationErrors,
    AIJobSuggestions,
    JobScamDetection,
    JobDraft,
    JobPublishResult,
    Job,
    JobCategory,
} from '../types/job.types';
import { SKILL_SUGGESTIONS } from '../data/jobCategories';

// Validate job form data
export const validateJobForm = (
    formData: Partial<JobFormData>,
    step: number
): JobValidationErrors => {
    const errors: JobValidationErrors = {};

    if (step === 1 || step === 7) {
        errors.step1 = {};
        if (!formData.title || formData.title.trim().length < 3) {
            errors.step1.title = 'Job title must be at least 3 characters';
        }
        if (!formData.companyName || formData.companyName.trim().length < 2) {
            errors.step1.companyName = 'Company name is required';
        }
        if (!formData.category) {
            errors.step1.category = 'Please select a job category';
        }
        if (!formData.location?.city || !formData.location?.country) {
            errors.step1.location = 'Location is required';
        }
        if (Object.keys(errors.step1).length === 0) delete errors.step1;
    }

    if (step === 2 || step === 7) {
        errors.step2 = {};
        if (!formData.roleOverview || formData.roleOverview.trim().length < 50) {
            errors.step2.roleOverview = 'Role overview must be at least 50 characters';
        }
        if (!formData.keyResponsibilities || formData.keyResponsibilities.length < 3) {
            errors.step2.keyResponsibilities = 'Add at least 3 key responsibilities';
        }
        if (!formData.requiredSkills || formData.requiredSkills.length < 2) {
            errors.step2.requiredSkills = 'Add at least 2 required skills';
        }
        if (Object.keys(errors.step2).length === 0) delete errors.step2;
    }

    if (step === 3 || step === 7) {
        errors.step3 = {};
        if (!formData.experience || formData.experience.min < 0) {
            errors.step3.experience = 'Experience is required';
        }
        if (formData.experience && formData.experience.min > formData.experience.max) {
            errors.step3.experience = 'Minimum experience cannot exceed maximum';
        }
        if (!formData.education) {
            errors.step3.education = 'Education qualification is required';
        }
        if (Object.keys(errors.step3).length === 0) delete errors.step3;
    }

    if (step === 4 || step === 7) {
        errors.step4 = {};
        if (!formData.salary || formData.salary.min <= 0) {
            errors.step4.salary = 'Minimum salary is required';
        }
        if (formData.salary && formData.salary.min > formData.salary.max) {
            errors.step4.salary = 'Minimum salary cannot exceed maximum';
        }
        if (!formData.benefits || formData.benefits.length === 0) {
            errors.step4.benefits = 'Select at least one benefit';
        }
        if (Object.keys(errors.step4).length === 0) delete errors.step4;
    }

    if (step === 5 || step === 7) {
        errors.step5 = {};
        if (!formData.openings || formData.openings < 1) {
            errors.step5.openings = 'Number of openings must be at least 1';
        }
        if (!formData.applicationDeadline) {
            errors.step5.applicationDeadline = 'Application deadline is required';
        } else {
            const deadline = new Date(formData.applicationDeadline);
            if (deadline <= new Date()) {
                errors.step5.applicationDeadline = 'Deadline must be in the future';
            }
        }
        if (formData.applicationMethod === 'email' && !formData.contactEmail) {
            errors.step5.contactInfo = 'Contact email is required';
        }
        if (formData.applicationMethod === 'url' && !formData.applicationUrl) {
            errors.step5.contactInfo = 'Application URL is required';
        }
        if (Object.keys(errors.step5).length === 0) delete errors.step5;
    }

    if (step === 6 || step === 7) {
        errors.step6 = {};
        if (!formData.companyDescription || formData.companyDescription.trim().length < 30) {
            errors.step6.companyDescription = 'Company description must be at least 30 characters';
        }
        if (formData.companyWebsite && !isValidUrl(formData.companyWebsite)) {
            errors.step6.companyWebsite = 'Please enter a valid URL';
        }
        if (Object.keys(errors.step6).length === 0) delete errors.step6;
    }

    return errors;
};

// Check if form step is valid
export const isStepValid = (
    formData: Partial<JobFormData>,
    step: number
): boolean => {
    const errors = validateJobForm(formData, step);
    const stepKey = `step${step}` as keyof JobValidationErrors;
    return !errors[stepKey] || Object.keys(errors[stepKey]!).length === 0;
};

// Generate AI job description (mock implementation)
export const generateJobDescription = (
    title: string,
    category: JobCategory,
    requiredSkills: string[]
): string => {
    const templates: Record<string, string> = {
        'IT & Software': `We are seeking a talented ${title} to join our dynamic technology team. In this role, you will be responsible for developing and maintaining cutting-edge software solutions that drive our business forward. You'll work with modern technologies and collaborate with cross-functional teams to deliver high-quality products.`,
        'Finance & Accounting': `We are looking for a detail-oriented ${title} to join our finance team. You will play a crucial role in managing financial operations, ensuring accuracy in reporting, and providing strategic insights to support business decisions.`,
        'Marketing & Sales': `Join our marketing team as a ${title} and help us drive growth through innovative marketing strategies. You'll be responsible for developing and executing campaigns that engage our target audience and generate measurable results.`,
        'Healthcare & Medical': `We are seeking a compassionate and skilled ${title} to provide exceptional patient care. You will work in a collaborative environment focused on delivering the highest quality healthcare services.`,
        'Design & Creative': `We're looking for a creative ${title} to bring fresh ideas and innovative designs to our team. You'll work on exciting projects that push creative boundaries and deliver impactful visual solutions.`,
    };

    const baseTemplate = templates[category] || `We are seeking a qualified ${title} to join our growing team. In this role, you will contribute to our mission and work alongside talented professionals in a collaborative environment.`;

    const skillsText = requiredSkills.length > 0
        ? ` The ideal candidate will have expertise in ${requiredSkills.slice(0, 3).join(', ')}.`
        : '';

    return baseTemplate + skillsText;
};

// Suggest skills based on job title and category
export const suggestSkillsForJobTitle = (
    title: string,
    category: JobCategory
): string[] => {
    const categorySkills = SKILL_SUGGESTIONS[category] || [];
    const titleLower = title.toLowerCase();

    // Filter skills based on job title keywords
    const relevantSkills = categorySkills.filter(skill => {
        const skillLower = skill.toLowerCase();
        return (
            titleLower.includes(skillLower) ||
            skillLower.includes(titleLower.split(' ')[0])
        );
    });

    // If no specific matches, return top skills for category
    if (relevantSkills.length < 5) {
        return categorySkills.slice(0, 8);
    }

    return relevantSkills.slice(0, 8);
};

// Detect potential scam in job posting
export const detectJobScamRisk = (
    formData: Partial<JobFormData>
): JobScamDetection => {
    const flags = {
        unrealisticSalary: false,
        poorDescription: false,
        suspiciousContact: false,
        urgentHiring: false,
        upfrontPayment: false,
        vagueDetails: false,
    };

    const warnings: string[] = [];
    let score = 0;

    // Check for unrealistic salary
    if (formData.salary) {
        const avgSalary = (formData.salary.min + formData.salary.max) / 2;
        if (formData.salary.currency === 'INR' && avgSalary > 10000000) {
            flags.unrealisticSalary = true;
            warnings.push('Salary seems unusually high for the market');
            score += 25;
        }
    }

    // Check for poor description
    if (formData.roleOverview && formData.roleOverview.length < 100) {
        flags.poorDescription = true;
        warnings.push('Job description is too brief');
        score += 15;
    }

    // Check for vague details
    if (!formData.keyResponsibilities || formData.keyResponsibilities.length < 2) {
        flags.vagueDetails = true;
        warnings.push('Insufficient job details provided');
        score += 20;
    }

    // Check for urgent hiring
    if (formData.hiringUrgency === 'immediate') {
        flags.urgentHiring = true;
        warnings.push('Immediate hiring may indicate urgency scams');
        score += 10;
    }

    // Check for suspicious contact info
    if (formData.contactEmail && !formData.contactEmail.includes('@')) {
        flags.suspiciousContact = true;
        warnings.push('Invalid contact email format');
        score += 30;
    }

    // Check for upfront payment keywords
    const suspiciousKeywords = ['registration fee', 'training fee', 'deposit', 'upfront payment'];
    const allText = `${formData.roleOverview || ''} ${formData.companyDescription || ''}`.toLowerCase();
    if (suspiciousKeywords.some(keyword => allText.includes(keyword))) {
        flags.upfrontPayment = true;
        warnings.push('Mentions upfront payment - potential scam indicator');
        score += 40;
    }

    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (score >= 50) riskLevel = 'high';
    else if (score >= 25) riskLevel = 'medium';

    return {
        riskLevel,
        score,
        warnings,
        flags,
    };
};

// Generate AI suggestions for job posting
export const generateAISuggestions = (
    formData: Partial<JobFormData>
): AIJobSuggestions => {
    const generatedDescription = formData.title && formData.category
        ? generateJobDescription(
            formData.title,
            formData.category,
            formData.requiredSkills || []
        )
        : '';

    const suggestedSkills = formData.title && formData.category
        ? suggestSkillsForJobTitle(formData.title, formData.category)
        : [];

    const suggestedResponsibilities = generateResponsibilities(
        formData.title || '',
        formData.category || 'Other'
    );

    // Calculate quality score
    let qualityScore = 0;
    if (formData.title && formData.title.length >= 5) qualityScore += 15;
    if (formData.roleOverview && formData.roleOverview.length >= 100) qualityScore += 20;
    if (formData.keyResponsibilities && formData.keyResponsibilities.length >= 3) qualityScore += 15;
    if (formData.requiredSkills && formData.requiredSkills.length >= 3) qualityScore += 15;
    if (formData.benefits && formData.benefits.length >= 3) qualityScore += 10;
    if (formData.companyDescription && formData.companyDescription.length >= 50) qualityScore += 15;
    if (formData.salary && formData.salary.showSalary) qualityScore += 10;

    return {
        generatedDescription,
        suggestedSkills,
        suggestedResponsibilities,
        matchCriteria: {
            skillWeight: 50,
            experienceWeight: 25,
            educationWeight: 15,
            locationWeight: 10,
        },
        seoKeywords: generateSEOKeywords(formData),
        qualityScore: Math.min(qualityScore, 100),
    };
};

// Generate suggested responsibilities
const generateResponsibilities = (title: string, category: JobCategory): string[] => {
    const commonResponsibilities = [
        'Collaborate with cross-functional teams',
        'Participate in team meetings and planning sessions',
        'Maintain documentation and reports',
        'Contribute to continuous improvement initiatives',
    ];

    const categoryResponsibilities: Record<string, string[]> = {
        'IT & Software': [
            'Design, develop, and maintain software applications',
            'Write clean, maintainable, and efficient code',
            'Participate in code reviews and testing',
            'Troubleshoot and debug applications',
        ],
        'Marketing & Sales': [
            'Develop and execute marketing campaigns',
            'Analyze market trends and customer insights',
            'Manage social media and digital presence',
            'Generate leads and drive sales growth',
        ],
        'Finance & Accounting': [
            'Prepare financial statements and reports',
            'Manage accounts payable and receivable',
            'Conduct financial analysis and forecasting',
            'Ensure compliance with accounting standards',
        ],
    };

    return [...(categoryResponsibilities[category] || commonResponsibilities)];
};

// Generate SEO keywords
const generateSEOKeywords = (formData: Partial<JobFormData>): string[] => {
    const keywords: string[] = [];

    if (formData.title) keywords.push(formData.title);
    if (formData.category) keywords.push(formData.category);
    if (formData.location?.city) keywords.push(formData.location.city);
    if (formData.workMode) keywords.push(formData.workMode);
    if (formData.jobType) keywords.push(formData.jobType);
    if (formData.requiredSkills) keywords.push(...formData.requiredSkills.slice(0, 5));

    return keywords;
};

// Save job as draft
export const saveDraftJob = (
    formData: Partial<JobFormData>,
    currentStep: number
): JobDraft => {
    const draftId = `draft_${Date.now()}`;
    const draft: JobDraft = {
        id: draftId,
        formData,
        currentStep,
        lastSaved: new Date().toISOString(),
        createdAt: new Date().toISOString(),
    };

    // In a real app, save to AsyncStorage or backend
    console.log('Draft saved:', draft);

    return draft;
};

// Publish job to backend
export const publishJob = async (
    formData: JobFormData
): Promise<JobPublishResult> => {
    // Validate all steps
    const errors = validateJobForm(formData, 7);

    if (Object.keys(errors).length > 0) {
        return {
            success: false,
            message: 'Please fix validation errors before publishing',
            errors: Object.values(errors).flatMap(stepErrors =>
                Object.values(stepErrors || {})
            ),
        };
    }

    // Check for scam risk
    const scamDetection = detectJobScamRisk(formData);
    if (scamDetection.riskLevel === 'high') {
        return {
            success: false,
            message: 'Job posting flagged for review due to high scam risk',
            errors: scamDetection.warnings,
        };
    }

    try {
        // Call the backend API
        const { jobsApi } = require('../services/jobs.api');
        
        // Transform formData to match backend schema
        // Backend expects: { title, company, location, type, level, salary, description, requirements }
        
        // Format location as string
        const locationStr = formData.location?.isRemote 
            ? 'Remote'
            : `${formData.location?.city || ''}, ${formData.location?.state || ''}, ${formData.location?.country || ''}`.trim();
        
        // Format salary as string
        const salaryStr = formData.salary?.min && formData.salary?.max
            ? `₹${(formData.salary.min / 100000).toFixed(0)}L - ₹${(formData.salary.max / 100000).toFixed(0)}L ${formData.salary.type || 'yearly'}`
            : '';
        
        // Format requirements as array of strings
        const requirementsArray: string[] = [];
        
        if (formData.education) {
            requirementsArray.push(`Education: ${formData.education}`);
        }
        
        if (formData.experience?.min !== undefined || formData.experience?.max !== undefined) {
            requirementsArray.push(`Experience: ${formData.experience?.min || 0}-${formData.experience?.max || 0} years`);
        }
        
        if (formData.skills && formData.skills.length > 0) {
            requirementsArray.push(`Skills: ${formData.skills.join(', ')}`);
        }
        
        if (formData.certifications && formData.certifications.length > 0) {
            requirementsArray.push(`Certifications: ${formData.certifications.join(', ')}`);
        }
        
        // Map jobType to backend format (capitalize first letter)
        const mapJobType = (type: string): string => {
            const typeMap: { [key: string]: string } = {
                'full-time': 'Full-time',
                'part-time': 'Part-time',
                'contract': 'Contract',
                'internship': 'Internship',
            };
            return typeMap[type.toLowerCase()] || 'Full-time';
        };
        
        // Map experience level to backend format
        const mapLevel = (level: string): string => {
            const levelMap: { [key: string]: string } = {
                'entry': 'Entry',
                'mid': 'Mid',
                'senior': 'Senior',
                'lead': 'Lead',
            };
            return levelMap[level?.toLowerCase()] || 'Entry';
        };
        
        const jobData = {
            title: formData.title || '',
            company: formData.companyName || '',
            location: locationStr,
            type: mapJobType(formData.jobType || 'full-time'),
            level: mapLevel(formData.experience?.level || formData.experienceLevel || 'entry'),
            salary: salaryStr,
            description: formData.roleOverview || '',
            requirements: requirementsArray,
        };

        const newJob = await jobsApi.createJob(jobData);

        return {
            success: true,
            jobId: newJob._id,
            message: 'Job posted successfully!',
        };
    } catch (error: any) {
        console.error('Error publishing job:', error);
        return {
            success: false,
            message: error.message || 'Failed to publish job. Please try again.',
            errors: [error.message],
        };
    }
};

// Helper function to validate URL
const isValidUrl = (url: string): boolean => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

// Format job form data to Job object
export const formatJobForPreview = (formData: JobFormData): Partial<Job> => {
    return {
        id: 'preview',
        title: formData.title,
        company: {
            id: 'temp',
            name: formData.companyName,
            logo: formData.companyLogo || '',
            size: 'Unknown',
            industry: formData.category,
            website: formData.companyWebsite,
            description: formData.companyDescription,
            ratings: {
                overall: 0,
                workLife: 0,
                culture: 0,
                growth: 0,
                compensation: 0,
                management: 0,
            },
            benefits: formData.benefits,
            verified: false,
        },
        location: {
            address: '',
            city: formData.location.city,
            state: formData.location.state,
            country: formData.location.country,
            latitude: 0,
            longitude: 0,
            remote: formData.location.isRemote,
        },
        salary: {
            min: formData.salary.min,
            max: formData.salary.max,
            currency: formData.salary.currency,
            period: formData.salary.type === 'yearly' ? 'yearly' : formData.salary.type === 'monthly' ? 'monthly' : 'hourly',
        },
        experience: formData.experience,
        workMode: formData.workMode,
        jobType: formData.jobType,
        description: formData.roleOverview,
        requirements: [formData.education, ...formData.certifications],
        responsibilities: formData.keyResponsibilities,
        skills: formData.requiredSkills,
        preferredSkills: formData.preferredSkills,
        benefits: formData.benefits,
        postedDate: new Date().toISOString(),
        applicationDeadline: formData.applicationDeadline,
        applicants: 0,
        views: 0,
        openings: formData.openings,
        aiVerified: false,
        scamScore: 0,
        featured: false,
        urgent: formData.hiringUrgency === 'immediate',
        contactEmail: formData.contactEmail,
        applicationUrl: formData.applicationUrl,
    };
};
