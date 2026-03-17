import { Story, Post, User } from './types';

// Mock users with professional roles
const users: User[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    title: 'Product Manager at Google',
    avatar: 'briefcase',
    verified: true,
  },
  {
    id: '2',
    name: 'Michael Chen',
    title: 'Senior Software Engineer at Meta',
    avatar: 'code-slash',
    verified: true,
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    title: 'UX Designer at Adobe',
    avatar: 'color-palette',
  },
  {
    id: '4',
    name: 'David Kim',
    title: 'Marketing Director at Amazon',
    avatar: 'megaphone',
  },
  {
    id: '5',
    name: 'Jessica Taylor',
    title: 'Data Scientist at Microsoft',
    avatar: 'analytics',
  },
  {
    id: '6',
    name: 'Alex Martinez',
    title: 'CEO at TechStart Inc',
    avatar: 'rocket',
    verified: true,
  },
  {
    id: '7',
    name: 'Rachel Green',
    title: 'HR Manager at LinkedIn',
    avatar: 'people',
  },
  {
    id: '8',
    name: 'Tom Anderson',
    title: 'Tech Influencer & Speaker',
    avatar: 'mic',
    verified: true,
  },
];

// Mock stories
export const mockStories: Story[] = [
  { id: 's1', user: users[0], timestamp: '2h', imageUri: require('../../assets/images/img1.jpg') },
  { id: 's2', user: users[1], timestamp: '5h', content: 'Amazing team meeting today 💼', backgroundColor: '#f093fb' },
  { id: 's3', user: users[2], timestamp: '8h', content: 'New design system released! 🎨', backgroundColor: '#fa709a' },
  { id: 's4', user: users[3], timestamp: '12h', content: 'Marketing campaign success! 📈', backgroundColor: '#4facfe' },
  { id: 's5', user: users[4], timestamp: '1d', content: 'Data insights are incredible 📊', backgroundColor: '#43e97b' },
  { id: 's6', user: users[5], timestamp: '1d', content: 'Exciting company updates! 🎉', backgroundColor: '#764ba2' },
];

// Mock posts with LinkedIn-style professional content including video reels
export const mockPosts: Post[] = [
  {
    id: '1',
    user: users[0],
    timestamp: '2h',
    content:
      'Excited to share that our team just launched a new feature that will help millions of users! 🚀 The journey from ideation to launch taught me so much about cross-functional collaboration. Grateful to work with such talented people. #ProductManagement #Innovation #TeamWork',
    image: 'rocket-outline',
    likes: 1247,
    comments: 89,
    shares: 34,
  },
  {
    id: 'reel1',
    user: users[7],
    timestamp: '3h',
    content:
      'Adorable cat doing funny things! 🐱 This little furball always knows how to brighten my day. #CatsOfLinkedIn #WorkLifeBalance #PetLove',
    isReel: true,
    videoIcon: 'paw-outline',
    videoUri: require('../../assets/videos/cat.mp4'),
    views: 45200,
    likes: 3421,
    comments: 234,
    shares: 567,
  },
  {
    id: '2',
    user: users[1],
    timestamp: '4h',
    content:
      'Just published a new article on optimizing React performance! After years of working with React, I wanted to share some advanced techniques that have helped our team reduce load times by 40%. Link in comments! #React #WebDevelopment #Performance',
    likes: 892,
    comments: 67,
    shares: 156,
  },
  {
    id: '3',
    user: users[2],
    timestamp: '8h',
    content:
      'Completed a major redesign project today! 🎨 Working closely with users to understand their pain points made all the difference. Remember: great design is invisible, but its impact is undeniable. #UXDesign #UserResearch #DesignThinking',
    image: 'color-palette-outline',
    likes: 2134,
    comments: 145,
    shares: 78,
  },
  {
    id: 'reel2',
    user: users[3],
    timestamp: '10h',
    content:
      'Meet my office buddy! 🐶 Dogs make the best coworkers. This is why remote work is amazing! #DogsOfLinkedIn #RemoteWork #OfficeLife',
    isReel: true,
    videoIcon: 'paw-outline',
    videoUri: require('../../assets/videos/dog.mp4'),
    views: 67800,
    likes: 4567,
    comments: 312,
    shares: 789,
  },
  {
    id: '4',
    user: users[3],
    timestamp: '12h',
    content:
      'Our latest marketing campaign just hit 10M impressions! 📊 The key was understanding our audience and creating authentic content that resonates. Data-driven creativity is the future of marketing. #DigitalMarketing #GrowthHacking #ContentStrategy',
    likes: 1567,
    comments: 92,
    shares: 234,
  },
  {
    id: '5',
    user: users[4],
    timestamp: '1d',
    content:
      'Fascinating insights from our latest ML model! We achieved 95% accuracy in predicting customer behavior. The intersection of data science and business strategy continues to amaze me. #DataScience #MachineLearning #AI',
    image: 'analytics-outline',
    likes: 3421,
    comments: 178,
    shares: 456,
  },
  {
    id: '6',
    user: users[5],
    timestamp: '1d',
    content:
      'Thrilled to announce that we just closed our Series A funding! 🎉 This wouldn\'t be possible without our incredible team and supportive investors. Here\'s to the next chapter of growth! #Startup #Entrepreneurship #VentureFunding',
    likes: 5678,
    comments: 342,
    shares: 567,
  },
  {
    id: '7',
    user: users[6],
    timestamp: '2d',
    content:
      'Hiring tip: Skills can be taught, but attitude and cultural fit are priceless. We just onboarded 20 amazing new team members who embody our values. Excited to see them grow! #HR #Hiring #CompanyCulture #TalentAcquisition',
    likes: 987,
    comments: 54,
    shares: 123,
  },
];
