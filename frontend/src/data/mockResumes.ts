/**
 * Mock Resume Data
 * Sample resumes for testing Resume Builder feature
 */

import { Resume, ResumeTemplate, CoverLetter } from '../types/resume.types';

export const getMockResumes = (): Resume[] => {
    return [
        {
            id: 'resume-1',
            userId: 'user-1',
            title: 'Software Engineer Resume',
            templateId: 'template-1',
            version: 3,
            status: 'published',

            personalInfo: {
                name: 'Rahul Sharma',
                email: 'rahul.sharma@email.com',
                phone: '+91 98765 43210',
                location: 'Bengaluru, Karnataka',
                linkedin: 'linkedin.com/in/rahulsharma',
                github: 'github.com/rahulsharma',
                portfolio: 'rahulsharma.dev',
                summary: 'Passionate Full-Stack Developer with 5+ years of experience building scalable web applications. Expertise in React, Node.js, and cloud technologies. Strong problem-solving skills and a track record of delivering high-quality software solutions.',
            },

            experience: [
                {
                    id: 'exp-1',
                    company: 'TechCorp India',
                    role: 'Senior Software Engineer',
                    location: 'Bengaluru, Karnataka',
                    startDate: '2021-06-01',
                    endDate: undefined,
                    current: true,
                    description: [
                        'Lead development of microservices architecture serving 1M+ users',
                        'Implemented CI/CD pipelines reducing deployment time by 60%',
                        'Mentored team of 5 junior developers',
                    ],
                    achievements: [
                        'Reduced API response time by 40% through optimization',
                        'Architected real-time notification system handling 100K+ events/day',
                    ],
                },
                {
                    id: 'exp-2',
                    company: 'StartupXYZ',
                    role: 'Full Stack Developer',
                    location: 'Pune, Maharashtra',
                    startDate: '2019-03-01',
                    endDate: '2021-05-31',
                    current: false,
                    description: [
                        'Built and maintained React-based admin dashboard',
                        'Developed RESTful APIs using Node.js and Express',
                        'Integrated payment gateways (Razorpay, Stripe)',
                    ],
                    achievements: [
                        'Increased user engagement by 35% through UX improvements',
                    ],
                },
            ],

            education: [
                {
                    id: 'edu-1',
                    institution: 'Indian Institute of Technology, Delhi',
                    degree: 'Bachelor of Technology',
                    field: 'Computer Science',
                    location: 'New Delhi',
                    startDate: '2015-07-01',
                    endDate: '2019-05-31',
                    current: false,
                    gpa: '8.5/10',
                    achievements: ['Dean\'s List 2017-2018', 'Best Project Award'],
                },
            ],

            skills: [
                { id: 's1', name: 'React', level: 'expert', category: 'Frontend', yearsOfExperience: 5 },
                { id: 's2', name: 'Node.js', level: 'expert', category: 'Backend', yearsOfExperience: 5 },
                { id: 's3', name: 'TypeScript', level: 'advanced', category: 'Language', yearsOfExperience: 4 },
                { id: 's4', name: 'AWS', level: 'advanced', category: 'Cloud', yearsOfExperience: 3 },
                { id: 's5', name: 'MongoDB', level: 'advanced', category: 'Database', yearsOfExperience: 4 },
                { id: 's6', name: 'Docker', level: 'intermediate', category: 'DevOps', yearsOfExperience: 2 },
                { id: 's7', name: 'PostgreSQL', level: 'advanced', category: 'Database', yearsOfExperience: 3 },
                { id: 's8', name: 'GraphQL', level: 'intermediate', category: 'Backend', yearsOfExperience: 2 },
            ],

            projects: [
                {
                    id: 'proj-1',
                    name: 'E-commerce Platform',
                    description: 'Built a full-featured e-commerce platform with payment integration',
                    technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
                    link: 'github.com/rahul/ecommerce',
                    startDate: '2020-01-01',
                    endDate: '2020-06-30',
                    highlights: [
                        'Handled 10K+ daily active users',
                        'Implemented real-time inventory management',
                    ],
                },
            ],

            certifications: [
                {
                    id: 'cert-1',
                    name: 'AWS Certified Solutions Architect',
                    issuer: 'Amazon Web Services',
                    issueDate: '2022-03-15',
                    credentialId: 'AWS-SA-12345',
                    link: 'aws.amazon.com/verify/12345',
                },
            ],

            languages: [
                { id: 'lang-1', name: 'English', proficiency: 'fluent' },
                { id: 'lang-2', name: 'Hindi', proficiency: 'native' },
            ],

            aiScore: {
                overall: 92,
                atsCompatibility: 95,
                contentQuality: 90,
                keywordOptimization: 88,
                formatScore: 94,
                suggestions: [
                    'Add more quantifiable achievements',
                    'Include keywords like "Agile" and "Scrum"',
                    'Expand on leadership experience',
                ],
                strengths: [
                    'Strong technical skills section',
                    'Excellent use of action verbs',
                    'Well-structured experience descriptions',
                ],
                weaknesses: [
                    'Could add more metrics to achievements',
                    'Missing some trending technologies',
                ],
            },

            targetRole: 'Senior Software Engineer',
            targetIndustry: 'Technology',

            createdAt: '2024-01-15T10:00:00Z',
            updatedAt: '2024-01-20T15:30:00Z',
            lastExportedAt: '2024-01-20T16:00:00Z',
        },

        {
            id: 'resume-2',
            userId: 'user-1',
            title: 'Product Manager Resume',
            templateId: 'template-2',
            version: 1,
            status: 'draft',

            personalInfo: {
                name: 'Rahul Sharma',
                email: 'rahul.sharma@email.com',
                phone: '+91 98765 43210',
                location: 'Bengaluru, Karnataka',
                linkedin: 'linkedin.com/in/rahulsharma',
                summary: 'Technical Product Manager with engineering background and 3+ years of product experience. Skilled in product strategy, roadmap planning, and cross-functional team leadership.',
            },

            experience: [
                {
                    id: 'exp-3',
                    company: 'TechCorp India',
                    role: 'Associate Product Manager',
                    location: 'Bengaluru, Karnataka',
                    startDate: '2022-01-01',
                    current: true,
                    description: [
                        'Manage product roadmap for B2B SaaS platform',
                        'Conduct user research and gather requirements',
                        'Collaborate with engineering and design teams',
                    ],
                    achievements: [
                        'Launched 3 major features increasing user retention by 25%',
                    ],
                },
            ],

            education: [
                {
                    id: 'edu-2',
                    institution: 'Indian Institute of Technology, Delhi',
                    degree: 'Bachelor of Technology',
                    field: 'Computer Science',
                    location: 'New Delhi',
                    startDate: '2015-07-01',
                    endDate: '2019-05-31',
                    current: false,
                    gpa: '8.5/10',
                },
            ],

            skills: [
                { id: 's9', name: 'Product Strategy', level: 'advanced', category: 'Product' },
                { id: 's10', name: 'User Research', level: 'advanced', category: 'Product' },
                { id: 's11', name: 'Agile/Scrum', level: 'expert', category: 'Methodology' },
                { id: 's12', name: 'SQL', level: 'intermediate', category: 'Technical' },
                { id: 's13', name: 'Figma', level: 'intermediate', category: 'Design' },
            ],

            projects: [],
            certifications: [],

            aiScore: {
                overall: 78,
                atsCompatibility: 80,
                contentQuality: 75,
                keywordOptimization: 72,
                formatScore: 85,
                suggestions: [
                    'Add more product management certifications',
                    'Include metrics for product launches',
                    'Expand on stakeholder management experience',
                ],
                strengths: [
                    'Clear career transition story',
                    'Good balance of technical and product skills',
                ],
                weaknesses: [
                    'Limited product management experience',
                    'Missing key PM frameworks (OKRs, RICE)',
                ],
            },

            targetRole: 'Product Manager',
            targetIndustry: 'SaaS',

            createdAt: '2024-01-22T10:00:00Z',
            updatedAt: '2024-01-22T10:30:00Z',
        },
    ];
};

