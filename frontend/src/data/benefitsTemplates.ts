/**
 * Benefits Templates
 * Common benefits and perks for job postings
 */

export interface BenefitCategory {
    category: string;
    icon: string;
    benefits: string[];
}

export const BENEFITS_TEMPLATES: BenefitCategory[] = [
    {
        category: 'Work Flexibility',
        icon: 'time-outline',
        benefits: [
            'Work from Home',
            'Flexible Hours',
            'Hybrid Work Model',
            'Compressed Work Week',
            '4-Day Work Week',
            'Remote Work Options',
        ],
    },
    {
        category: 'Health & Wellness',
        icon: 'fitness-outline',
        benefits: [
            'Health Insurance',
            'Dental Insurance',
            'Vision Insurance',
            'Life Insurance',
            'Mental Health Support',
            'Gym Membership',
            'Wellness Programs',
            'Annual Health Checkup',
        ],
    },
    {
        category: 'Financial Benefits',
        icon: 'cash-outline',
        benefits: [
            'Performance Bonuses',
            'Annual Bonus',
            'Stock Options',
            'Equity/ESOP',
            'Retirement Plan (401k/PF)',
            'Profit Sharing',
            'Relocation Assistance',
            'Housing Allowance',
        ],
    },
    {
        category: 'Time Off',
        icon: 'calendar-outline',
        benefits: [
            'Paid Time Off (PTO)',
            'Sick Leave',
            'Maternity Leave',
            'Paternity Leave',
            'Parental Leave',
            'Sabbatical Leave',
            'Paid Holidays',
            'Birthday Leave',
        ],
    },
    {
        category: 'Learning & Development',
        icon: 'book-outline',
        benefits: [
            'Learning & Development Budget',
            'Professional Certification Support',
            'Conference Attendance',
            'Online Course Subscriptions',
            'Mentorship Programs',
            'Career Development Plans',
            'Skill Training',
            'Tuition Reimbursement',
        ],
    },
    {
        category: 'Work Environment',
        icon: 'business-outline',
        benefits: [
            'Modern Office Space',
            'Ergonomic Workspace',
            'Free Snacks & Beverages',
            'Catered Meals',
            'Game Room',
            'Nap Rooms',
            'Pet-Friendly Office',
            'Standing Desks',
        ],
    },
    {
        category: 'Transportation',
        icon: 'car-outline',
        benefits: [
            'Transportation Allowance',
            'Company Vehicle',
            'Parking',
            'Commuter Benefits',
            'Fuel Reimbursement',
            'Public Transit Pass',
        ],
    },
    {
        category: 'Technology',
        icon: 'laptop-outline',
        benefits: [
            'Laptop/Computer',
            'Mobile Phone',
            'Internet Reimbursement',
            'Software Licenses',
            'Home Office Setup',
            'Latest Tech Equipment',
        ],
    },
    {
        category: 'Family & Lifestyle',
        icon: 'heart-outline',
        benefits: [
            'Childcare Support',
            'Family Health Insurance',
            'Education Assistance for Children',
            'Employee Assistance Program',
            'Pet Insurance',
            'Adoption Assistance',
        ],
    },
    {
        category: 'Other Perks',
        icon: 'gift-outline',
        benefits: [
            'Team Outings',
            'Company Events',
            'Employee Discounts',
            'Referral Bonuses',
            'Recognition Programs',
            'Volunteer Time Off',
            'Diversity & Inclusion Programs',
            'Equal Opportunity Employer',
        ],
    },
];

// Flatten all benefits for easy access
export const ALL_BENEFITS = BENEFITS_TEMPLATES.flatMap(category => category.benefits);

// Get benefits by category
export const getBenefitsByCategory = (categoryName: string): string[] => {
    const category = BENEFITS_TEMPLATES.find(c => c.category === categoryName);
    return category ? category.benefits : [];
};

// Get popular benefits (most commonly offered)
export const POPULAR_BENEFITS = [
    'Health Insurance',
    'Work from Home',
    'Flexible Hours',
    'Paid Time Off (PTO)',
    'Performance Bonuses',
    'Learning & Development Budget',
    'Life Insurance',
    'Annual Bonus',
    'Professional Certification Support',
    'Retirement Plan (401k/PF)',
];
