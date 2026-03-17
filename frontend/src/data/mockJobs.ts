/**
 * Mock Job Data
 * Sample jobs for testing Job Search feature
 */

import { Job, Company, JobApplication, SavedJob, InterviewPrep } from '../types/job.types';

const mockCompanies: Company[] = [
    {
        id: 'company-1',
        name: 'TechCorp Solutions',
        logo: 'https://picsum.photos/seed/techcorp/100/100',
        size: '201-500',
        industry: 'Technology',
        website: 'techcorp.com',
        description: 'Leading technology solutions provider specializing in cloud and AI',
        founded: '2015',
        ratings: {
            overall: 4.2,
            workLife: 4.0,
            culture: 4.3,
            growth: 4.5,
            compensation: 4.1,
            management: 4.0,
        },
        benefits: ['Health Insurance', 'Work from Home', 'Flexible Hours', 'Learning Budget'],
        verified: true,
    },
    {
        id: 'company-2',
        name: 'StartupXYZ',
        logo: 'https://picsum.photos/seed/startupxyz/100/100',
        size: '51-200',
        industry: 'SaaS',
        website: 'startupxyz.com',
        description: 'Fast-growing SaaS startup revolutionizing project management',
        founded: '2020',
        ratings: {
            overall: 4.5,
            workLife: 4.7,
            culture: 4.8,
            growth: 4.6,
            compensation: 4.2,
            management: 4.4,
        },
        benefits: ['Stock Options', 'Remote Work', 'Unlimited PTO', 'Team Outings'],
        verified: true,
    },
    {
        id: 'company-3',
        name: 'FinTech Innovations',
        logo: 'https://picsum.photos/seed/fintech/100/100',
        size: '501-1000',
        industry: 'Financial Services',
        website: 'fintechinnovations.com',
        description: 'Innovative fintech company transforming digital payments',
        founded: '2018',
        ratings: {
            overall: 4.0,
            workLife: 3.8,
            culture: 4.1,
            growth: 4.3,
            compensation: 4.4,
            management: 3.9,
        },
        benefits: ['Performance Bonus', 'Health Insurance', 'Gym Membership', 'Meals'],
        verified: true,
    },
];