export const getResumeById = (id: string): Resume | undefined => {
    return getMockResumes().find((resume) => resume.id === id);
};

export const getMockTemplates = (): ResumeTemplate[] => {
    return [
        {
            id: 'template-1',
            name: 'Professional',
            description: 'Clean and professional design perfect for corporate roles',
            category: 'professional',
            thumbnail: 'https://picsum.photos/seed/template1/300/400',
            atsOptimized: true,
            colors: {
                primary: '#2563EB',
                secondary: '#1E40AF',
                accent: '#3B82F6',
            },
        },
        {
            id: 'template-2',
            name: 'Modern',
            description: 'Contemporary design with a creative touch',
            category: 'modern',
            thumbnail: 'https://picsum.photos/seed/template2/300/400',
            atsOptimized: true,
            colors: {
                primary: '#10B981',
                secondary: '#059669',
                accent: '#34D399',
            },
        },
        {
            id: 'template-3',
            name: 'Minimal',
            description: 'Simple and elegant, focusing on content',
            category: 'minimal',
            thumbnail: 'https://picsum.photos/seed/template3/300/400',
            atsOptimized: true,
            colors: {
                primary: '#6B7280',
                secondary: '#4B5563',
                accent: '#9CA3AF',
            },
        },
        {
            id: 'template-4',
            name: 'Creative',
            description: 'Bold design for creative professionals',
            category: 'creative',
            thumbnail: 'https://picsum.photos/seed/template4/300/400',
            atsOptimized: false,
            colors: {
                primary: '#8B5CF6',
                secondary: '#7C3AED',
                accent: '#A78BFA',
            },
        },
        {
            id: 'template-5',
            name: 'Technical',
            description: 'Optimized for tech and engineering roles',
            category: 'technical',
            thumbnail: 'https://picsum.photos/seed/template5/300/400',
            atsOptimized: true,
            colors: {
                primary: '#0EA5E9',
                secondary: '#0284C7',
                accent: '#38BDF8',
            },
        },
    ];
};

export const getMockCoverLetters = (): CoverLetter[] => {
    return [
        {
            id: 'cover-1',
            resumeId: 'resume-1',
            jobTitle: 'Senior Software Engineer',
            companyName: 'TechCorp',
            content: `Dear Hiring Manager,

I am writing to express my strong interest in the Senior Software Engineer position at TechCorp. With over 5 years of experience in full-stack development and a proven track record of building scalable applications, I am excited about the opportunity to contribute to your team.

In my current role at TechCorp India, I have led the development of microservices architecture serving over 1 million users. I successfully reduced API response times by 40% and architected a real-time notification system handling 100,000+ events daily. These experiences have honed my skills in React, Node.js, and cloud technologies—exactly what you're looking for.

What particularly excites me about TechCorp is your commitment to innovation and your focus on creating impactful solutions. I am impressed by your recent product launches and would love to bring my expertise in scalable architecture and team leadership to help drive your next phase of growth.

I would welcome the opportunity to discuss how my background, skills, and enthusiasms align with TechCorp's needs. Thank you for considering my application.

Best regards,
Rahul Sharma`,
            createdAt: '2024-01-20T14:00:00Z',
            updatedAt: '2024-01-20T14:00:00Z',
        },
    ];
};

export default getMockResumes;
