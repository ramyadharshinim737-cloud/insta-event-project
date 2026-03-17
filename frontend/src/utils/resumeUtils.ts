/**
 * Resume Utilities
 * Helper functions for resume operations
 */

import { Resume, ResumeFilters } from '../types/resume.types';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export const filterResumes = (
    resumes: Resume[],
    filters: ResumeFilters
): Resume[] => {
    let filtered = [...resumes];

    if (filters.status) {
        filtered = filtered.filter((r) => r.status === filters.status);
    }

    if (filters.targetRole) {
        filtered = filtered.filter((r) =>
            r.targetRole?.toLowerCase().includes(filters.targetRole!.toLowerCase())
        );
    }

    if (filters.minScore) {
        filtered = filtered.filter((r) => r.aiScore.overall >= filters.minScore!);
    }

    return filtered;
};

export const sortResumes = (
    resumes: Resume[],
    sortBy: ResumeFilters['sortBy'] = 'updatedAt',
    sortOrder: ResumeFilters['sortOrder'] = 'desc'
): Resume[] => {
    const sorted = [...resumes];

    sorted.sort((a, b) => {
        let comparison = 0;

        switch (sortBy) {
            case 'updatedAt':
                comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
                break;
            case 'createdAt':
                comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                break;
            case 'score':
                comparison = a.aiScore.overall - b.aiScore.overall;
                break;
            case 'title':
                comparison = a.title.localeCompare(b.title);
                break;
            default:
                comparison = 0;
        }

        return sortOrder === 'asc' ? comparison : -comparison;
    });

    return sorted;
};

export const getScoreColor = (score: number): string => {
    if (score >= 90) return '#10B981';
    if (score >= 75) return '#3B82F6';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
};

export const getScoreLabel = (score: number): string => {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Improvement';
};

export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return date.toLocaleDateString();
};

export const calculateCompleteness = (resume: Resume): number => {
    let total = 0;
    let completed = 0;

    // Personal Info (20%)
    total += 20;
    if (resume.personalInfo.name && resume.personalInfo.email && resume.personalInfo.phone) {
        completed += 20;
    }

    // Experience (25%)
    total += 25;
    if (resume.experience.length > 0) {
        completed += 25;
    }

    // Education (15%)
    total += 15;
    if (resume.education.length > 0) {
        completed += 15;
    }

    // Skills (20%)
    total += 20;
    if (resume.skills.length >= 5) {
        completed += 20;
    }

    // Projects (10%)
    total += 10;
    if (resume.projects.length > 0) {
        completed += 10;
    }

    // Summary (10%)
    total += 10;
    if (resume.personalInfo.summary && resume.personalInfo.summary.length > 50) {
        completed += 10;
    }

    return Math.round((completed / total) * 100);
};

export const generateResumePreview = (resume: Resume): string => {
    return `
${resume.personalInfo.name}
${resume.personalInfo.email} | ${resume.personalInfo.phone}
${resume.personalInfo.location}

PROFESSIONAL SUMMARY
${resume.personalInfo.summary}

EXPERIENCE
${resume.experience.map(exp => `
${exp.role} at ${exp.company}
${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}
${exp.description.join('\n')}
`).join('\n')}

EDUCATION
${resume.education.map(edu => `
${edu.degree} in ${edu.field}
${edu.institution}
${edu.startDate} - ${edu.current ? 'Present' : edu.endDate}
`).join('\n')}

SKILLS
${resume.skills.map(s => s.name).join(', ')}
  `.trim();
};

/**
 * Generate HTML template for resume PDF
 */