export const getMockJobs = (): Job[] => {
    const now = new Date();
    const timestamp = Date.now();

    return [
        {
            id: 'job-1',
            title: 'Senior Software Engineer',
            company: mockCompanies[0],
            location: {
                address: 'Koramangala, Bengaluru',
                city: 'Bengaluru',
                state: 'Karnataka',
                country: 'India',
                zipCode: '560034',
                latitude: 12.9352,
                longitude: 77.6245,
                remote: false,
            },
            salary: {
                min: 1500000,
                max: 2500000,
                currency: 'INR',
                period: 'yearly',
            },
            experience: {
                min: 5,
                max: 8,
                level: 'senior',
            },
            workMode: 'hybrid',
            jobType: 'full-time',
            description: 'We are looking for an experienced Senior Software Engineer to join our growing team. You will be responsible for designing and implementing scalable backend systems, mentoring junior developers, and contributing to architectural decisions.',
            requirements: [
                '5+ years of experience in software development',
                'Strong proficiency in React and Node.js',
                'Experience with microservices architecture',
                'Excellent problem-solving skills',
                'Strong communication and teamwork abilities',
            ],
            responsibilities: [
                'Design and develop scalable backend services',
                'Lead technical discussions and code reviews',
                'Mentor junior team members',
                'Collaborate with product and design teams',
                'Ensure code quality and best practices',
            ],
            skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'MongoDB', 'Docker', 'Kubernetes'],
            preferredSkills: ['GraphQL', 'Redis', 'Microservices', 'CI/CD'],
            benefits: [
                'Competitive salary and equity',
                'Health insurance for family',
                'Flexible work hours',
                'Learning and development budget',
                'Work from home options',
            ],
            perks: ['Free meals', 'Gym membership', 'Team outings', 'Latest tech equipment'],
            postedDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            applicationDeadline: new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000).toISOString(),
            applicants: 45,
            views: 320,
            openings: 2,
            aiVerified: true,
            scamScore: 5,
            featured: true,
            urgent: false,
            contactEmail: 'careers@techcorp.com',
        },

        {
            id: 'job-2',
            title: 'Product Manager',
            company: mockCompanies[1],
            location: {
                address: 'Remote',
                city: 'Anywhere',
                state: '',
                country: 'India',
                latitude: 0,
                longitude: 0,
                remote: true,
            },
            salary: {
                min: 2000000,
                max: 3000000,
                currency: 'INR',
                period: 'yearly',
            },
            experience: {
                min: 3,
                max: 5,
                level: 'mid',
            },
            workMode: 'remote',
            jobType: 'full-time',
            description: 'Join our product team to drive the vision and strategy for our flagship SaaS product. You will work closely with engineering, design, and business teams to deliver features that delight our customers.',
            requirements: [
                '3+ years of product management experience',
                'Strong analytical and problem-solving skills',
                'Experience with B2B SaaS products',
                'Excellent communication skills',
                'Technical background preferred',
            ],
            responsibilities: [
                'Define product roadmap and strategy',
                'Conduct user research and gather requirements',
                'Prioritize features and manage backlog',
                'Collaborate with cross-functional teams',
                'Track and analyze product metrics',
            ],
            skills: ['Product Strategy', 'User Research', 'Agile', 'SQL', 'Analytics'],
            preferredSkills: ['Figma', 'JIRA', 'A/B Testing', 'Growth Hacking'],
            benefits: [
                'Stock options',
                'Unlimited PTO',
                'Remote work',
                'Health insurance',
                'Learning budget',
            ],
            perks: ['Home office setup', 'Quarterly team meetups', 'Conference tickets'],
            postedDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            applicants: 78,
            views: 540,
            openings: 1,
            aiVerified: true,
            scamScore: 3,
            featured: false,
            urgent: true,
        },

        {
            id: 'job-3',
            title: 'Full Stack Developer',
            company: mockCompanies[0],
            location: {
                address: 'Indiranagar, Bengaluru',
                city: 'Bengaluru',
                state: 'Karnataka',
                country: 'India',
                zipCode: '560038',
                latitude: 12.9716,
                longitude: 77.6412,
                remote: false,
            },
            salary: {
                min: 800000,
                max: 1500000,
                currency: 'INR',
                period: 'yearly',
            },
            experience: {
                min: 2,
                max: 4,
                level: 'mid',
            },
            workMode: 'onsite',
            jobType: 'full-time',
            description: 'Looking for a talented Full Stack Developer to build and maintain web applications. You will work on both frontend and backend, collaborating with designers and product managers.',
            requirements: [
                '2+ years of full stack development experience',
                'Proficiency in React and Node.js',
                'Experience with databases (SQL/NoSQL)',
                'Understanding of RESTful APIs',
                'Git version control',
            ],
            responsibilities: [
                'Develop and maintain web applications',
                'Write clean, maintainable code',
                'Participate in code reviews',
                'Debug and fix issues',
                'Collaborate with team members',
            ],
            skills: ['React', 'Node.js', 'JavaScript', 'MongoDB', 'Express', 'Git'],
            preferredSkills: ['TypeScript', 'Redux', 'AWS', 'Docker'],
            benefits: ['Health insurance', 'Flexible hours', 'Learning budget'],
            postedDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            applicants: 120,
            views: 890,
            openings: 3,
            aiVerified: true,
            scamScore: 4,
            featured: false,
            urgent: false,
        },

        {
            id: 'job-4',
            title: 'Frontend Developer (React)',
            company: mockCompanies[2],
            location: {
                address: 'Whitefield, Bengaluru',
                city: 'Bengaluru',
                state: 'Karnataka',
                country: 'India',
                zipCode: '560066',
                latitude: 12.9698,
                longitude: 77.7500,
                remote: false,
            },
            salary: {
                min: 600000,
                max: 1200000,
                currency: 'INR',
                period: 'yearly',
            },
            experience: {
                min: 1,
                max: 3,
                level: 'entry',
            },
            workMode: 'hybrid',
            jobType: 'full-time',
            description: 'Join our frontend team to build beautiful and responsive user interfaces for our fintech products. Great opportunity for developers looking to grow their skills.',
            requirements: [
                '1+ years of React development experience',
                'Strong HTML, CSS, JavaScript skills',
                'Understanding of responsive design',
                'Familiarity with Git',
            ],
            responsibilities: [
                'Build responsive web interfaces',
                'Implement designs from Figma',
                'Optimize application performance',
                'Write unit tests',
                'Collaborate with backend team',
            ],
            skills: ['React', 'JavaScript', 'HTML', 'CSS', 'Git'],
            preferredSkills: ['TypeScript', 'Redux', 'Material-UI', 'Jest'],
            benefits: ['Health insurance', 'Performance bonus', 'Gym membership'],
            postedDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            applicants: 95,
            views: 650,
            openings: 2,
            aiVerified: true,
            scamScore: 6,
            featured: false,
            urgent: false,
        },

        {
            id: 'job-5',
            title: 'DevOps Engineer',
            company: mockCompanies[1],
            location: {
                address: 'HSR Layout, Bengaluru',
                city: 'Bengaluru',
                state: 'Karnataka',
                country: 'India',
                zipCode: '560102',
                latitude: 12.9121,
                longitude: 77.6446,
                remote: false,
            },
            salary: {
                min: 1200000,
                max: 2000000,
                currency: 'INR',
                period: 'yearly',
            },
            experience: {
                min: 3,
                max: 6,
                level: 'mid',
            },
            workMode: 'hybrid',
            jobType: 'full-time',
            description: 'Seeking an experienced DevOps Engineer to manage our cloud infrastructure and CI/CD pipelines. You will ensure high availability and scalability of our systems.',
            requirements: [
                '3+ years of DevOps experience',
                'Strong knowledge of AWS/Azure/GCP',
                'Experience with Docker and Kubernetes',
                'Proficiency in scripting (Python/Bash)',
                'Understanding of CI/CD tools',
            ],
            responsibilities: [
                'Manage cloud infrastructure',
                'Implement and maintain CI/CD pipelines',
                'Monitor system performance',
                'Automate deployment processes',
                'Ensure security best practices',
            ],
            skills: ['AWS', 'Docker', 'Kubernetes', 'Jenkins', 'Terraform', 'Python'],
            preferredSkills: ['Ansible', 'Prometheus', 'Grafana', 'ELK Stack'],
            benefits: ['Stock options', 'Remote work', 'Health insurance', 'Learning budget'],
            postedDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            applicants: 62,
            views: 420,
            openings: 1,
            aiVerified: true,
            scamScore: 4,
            featured: true,
            urgent: false,
        },
    ];
};

