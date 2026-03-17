/**
 * Match Explanation Utilities
 * Generate AI-powered job match explanations
 */

import { Job } from '../types/job.types';
import { Resume } from '../types/resume.types';
import { MatchExplanation } from '../types/jobEnhancements.types';

export const generateMatchExplanation = (
    job: Job,
    resume: Resume,
    userSkills: string[] = []
): MatchExplanation => {
    const reasons: string[] = [];
    const missingSkills: string[] = [];
    const improvements: MatchExplanation['improvements'] = [];

    // Calculate skill match
    const jobSkills = job.requiredSkills || [];
    const resumeSkills = resume.skills.map(s => s.name);
    const allUserSkills = [...new Set([...resumeSkills, ...userSkills])];

    const matchingSkills = jobSkills.filter(skill =>
        allUserSkills.some(userSkill =>
            userSkill.toLowerCase().includes(skill.toLowerCase()) ||
            skill.toLowerCase().includes(userSkill.toLowerCase())
        )
    );

    const skillMatch = jobSkills.length > 0
        ? Math.round((matchingSkills.length / jobSkills.length) * 100)
        : 100;

    // Find missing skills
    const missing = jobSkills.filter(skill => !matchingSkills.includes(skill));
    missingSkills.push(...missing);

    // Calculate experience match
    const userExperience = resume.experience.reduce((total, exp) => {
        const start = new Date(exp.startDate);
        const end = exp.current ? new Date() : new Date(exp.endDate!);
        const years = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
        return total + years;
    }, 0);

    const experienceMatch =
        userExperience >= job.experience.min && userExperience <= job.experience.max + 2
            ? 100
            : userExperience < job.experience.min
                ? Math.max(0, Math.round((userExperience / job.experience.min) * 100))
                : Math.max(70, 100 - Math.round(((userExperience - job.experience.max) / job.experience.max) * 30));

    // Location match (simplified)
    const locationMatch = job.workMode === 'remote' ? 100 : 80;

    // Salary match (simplified)
    const salaryMatch = 85;

    // Overall match
    const overallMatch = Math.round(
        (skillMatch * 0.4) +
        (experienceMatch * 0.3) +
        (locationMatch * 0.15) +
        (salaryMatch * 0.15)
    );

    // Generate reasons
    if (skillMatch >= 80) {
        reasons.push(`Strong skill match: ${matchingSkills.length}/${jobSkills.length} required skills`);
    } else if (skillMatch >= 60) {
        reasons.push(`Good skill match: ${matchingSkills.length}/${jobSkills.length} required skills`);
    } else {
        reasons.push(`Partial skill match: ${matchingSkills.length}/${jobSkills.length} required skills`);
    }

    if (experienceMatch >= 90) {
        reasons.push(`Your ${Math.round(userExperience)} years experience matches perfectly`);
    } else if (experienceMatch >= 70) {
        reasons.push(`Your experience level is suitable for this role`);
    }

    if (job.workMode === 'remote') {
        reasons.push('Remote work opportunity matches your preferences');
    }

    // Generate improvements
    missing.forEach((skill, index) => {
        const importance = index < 2 ? 'high' : index < 4 ? 'medium' : 'low';
        improvements.push({
            skill,
            importance,
            suggestion: `Learn ${skill} to increase your match score by ${importance === 'high' ? '10-15%' : importance === 'medium' ? '5-10%' : '2-5%'}`,
        });
    });

    return {
        overallMatch,
        skillMatch,
        experienceMatch,
        locationMatch,
        salaryMatch,
        reasons,
        missingSkills,
        improvements,
    };
};

export const getMatchColorByScore = (score: number): string => {
    if (score >= 90) return '#10B981';
    if (score >= 75) return '#3B82F6';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
};

export const getMatchLabel = (score: number): string => {
    if (score >= 90) return 'Excellent Match';
    if (score >= 75) return 'Great Match';
    if (score >= 60) return 'Good Match';
    if (score >= 40) return 'Fair Match';
    return 'Low Match';
};
