/**
 * Job Utilities
 * Helper functions for job operations
 */

import { Job, JobFilters, JobMatchScore } from '../types/job.types';

export const filterJobs = (jobs: Job[], filters: JobFilters): Job[] => {
    let filtered = [...jobs];

    if (filters.keywords) {
        const keywords = filters.keywords.toLowerCase();
        filtered = filtered.filter(
            (job) =>
                job.title.toLowerCase().includes(keywords) ||
                job.company.name.toLowerCase().includes(keywords) ||
                job.description.toLowerCase().includes(keywords)
        );
    }

    if (filters.location) {
        filtered = filtered.filter((job) =>
            job.location.city.toLowerCase().includes(filters.location!.toLowerCase())
        );
    }

    if (filters.workMode && filters.workMode.length > 0) {
        filtered = filtered.filter((job) => filters.workMode!.includes(job.workMode));
    }

    if (filters.jobType && filters.jobType.length > 0) {
        filtered = filtered.filter((job) => filters.jobType!.includes(job.jobType));
    }

    if (filters.experienceLevel && filters.experienceLevel.length > 0) {
        filtered = filtered.filter((job) =>
            filters.experienceLevel!.includes(job.experience.level)
        );
    }

    if (filters.salary) {
        if (filters.salary.min) {
            filtered = filtered.filter((job) => job.salary.min >= filters.salary!.min!);
        }
        if (filters.salary.max) {
            filtered = filtered.filter((job) => job.salary.max <= filters.salary!.max!);
        }
    }

    if (filters.remote !== undefined) {
        filtered = filtered.filter((job) => job.location.remote === filters.remote);
    }

    if (filters.postedWithin) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - filters.postedWithin);
        filtered = filtered.filter(
            (job) => new Date(job.postedDate) >= cutoffDate
        );
    }

    return filtered;
};

export const sortJobs = (
    jobs: Job[],
    sortBy: JobFilters['sortBy'] = 'date',
    sortOrder: JobFilters['sortOrder'] = 'desc'
): Job[] => {
    const sorted = [...jobs];

    sorted.sort((a, b) => {
        let comparison = 0;

        switch (sortBy) {
            case 'date':
                comparison =
                    new Date(a.postedDate).getTime() - new Date(b.postedDate).getTime();
                break;
            case 'salary':
                comparison = a.salary.min - b.salary.min;
                break;
            case 'relevance':
                comparison = b.views - a.views;
                break;
            default:
                comparison = 0;
        }

        return sortOrder === 'asc' ? comparison : -comparison;
    });

    return sorted;
};

export const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number => {
    const R = 6371; // Radius of the Earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return Math.round(distance * 10) / 10;
};

export const formatSalary = (min: number, max: number, currency: string = 'INR'): string => {
    const formatAmount = (amount: number) => {
        if (currency === 'INR') {
            if (amount >= 10000000) {
                return `₹${(amount / 10000000).toFixed(1)}Cr`;
            }
            return `₹${(amount / 100000).toFixed(0)}L`;
        }
        return `$${(amount / 1000).toFixed(0)}K`;
    };

    return `${formatAmount(min)}-${formatAmount(max)}`;
};

export const getMatchColor = (match: number): string => {
    if (match >= 90) return '#10B981';
    if (match >= 75) return '#3B82F6';
    if (match >= 60) return '#F59E0B';
    return '#EF4444';
};

export const getMatchLabel = (match: number): string => {
    if (match >= 90) return 'Excellent Match';
    if (match >= 75) return 'Good Match';
    if (match >= 60) return 'Fair Match';
    return 'Low Match';
};

export const formatPostedDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Posted today';
    if (diffDays === 1) return 'Posted yesterday';
    if (diffDays < 7) return `Posted ${diffDays} days ago`;
    if (diffDays < 30) return `Posted ${Math.floor(diffDays / 7)} weeks ago`;
    return `Posted ${Math.floor(diffDays / 30)} months ago`;
};

export const calculateJobMatch = (
    job: Job,
    resumeSkills: string[]
): JobMatchScore => {
    const jobSkills = [...job.skills, ...(job.preferredSkills || [])];
    const matchingSkills = resumeSkills.filter((skill) =>
        jobSkills.some((js) => js.toLowerCase() === skill.toLowerCase())
    );
    const missingSkills = jobSkills.filter(
        (skill) =>
            !resumeSkills.some((rs) => rs.toLowerCase() === skill.toLowerCase())
    );

    const skillMatch = (matchingSkills.length / jobSkills.length) * 100;
    const experienceMatch = 80; // Mock
    const educationMatch = 85; // Mock
    const locationMatch = job.location.remote ? 100 : 75;

    const overallMatch = Math.round(
        (skillMatch * 0.5 + experienceMatch * 0.25 + educationMatch * 0.15 + locationMatch * 0.1)
    );

    return {
        jobId: job.id,
        resumeId: '',
        overallMatch,
        skillMatch: Math.round(skillMatch),
        experienceMatch,
        educationMatch,
        locationMatch,
        matchingSkills,
        missingSkills,
        strengths: matchingSkills.slice(0, 3),
        gaps: missingSkills.slice(0, 3),
        recommendation: overallMatch >= 75 ? 'Highly recommended to apply' : 'Consider improving skills',
        applicationTips: [
            'Highlight your matching skills in your cover letter',
            'Emphasize relevant experience',
            'Research the company culture',
        ],
    };
};

export const isJobExpiringSoon = (job: Job): boolean => {
    if (!job.applicationDeadline) return false;
    const deadline = new Date(job.applicationDeadline);
    const now = new Date();
    const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays > 0;
};

export const getApplicationStatusColor = (status: string): string => {
    switch (status) {
        case 'submitted':
            return '#3B82F6';
        case 'in-review':
            return '#F59E0B';
        case 'interview':
            return '#8B5CF6';
        case 'offer':
            return '#10B981';
        case 'rejected':
            return '#EF4444';
        case 'accepted':
            return '#059669';
        default:
            return '#6B7280';
    }
};

export default {
    filterJobs,
    sortJobs,
    calculateDistance,
    formatSalary,
    getMatchColor,
    getMatchLabel,
    formatPostedDate,
    calculateJobMatch,
    isJobExpiringSoon,
    getApplicationStatusColor,
};