export const getJobById = (id: string): Job | undefined => {
    return getMockJobs().find((job) => job.id === id);
};

export const getMockApplications = (): JobApplication[] => {
    const jobs = getMockJobs();

    return [
        {
            id: 'app-1',
            jobId: 'job-1',
            job: jobs[0],
            resumeId: 'resume-1',
            status: 'interview',
            appliedDate: '2024-01-18T10:00:00Z',
            lastUpdated: '2024-01-22T14:30:00Z',
            timeline: [
                {
                    id: 'timeline-1',
                    status: 'submitted',
                    date: '2024-01-18T10:00:00Z',
                    note: 'Application submitted',
                },
                {
                    id: 'timeline-2',
                    status: 'in-review',
                    date: '2024-01-19T15:00:00Z',
                    note: 'Application under review',
                },
                {
                    id: 'timeline-3',
                    status: 'interview',
                    date: '2024-01-22T14:30:00Z',
                    note: 'Interview scheduled',
                },
            ],
            notes: 'Great company culture, excited about the role!',
            followUpDate: '2024-01-25T00:00:00Z',
            interviewDetails: {
                scheduledDate: '2024-01-25T10:00:00Z',
                interviewType: 'video',
                interviewers: ['John Doe - Engineering Manager', 'Jane Smith - Tech Lead'],
                meetingLink: 'meet.google.com/abc-defg-hij',
                notes: 'Prepare for system design questions',
                completed: false,
            },
        },
        {
            id: 'app-2',
            jobId: 'job-2',
            job: jobs[1],
            resumeId: 'resume-2',
            status: 'submitted',
            appliedDate: '2024-01-20T09:00:00Z',
            lastUpdated: '2024-01-20T09:00:00Z',
            timeline: [
                {
                    id: 'timeline-4',
                    status: 'submitted',
                    date: '2024-01-20T09:00:00Z',
                    note: 'Application submitted',
                },
            ],
        },
    ];
};