export const generateResumeHTML = (resumeData: any, template: string = 'professional'): string => {
    const { personalInfo, experience, education, skills } = resumeData;

    const templateColors = {
        professional: { primary: '#2563EB', secondary: '#1E40AF', accent: '#3B82F6' },
        modern: { primary: '#10B981', secondary: '#059669', accent: '#34D399' },
        minimal: { primary: '#6B7280', secondary: '#4B5563', accent: '#9CA3AF' },
        creative: { primary: '#8B5CF6', secondary: '#7C3AED', accent: '#A78BFA' },
    };

    const colors = templateColors[template as keyof typeof templateColors] || templateColors.professional;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #1F2937;
            padding: 40px;
            font-size: 11pt;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid ${colors.primary};
        }
        .name {
            font-size: 28pt;
            font-weight: bold;
            color: ${colors.primary};
            margin-bottom: 10px;
        }
        .contact-info {
            font-size: 10pt;
            color: #6B7280;
            margin-top: 8px;
        }
        .section {
            margin-bottom: 25px;
        }
        .section-title {
            font-size: 14pt;
            font-weight: bold;
            color: ${colors.primary};
            margin-bottom: 12px;
            padding-bottom: 6px;
            border-bottom: 2px solid ${colors.accent};
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .summary {
            font-size: 10.5pt;
            line-height: 1.7;
            color: #374151;
            margin-bottom: 20px;
        }
        .experience-item, .education-item {
            margin-bottom: 18px;
            page-break-inside: avoid;
        }
        .item-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 6px;
        }
        .item-title {
            font-size: 12pt;
            font-weight: bold;
            color: #111827;
        }
        .item-subtitle {
            font-size: 11pt;
            color: ${colors.secondary};
            font-weight: 600;
            margin-bottom: 4px;
        }
        .item-date {
            font-size: 9.5pt;
            color: #6B7280;
            font-style: italic;
        }
        .item-location {
            font-size: 9.5pt;
            color: #6B7280;
        }
        .item-description {
            font-size: 10pt;
            color: #4B5563;
            margin-top: 6px;
            line-height: 1.6;
        }
        .skills-container {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }
        .skill-tag {
            display: inline-block;
            padding: 6px 14px;
            background-color: ${colors.primary}15;
            color: ${colors.primary};
            border-radius: 6px;
            font-size: 10pt;
            font-weight: 500;
            border: 1px solid ${colors.primary}30;
        }
        ul {
            margin-left: 20px;
            margin-top: 6px;
        }
        li {
            margin-bottom: 4px;
            color: #4B5563;
            font-size: 10pt;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="name">${personalInfo.name || 'Your Name'}</div>
        <div class="contact-info">
            ${personalInfo.email || 'email@example.com'} • 
            ${personalInfo.phone || '+91 00000 00000'} • 
            ${personalInfo.location || 'Location'}
        </div>
    </div>

    ${personalInfo.summary ? `
    <div class="section">
        <div class="section-title">Professional Summary</div>
        <div class="summary">${personalInfo.summary}</div>
    </div>
    ` : ''}

    ${experience && experience.length > 0 ? `
    <div class="section">
        <div class="section-title">Work Experience</div>
        ${experience.map((exp: any) => `
        <div class="experience-item">
            <div class="item-header">
                <div>
                    <div class="item-title">${exp.role || exp.position}</div>
                    <div class="item-subtitle">${exp.company}</div>
                </div>
                <div style="text-align: right;">
                    <div class="item-date">${exp.startDate} - ${exp.current ? 'Present' : exp.endDate || 'Present'}</div>
                    ${exp.location ? `<div class="item-location">${exp.location}</div>` : ''}
                </div>
            </div>
            ${exp.description ? `<div class="item-description">${exp.description}</div>` : ''}
        </div>
        `).join('')}
    </div>
    ` : ''}

    ${education && education.length > 0 ? `
    <div class="section">
        <div class="section-title">Education</div>
        ${education.map((edu: any) => `
        <div class="education-item">
            <div class="item-header">
                <div>
                    <div class="item-title">${edu.degree}</div>
                    <div class="item-subtitle">${edu.institution}</div>
                    ${edu.field ? `<div class="item-location">Field: ${edu.field}</div>` : ''}
                </div>
                <div style="text-align: right;">
                    <div class="item-date">${edu.startDate} - ${edu.current ? 'Present' : edu.endDate || 'Present'}</div>
                    ${edu.gpa || edu.grade ? `<div class="item-location">GPA: ${edu.gpa || edu.grade}</div>` : ''}
                </div>
            </div>
        </div>
        `).join('')}
    </div>
    ` : ''}

    ${skills && skills.length > 0 ? `
    <div class="section">
        <div class="section-title">Skills</div>
        <div class="skills-container">
            ${skills.map((skill: any) => `
            <span class="skill-tag">${typeof skill === 'string' ? skill : skill.name}</span>
            `).join('')}
        </div>
    </div>
    ` : ''}
</body>
</html>
    `.trim();
};

/**
 * Download resume as PDF
 */
export const downloadResumePDF = async (resumeData: any, template: string = 'professional'): Promise<boolean> => {
    try {
        const html = generateResumeHTML(resumeData, template);
        const { uri } = await Print.printToFileAsync({ html });

        // Share the PDF
        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(uri, {
                mimeType: 'application/pdf',
                dialogTitle: 'Download Resume',
                UTI: 'com.adobe.pdf',
            });
            return true;
        } else {
            console.error('Sharing is not available on this device');
            return false;
        }
    } catch (error) {
        console.error('Error generating PDF:', error);
        return false;
    }
};

export default {
    filterResumes,
    sortResumes,
    getScoreColor,
    getScoreLabel,
    formatDate,
    calculateCompleteness,
    generateResumePreview,
    generateResumeHTML,
    downloadResumePDF,
};
