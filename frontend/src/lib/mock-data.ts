// ============================================
// ARIZONALEX – Mock Data
// ============================================

export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  banner?: string;
  bio: string;
  role: 'politician' | 'journalist' | 'citizen' | 'official' | 'admin';
  verified: boolean;
  party?: string;
  followers: number;
  following: number;
  joined: string;
}

export interface Post {
  id: string;
  author: User;
  content: string;
  type: 'text' | 'image' | 'video' | 'thread' | 'policy';
  images?: string[];
  video?: string;
  likes: number;
  comments: number;
  reposts: number;
  bookmarked?: boolean;
  liked?: boolean;
  timestamp: string;
  hashtags?: string[];
}

export interface Message {
  id: string;
  sender: User;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participant: User;
  lastMessage: string;
  timestamp: string;
  unread: number;
}

export interface Poll {
  id: string;
  question: string;
  options: { label: string; votes: number }[];
  totalVotes: number;
  endDate: string;
  author: User;
}

export interface PromiseItem {
  id: string;
  title: string;
  description: string;
  status: 'kept' | 'broken' | 'in-progress' | 'pending';
  politician: User;
  date: string;
  category: string;
}

export interface PoliticalEvent {
  id: string;
  title: string;
  type: 'rally' | 'speech' | 'meeting' | 'townhall' | 'debate';
  date: string;
  location: string;
  organizer: User;
  attendees: number;
  description: string;
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'repost' | 'system' | 'verification';
  actor?: User;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Story {
  id: string;
  author: User;
  image: string;
  timestamp: string;
  viewed: boolean;
}

// ---- MOCK USERS ----
// ---- MOCK USERS ----
export const users: User[] = [
  {
    id: '1', name: 'Sarah Mitchell', username: 'sarahmitchell', avatar: '/avatars/sarah-mitchell.png',
    bio: 'Senator, District 12. Fighting for transparent governance and equal opportunity.',
    role: 'politician', verified: true, party: 'Progressive Alliance',
    followers: 284000, following: 1200, joined: 'January 2021',
    banner: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
  },
  {
    id: '2', name: 'James Rivera', username: 'jamesrivera', avatar: '/avatars/james-rivera.png',
    bio: 'Political journalist @NationalPost. Covering Capitol Hill since 2015.',
    role: 'journalist', verified: true,
    followers: 156000, following: 890, joined: 'March 2020'
  },
  {
    id: '3', name: 'Diana Chen', username: 'dianachen', avatar: '/avatars/diana-chen.png',
    bio: 'Governor of State. Building bridges, not walls. #TransparentGovernance',
    role: 'politician', verified: true, party: 'Unity Party',
    followers: 520000, following: 340, joined: 'June 2019'
  },
  {
    id: '4', name: 'Marcus Thompson', username: 'marcusthompson', avatar: '/avatars/marcus-thompson.png',
    bio: 'City Council Member. Your voice in local government.',
    role: 'official', verified: true, party: 'Citizens First',
    followers: 45000, following: 2100, joined: 'September 2022'
  },
  {
    id: '5', name: 'Alex Jordan', username: 'alexjordan', avatar: '/avatars/alex-jordan.png',
    bio: 'Engaged citizen. Democracy is not a spectator sport.',
    role: 'citizen', verified: false,
    followers: 1200, following: 450, joined: 'December 2023'
  },
  {
    id: '6', name: 'Priya Patel', username: 'priyapatel', avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=200&h=200&auto=format&fit=crop',
    bio: 'Policy researcher & analyst. Data-driven governance advocate.',
    role: 'journalist', verified: true,
    followers: 89000, following: 670, joined: 'February 2021'
  },
  {
    id: '7', name: 'Robert Kim', username: 'robertkim', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&h=200&auto=format&fit=crop',
    bio: 'Secretary of Infrastructure. Rebuilding America\'s future.',
    role: 'politician', verified: true, party: 'National Progress',
    followers: 310000, following: 200, joined: 'April 2020'
  },
  {
    id: '8', name: 'Elena Vasquez', username: 'elenavasquez', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&h=200&auto=format&fit=crop',
    bio: 'Education policy champion. Every child deserves a future.',
    role: 'politician', verified: true, party: 'Progressive Alliance',
    followers: 178000, following: 560, joined: 'July 2021'
  },
];

// ---- MOCK POSTS ----
export const posts: Post[] = [
  {
    id: '1', author: users[0],
    content: '🏛️ Today we passed the Digital Privacy Act with bipartisan support. This landmark legislation will protect citizens\' data from corporate overreach while maintaining innovation. A win for democracy!\n\n#DigitalPrivacy #Governance #Transparency',
    type: 'text', likes: 12400, comments: 3200, reposts: 5600, timestamp: '2h ago',
    hashtags: ['DigitalPrivacy', 'Governance', 'Transparency']
  },
  {
    id: '2', author: users[1],
    content: 'BREAKING: Leaked documents reveal massive infrastructure spending discrepancies between reported and actual allocations. Full investigation report dropping tomorrow.\n\nStay tuned. 🔍',
    type: 'text', likes: 8900, comments: 2100, reposts: 4300, timestamp: '4h ago',
    hashtags: ['Breaking', 'Investigation']
  },
  {
    id: '3', author: users[2],
    content: 'Proud to announce our state\'s new Green Energy Initiative. By 2030, we aim for 80% renewable energy. Here\'s our roadmap:\n\n✅ Phase 1: Solar farm expansion (2025)\n✅ Phase 2: Wind energy corridors (2026)\n✅ Phase 3: EV infrastructure (2027)\n🔄 Phase 4: Grid modernization (2028-2030)\n\n#CleanEnergy #GreenFuture',
    type: 'policy', likes: 34500, comments: 8700, reposts: 12000, timestamp: '6h ago',
    hashtags: ['CleanEnergy', 'GreenFuture']
  },
  {
    id: '4', author: users[3],
    content: 'Town Hall tonight at 7 PM! We\'re discussing the new community development plan. Your input matters. See you there! 🏘️\n\nLocation: City Hall, Room 204\nLive stream: arizonalex.com/live/townhall',
    type: 'text', likes: 2300, comments: 890, reposts: 1200, timestamp: '8h ago',
    hashtags: ['TownHall', 'CommunityFirst']
  },
  {
    id: '5', author: users[5],
    content: '📊 New Research: Our analysis of 10,000+ policy proposals reveals that data-driven legislation has a 73% higher success rate in achieving stated objectives.\n\nKey findings in this thread 🧵👇',
    type: 'thread', likes: 15600, comments: 4500, reposts: 7800, timestamp: '12h ago',
    hashtags: ['PolicyResearch', 'DataDriven']
  },
  {
    id: '6', author: users[6],
    content: '🚄 The National High-Speed Rail project just broke ground in 3 new states! This will connect 15 major cities by 2029, creating 200,000+ jobs.\n\nInfrastructure is not just concrete and steel — it\'s opportunity.',
    type: 'text', likes: 28700, comments: 6200, reposts: 9400, timestamp: '1d ago',
    hashtags: ['Infrastructure', 'HSR', 'Jobs']
  },
  {
    id: '7', author: users[7],
    content: '📚 Excited to share: Our Universal Pre-K bill passed committee today! Every 4-year-old in our state will have access to quality early education by 2026.\n\nThis is what investing in our future looks like.',
    type: 'text', likes: 19200, comments: 3800, reposts: 6100, timestamp: '1d ago',
    hashtags: ['Education', 'PreK', 'FutureFirst']
  },
  {
    id: '8', author: users[4],
    content: 'Attended my first town hall meeting today. Impressed by how engaged local officials were with community concerns. This is what democracy should look like! 🗳️',
    type: 'text', likes: 890, comments: 234, reposts: 156, timestamp: '2d ago',
    hashtags: ['Democracy', 'CivicEngagement']
  },
];

// ---- TRENDING HASHTAGS ----
export const trendingHashtags = [
  { tag: 'DigitalPrivacyAct', posts: 124000, category: 'Legislation' },
  { tag: 'Election2026', posts: 890000, category: 'Politics' },
  { tag: 'ClimateAction', posts: 456000, category: 'Policy' },
  { tag: 'InfrastructureBill', posts: 234000, category: 'Government' },
  { tag: 'TransparentGov', posts: 178000, category: 'Governance' },
  { tag: 'EducationReform', posts: 345000, category: 'Policy' },
  { tag: 'HealthcareForAll', posts: 567000, category: 'Healthcare' },
  { tag: 'GreenEnergy', posts: 289000, category: 'Environment' },
  { tag: 'VoterRights', posts: 423000, category: 'Democracy' },
  { tag: 'EconomicReform', posts: 198000, category: 'Economy' },
];

// ---- MOCK CONVERSATIONS ----
export const conversations: Conversation[] = [
  { id: '1', participant: users[0], lastMessage: 'Thanks for the support on the bill!', timestamp: '2m ago', unread: 2 },
  { id: '2', participant: users[1], lastMessage: 'Can we schedule an interview?', timestamp: '15m ago', unread: 1 },
  { id: '3', participant: users[2], lastMessage: 'The green energy report is ready.', timestamp: '1h ago', unread: 0 },
  { id: '4', participant: users[3], lastMessage: 'Town hall details confirmed.', timestamp: '3h ago', unread: 0 },
  { id: '5', participant: users[5], lastMessage: 'New data analysis complete!', timestamp: '5h ago', unread: 3 },
  { id: '6', participant: users[6], lastMessage: 'Rail project update meeting at noon.', timestamp: '1d ago', unread: 0 },
];

// ---- MOCK MESSAGES ----
export const chatMessages: Message[] = [
  { id: '1', sender: users[0], content: 'Hi! I wanted to discuss the upcoming infrastructure vote.', timestamp: '10:30 AM', read: true },
  { id: '2', sender: users[4], content: 'Of course, Senator. I have some concerns about the environmental impact assessment.', timestamp: '10:32 AM', read: true },
  { id: '3', sender: users[0], content: 'Valid point. We\'ve added new amendments addressing exactly that. I\'ll share the updated draft.', timestamp: '10:35 AM', read: true },
  { id: '4', sender: users[4], content: 'That would be great. When is the final vote scheduled?', timestamp: '10:36 AM', read: true },
  { id: '5', sender: users[0], content: 'Next Thursday. I\'d appreciate your public support if the amendments address your concerns.', timestamp: '10:38 AM', read: true },
  { id: '6', sender: users[4], content: 'I\'ll review them thoroughly and let you know. Thanks for being transparent about this!', timestamp: '10:40 AM', read: false },
];

// ---- MOCK POLLS ----
export const polls: Poll[] = [
  {
    id: '1', question: 'Should the government increase funding for renewable energy projects?',
    options: [
      { label: 'Strongly Agree', votes: 45200 },
      { label: 'Agree', votes: 23100 },
      { label: 'Neutral', votes: 8900 },
      { label: 'Disagree', votes: 12300 },
      { label: 'Strongly Disagree', votes: 5600 },
    ],
    totalVotes: 95100, endDate: 'Mar 15, 2026', author: users[2]
  },
  {
    id: '2', question: 'What should be the top priority for the next legislative session?',
    options: [
      { label: 'Healthcare Reform', votes: 34500 },
      { label: 'Education Funding', votes: 28900 },
      { label: 'Infrastructure', votes: 21300 },
      { label: 'Climate Policy', votes: 18700 },
      { label: 'Economic Growth', votes: 15600 },
    ],
    totalVotes: 119000, endDate: 'Mar 20, 2026', author: users[0]
  },
];

// ---- MOCK PROMISES ----
export const promises: PromiseItem[] = [
  { id: '1', title: 'Universal Pre-K Access', description: 'Implement free pre-K for all 4-year-olds by 2026.', status: 'in-progress', politician: users[7], date: 'Jan 2025', category: 'Education' },
  { id: '2', title: 'Reduce Carbon Emissions by 50%', description: 'Achieve 50% reduction in state carbon emissions by 2028.', status: 'in-progress', politician: users[2], date: 'Mar 2024', category: 'Environment' },
  { id: '3', title: 'High-Speed Rail Expansion', description: 'Connect 15 major cities with high-speed rail by 2029.', status: 'in-progress', politician: users[6], date: 'Jun 2024', category: 'Infrastructure' },
  { id: '4', title: 'Digital Privacy Act', description: 'Pass comprehensive digital privacy legislation.', status: 'kept', politician: users[0], date: 'Feb 2025', category: 'Privacy' },
  { id: '5', title: 'Balanced Budget', description: 'Achieve balanced state budget within first term.', status: 'broken', politician: users[3], date: 'Jan 2023', category: 'Economy' },
  { id: '6', title: 'Police Reform', description: 'Implement community policing standards statewide.', status: 'pending', politician: users[2], date: 'Sep 2024', category: 'Justice' },
];

// ---- MOCK EVENTS ----
export const events: PoliticalEvent[] = [
  { id: '1', title: 'State of the State Address', type: 'speech', date: 'Mar 5, 2026', location: 'Capitol Building', organizer: users[2], attendees: 15000, description: 'Annual address covering policy priorities and achievements.' },
  { id: '2', title: 'Community Town Hall: Education', type: 'townhall', date: 'Mar 8, 2026', location: 'City Hall, Room 204', organizer: users[3], attendees: 450, description: 'Open discussion on local education initiatives.' },
  { id: '3', title: 'Climate Policy Debate', type: 'debate', date: 'Mar 12, 2026', location: 'Virtual Event', organizer: users[5], attendees: 8000, description: 'Bipartisan debate on climate change legislation.' },
  { id: '4', title: 'Infrastructure Rally', type: 'rally', date: 'Mar 15, 2026', location: 'Downtown Convention Center', organizer: users[6], attendees: 25000, description: 'Rally for the National Infrastructure Investment Act.' },
];

// ---- MOCK NOTIFICATIONS ----
export const notifications: Notification[] = [
  { id: '1', type: 'like', actor: users[0], content: 'liked your post about civic engagement', timestamp: '2m ago', read: false },
  { id: '2', type: 'follow', actor: users[1], content: 'started following you', timestamp: '15m ago', read: false },
  { id: '3', type: 'comment', actor: users[2], content: 'commented on your policy thread', timestamp: '1h ago', read: false },
  { id: '4', type: 'repost', actor: users[5], content: 'reposted your research analysis', timestamp: '2h ago', read: true },
  { id: '5', type: 'mention', actor: users[3], content: 'mentioned you in a town hall discussion', timestamp: '4h ago', read: true },
  { id: '6', type: 'verification', content: 'Your verification request is being reviewed', timestamp: '1d ago', read: true },
  { id: '7', type: 'system', content: 'New AI tools are now available in your dashboard', timestamp: '2d ago', read: true },
  { id: '8', type: 'like', actor: users[6], content: 'liked your comment on infrastructure bill', timestamp: '2d ago', read: true },
];

// ---- MOCK STORIES ----
export const stories: Story[] = [
  { id: '1', author: users[0], image: '🏛️', timestamp: '1h ago', viewed: false },
  { id: '2', author: users[2], image: '🌿', timestamp: '3h ago', viewed: false },
  { id: '3', author: users[6], image: '🚄', timestamp: '5h ago', viewed: true },
  { id: '4', author: users[7], image: '📚', timestamp: '8h ago', viewed: true },
  { id: '5', author: users[1], image: '🔍', timestamp: '10h ago', viewed: false },
  { id: '6', author: users[5], image: '📊', timestamp: '12h ago', viewed: true },
  { id: '7', author: users[3], image: '🏘️', timestamp: '15h ago', viewed: true },
];

// ---- ADMIN STATS ----
export const platformStats = {
  totalUsers: 2_450_000,
  activeToday: 892_000,
  postsToday: 1_230_000,
  reportsToday: 342,
  aiModerationsToday: 15_600,
  newVerificationRequests: 89,
  serverUptime: 99.97,
  avgResponseTime: 42, // ms
};

// ---- HELPER: Format numbers ----
export function formatNumber(num: number): string {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
  return num.toString();
}

// ---- HELPER: Lookup by username ----
export function getUserByUsername(username: string): User | undefined {
  return users.find(u => u.username === username);
}

export function getPostsByUser(username: string): Post[] {
  return posts.filter(p => p.author.username === username);
}

export function checkUserHasStory(userId: string): boolean {
  return stories.some(s => s.author.id === userId);
}