export const getMockSavedJobs = (): SavedJob[] => {
    const jobs = getMockJobs();

    return [
        {
            id: 'saved-1',
            userId: 'user-1',
            jobId: 'job-3',
            job: jobs[2],
            savedAt: '2024-01-19T12:00:00Z',
            notes: 'Good salary range, close to home',
            tags: ['frontend', 'react', 'bengaluru'],
        },
        {
            id: 'saved-2',
            userId: 'user-1',
            jobId: 'job-5',
            job: jobs[4],
            savedAt: '2024-01-21T16:00:00Z',
            notes: 'Interesting DevOps role',
            tags: ['devops', 'cloud', 'hybrid'],
        },
    ];
};

export const getMockInterviewPrep = (jobId: string): InterviewPrep => {
    const job = getJobById(jobId);

    return {
        jobId: jobId,
        jobTitle: job?.title || 'Software Engineer',
        companyName: job?.company.name || 'TechCorp',

        commonQuestions: [
            {
                id: 'q1',
                question: 'Tell me about yourself',
                category: 'behavioral',
                difficulty: 'easy',
                suggestedAnswer: 'Focus on your professional journey, key achievements, and why you\'re interested in this role.',
                tips: [
                    'Keep it under 2 minutes',
                    'Focus on relevant experience',
                    'End with why you\'re excited about this opportunity',
                ],
            },
            {
                id: 'q2',
                question: 'Why do you want to work here?',
                category: 'company-specific',
                difficulty: 'easy',
                tips: [
                    'Research the company beforehand',
                    'Mention specific products or values',
                    'Connect your goals with company mission',
                ],
            },
        ],

        technicalQuestions: [
            {
                id: 'q3',
                question: 'Explain the difference between var, let, and const in JavaScript',
                category: 'technical',
                difficulty: 'easy',
                suggestedAnswer: 'var is function-scoped, let and const are block-scoped. const cannot be reassigned.',
                tips: [
                    'Provide code examples',
                    'Mention hoisting behavior',
                    'Discuss best practices',
                ],
            },
            {
                id: 'q4',
                question: 'Design a scalable URL shortener service',
                category: 'technical',
                difficulty: 'hard',
                tips: [
                    'Start with requirements gathering',
                    'Discuss database design',
                    'Consider scalability and caching',
                    'Talk about API design',
                ],
            },
        ],

        behavioralQuestions: [
            {
                id: 'q5',
                question: 'Describe a time when you had a conflict with a team member',
                category: 'behavioral',
                difficulty: 'medium',
                tips: [
                    'Use STAR method (Situation, Task, Action, Result)',
                    'Focus on resolution and learning',
                    'Show emotional intelligence',
                ],
            },
        ],

        companyInsights: [
            'Company recently raised Series B funding',
            'Known for strong engineering culture',
            'Focus on work-life balance',
            'Rapid growth in the past year',
        ],

        interviewTips: [
            'Research the company and recent news',
            'Prepare questions to ask the interviewer',
            'Practice coding on a whiteboard or online editor',
            'Review your resume and be ready to discuss any point',
            'Dress professionally even for video interviews',
        ],

        mockInterviewAvailable: true,
    };
};

export default getMockJobs;
