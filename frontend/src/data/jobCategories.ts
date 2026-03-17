/**
 * Job Categories and Domain Data
 * Predefined categories for job postings
 */

import { JobCategory } from '../types/job.types';

export const JOB_CATEGORIES: { value: JobCategory; label: string; icon: string }[] = [
    { value: 'IT & Software', label: 'IT & Software', icon: 'laptop-outline' },
    { value: 'Finance & Accounting', label: 'Finance & Accounting', icon: 'calculator-outline' },
    { value: 'Marketing & Sales', label: 'Marketing & Sales', icon: 'megaphone-outline' },
    { value: 'Healthcare & Medical', label: 'Healthcare & Medical', icon: 'medical-outline' },
    { value: 'Education & Training', label: 'Education & Training', icon: 'school-outline' },
    { value: 'Engineering & Manufacturing', label: 'Engineering & Manufacturing', icon: 'construct-outline' },
    { value: 'Design & Creative', label: 'Design & Creative', icon: 'color-palette-outline' },
    { value: 'Customer Service', label: 'Customer Service', icon: 'headset-outline' },
    { value: 'Human Resources', label: 'Human Resources', icon: 'people-outline' },
    { value: 'Legal & Compliance', label: 'Legal & Compliance', icon: 'document-text-outline' },
    { value: 'Operations & Logistics', label: 'Operations & Logistics', icon: 'cube-outline' },
    { value: 'Real Estate', label: 'Real Estate', icon: 'home-outline' },
    { value: 'Hospitality & Tourism', label: 'Hospitality & Tourism', icon: 'restaurant-outline' },
    { value: 'Media & Communications', label: 'Media & Communications', icon: 'radio-outline' },
    { value: 'Retail & E-commerce', label: 'Retail & E-commerce', icon: 'cart-outline' },
    { value: 'Other', label: 'Other', icon: 'ellipsis-horizontal-outline' },
];

export const EDUCATION_QUALIFICATIONS = [
    'High School Diploma',
    'Associate Degree',
    'Bachelor\'s Degree',
    'Master\'s Degree',
    'MBA',
    'PhD',
    'Professional Certification',
    'Diploma',
    'Any Graduate',
    'Not Required',
];

export const LANGUAGES = [
    'English',
    'Hindi',
    'Spanish',
    'French',
    'German',
    'Chinese (Mandarin)',
    'Japanese',
    'Korean',
    'Arabic',
    'Portuguese',
    'Russian',
    'Italian',
];

export const CURRENCIES = [
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
];

// Skill suggestions by job category
export const SKILL_SUGGESTIONS: Record<JobCategory, string[]> = {
    'IT & Software': [
        'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'AWS',
        'Docker', 'Kubernetes', 'Git', 'TypeScript', 'MongoDB', 'REST API',
        'Microservices', 'Agile', 'CI/CD', 'Linux', 'Problem Solving'
    ],
    'Finance & Accounting': [
        'Financial Analysis', 'Accounting', 'Excel', 'QuickBooks', 'SAP',
        'Budgeting', 'Tax Preparation', 'Auditing', 'Financial Reporting',
        'GAAP', 'Forecasting', 'Risk Management', 'Compliance'
    ],
    'Marketing & Sales': [
        'Digital Marketing', 'SEO', 'Social Media Marketing', 'Content Marketing',
        'Google Analytics', 'Email Marketing', 'CRM', 'Sales Strategy',
        'Lead Generation', 'Negotiation', 'Communication', 'Presentation'
    ],
    'Healthcare & Medical': [
        'Patient Care', 'Medical Terminology', 'EMR/EHR', 'HIPAA Compliance',
        'Clinical Skills', 'Diagnosis', 'Treatment Planning', 'Emergency Care',
        'Medical Documentation', 'Compassion', 'Attention to Detail'
    ],
    'Education & Training': [
        'Curriculum Development', 'Lesson Planning', 'Classroom Management',
        'Educational Technology', 'Assessment', 'Student Engagement',
        'Communication', 'Patience', 'Adaptability', 'Subject Matter Expertise'
    ],
    'Engineering & Manufacturing': [
        'CAD', 'AutoCAD', 'SolidWorks', 'Project Management', 'Quality Control',
        'Lean Manufacturing', 'Six Sigma', 'Process Improvement', 'Technical Drawing',
        'Problem Solving', 'Safety Compliance', 'Equipment Maintenance'
    ],
    'Design & Creative': [
        'Adobe Creative Suite', 'Photoshop', 'Illustrator', 'Figma', 'UI/UX Design',
        'Graphic Design', 'Typography', 'Color Theory', 'Branding', 'Creativity',
        'Attention to Detail', 'Communication', 'Time Management'
    ],
    'Customer Service': [
        'Communication', 'Problem Solving', 'Empathy', 'Active Listening',
        'CRM Software', 'Conflict Resolution', 'Patience', 'Product Knowledge',
        'Time Management', 'Multitasking', 'Positive Attitude'
    ],
    'Human Resources': [
        'Recruitment', 'Onboarding', 'Employee Relations', 'HRIS', 'Payroll',
        'Performance Management', 'Training & Development', 'Labor Law',
        'Conflict Resolution', 'Communication', 'Confidentiality'
    ],
    'Legal & Compliance': [
        'Legal Research', 'Contract Review', 'Compliance', 'Regulatory Knowledge',
        'Risk Assessment', 'Documentation', 'Attention to Detail', 'Analytical Skills',
        'Communication', 'Negotiation', 'Ethics'
    ],
    'Operations & Logistics': [
        'Supply Chain Management', 'Inventory Management', 'Logistics Coordination',
        'Process Optimization', 'Data Analysis', 'ERP Systems', 'Vendor Management',
        'Problem Solving', 'Communication', 'Time Management'
    ],
    'Real Estate': [
        'Property Management', 'Real Estate Law', 'Negotiation', 'Market Analysis',
        'Customer Service', 'Sales', 'Contract Management', 'Communication',
        'Networking', 'Time Management', 'CRM Software'
    ],
    'Hospitality & Tourism': [
        'Customer Service', 'Communication', 'Event Planning', 'Food Safety',
        'Hospitality Management', 'Reservation Systems', 'Problem Solving',
        'Multitasking', 'Cultural Awareness', 'Teamwork'
    ],
    'Media & Communications': [
        'Content Creation', 'Copywriting', 'Social Media', 'Video Production',
        'Journalism', 'Public Relations', 'Communication', 'Creativity',
        'Research', 'Storytelling', 'Adobe Premiere', 'Photography'
    ],
    'Retail & E-commerce': [
        'Sales', 'Customer Service', 'Inventory Management', 'POS Systems',
        'E-commerce Platforms', 'Merchandising', 'Product Knowledge',
        'Communication', 'Problem Solving', 'Shopify', 'WooCommerce'
    ],
    'Other': [
        'Communication', 'Problem Solving', 'Teamwork', 'Time Management',
        'Adaptability', 'Critical Thinking', 'Leadership', 'Creativity'
    ],
};
