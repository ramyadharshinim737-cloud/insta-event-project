/**
 * Scam Detection Utilities
 * AI-based scam detection for job postings
 */

import { Job } from '../types/job.types';
import { ScamDetection, ScamRiskLevel } from '../types/jobEnhancements.types';

export const detectScam = (job: Job): ScamDetection => {
    let score = 0;
    const reasons: string[] = [];
    const flags = {
        unrealisticSalary: false,
        poorDescription: false,
        suspiciousCompany: false,
        urgentHiring: false,
        upfrontPayment: false,
    };

    // Check for unrealistic salary
    const avgSalary = (job.salary.min + job.salary.max) / 2;
    if (avgSalary > 5000000 && job.experience.min < 2) {
        score += 30;
        flags.unrealisticSalary = true;
        reasons.push('Unrealistically high salary for experience level');
    }

    // Check description quality
    if (job.description.length < 100) {
        score += 20;
        flags.poorDescription = true;
        reasons.push('Very brief job description');
    }

    // Check for urgent hiring keywords
    const urgentKeywords = ['urgent', 'immediate', 'asap', 'hurry'];
    if (urgentKeywords.some(keyword => job.title.toLowerCase().includes(keyword))) {
        score += 15;
        flags.urgentHiring = true;
        reasons.push('Urgent hiring pressure tactics');
    }

    // Check for payment-related red flags
    const paymentKeywords = ['registration fee', 'training fee', 'deposit', 'upfront payment'];
    if (paymentKeywords.some(keyword => job.description.toLowerCase().includes(keyword))) {
        score += 35;
        flags.upfrontPayment = true;
        reasons.push('Requests upfront payment or fees');
    }

    // Check company verification
    if (!job.company.verified) {
        score += 10;
        flags.suspiciousCompany = true;
        reasons.push('Company not verified');
    }

    // Determine risk level
    let riskLevel: ScamRiskLevel = 'low';
    if (score >= 50) {
        riskLevel = 'high';
    } else if (score >= 25) {
        riskLevel = 'medium';
    }

    return {
        riskLevel,
        score,
        reasons,
        flags,
    };
};

export const getScamRiskColor = (riskLevel: ScamRiskLevel): string => {
    switch (riskLevel) {
        case 'high':
            return '#EF4444';
        case 'medium':
            return '#F59E0B';
        case 'low':
            return '#10B981';
        default:
            return '#6B7280';
    }
};

export const getScamRiskLabel = (riskLevel: ScamRiskLevel): string => {
    switch (riskLevel) {
        case 'high':
            return 'High Risk';
        case 'medium':
            return 'Medium Risk';
        case 'low':
            return 'Low Risk';
        default:
            return 'Unknown';
    }
};

export const shouldShowWarning = (scamDetection: ScamDetection): boolean => {
    return scamDetection.riskLevel === 'high' || scamDetection.riskLevel === 'medium';
};
