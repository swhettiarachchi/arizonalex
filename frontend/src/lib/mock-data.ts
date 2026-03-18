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
  role: 'politician' | 'journalist' | 'citizen' | 'official' | 'admin' | 'businessman' | 'entrepreneur' | 'crypto_trader' | 'stock_trader' | 'banker' | 'doctor' | 'researcher' | 'academic' | 'lawyer' | 'judge' | 'activist' | 'celebrity' | 'other';
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
    content: '[LEGISLATION] Today we passed the Digital Privacy Act with bipartisan support. This landmark legislation will protect citizens\' data from corporate overreach while maintaining innovation. A win for democracy!\n\n#DigitalPrivacy #Governance #Transparency',
    type: 'text', likes: 12400, comments: 3200, reposts: 5600, timestamp: '2h ago',
    hashtags: ['DigitalPrivacy', 'Governance', 'Transparency']
  },
  {
    id: '2', author: users[1],
    content: 'BREAKING: Leaked documents reveal massive infrastructure spending discrepancies between reported and actual allocations. Full investigation report dropping tomorrow.\n\nStay tuned — full analysis coming soon.',
    type: 'text', likes: 8900, comments: 2100, reposts: 4300, timestamp: '4h ago',
    hashtags: ['Breaking', 'Investigation']
  },
  {
    id: '3', author: users[2],
    content: 'Proud to announce our state\'s new Green Energy Initiative. By 2030, we aim for 80% renewable energy. Here\'s our roadmap:\n\n[DONE] Phase 1: Solar farm expansion (2025)\n[DONE] Phase 2: Wind energy corridors (2026)\n[DONE] Phase 3: EV infrastructure (2027)\n[IN PROGRESS] Phase 4: Grid modernization (2028-2030)\n\n#CleanEnergy #GreenFuture',
    type: 'policy', likes: 34500, comments: 8700, reposts: 12000, timestamp: '6h ago',
    hashtags: ['CleanEnergy', 'GreenFuture']
  },
  {
    id: '4', author: users[3],
    content: 'Town Hall tonight at 7 PM! We\'re discussing the new community development plan. Your input matters. See you there!\n\nLocation: City Hall, Room 204\nLive stream: arizonalex.com/live/townhall',
    type: 'text', likes: 2300, comments: 890, reposts: 1200, timestamp: '8h ago',
    hashtags: ['TownHall', 'CommunityFirst']
  },
  {
    id: '5', author: users[5],
    content: '[RESEARCH] New Analysis: Our study of 10,000+ policy proposals reveals that data-driven legislation has a 73% higher success rate in achieving stated objectives.\n\nKey findings thread below — read on for the full breakdown.',
    type: 'thread', likes: 15600, comments: 4500, reposts: 7800, timestamp: '12h ago',
    hashtags: ['PolicyResearch', 'DataDriven']
  },
  {
    id: '6', author: users[6],
    content: '[INFRASTRUCTURE] The National High-Speed Rail project just broke ground in 3 new states. This will connect 15 major cities by 2029, creating 200,000+ jobs.\n\nInfrastructure is not just concrete and steel — it is opportunity.',
    type: 'text', likes: 28700, comments: 6200, reposts: 9400, timestamp: '1d ago',
    hashtags: ['Infrastructure', 'HSR', 'Jobs']
  },
  {
    id: '7', author: users[7],
    content: '[EDUCATION] Excited to share: Our Universal Pre-K bill passed committee today. Every 4-year-old in our state will have access to quality early education by 2026.\n\nThis is what investing in our future looks like.',
    type: 'text', likes: 19200, comments: 3800, reposts: 6100, timestamp: '1d ago',
    hashtags: ['Education', 'PreK', 'FutureFirst']
  },
  {
    id: '8', author: users[4],
    content: 'Attended my first town hall meeting today. Impressed by how engaged local officials were with community concerns. This is what democracy should look like.',
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
  { id: '1', author: users[0], image: 'gradient-politics', timestamp: '1h ago', viewed: false },
  { id: '2', author: users[2], image: 'gradient-green', timestamp: '3h ago', viewed: false },
  { id: '3', author: users[6], image: 'gradient-infra', timestamp: '5h ago', viewed: true },
  { id: '4', author: users[7], image: 'gradient-edu', timestamp: '8h ago', viewed: true },
  { id: '5', author: users[1], image: 'gradient-news', timestamp: '10h ago', viewed: false },
  { id: '6', author: users[5], image: 'gradient-data', timestamp: '12h ago', viewed: true },
  { id: '7', author: users[3], image: 'gradient-civic', timestamp: '15h ago', viewed: true },
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
export function formatNumber(num: number | undefined | null): string {
  if (num === undefined || num === null || isNaN(num)) return '0';
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

// ---- BREAKING NEWS ----
export const breakingNews = [
  { id: '1', headline: 'Senate passes landmark Digital Privacy Act 68-32 in historic bipartisan vote', category: 'Legislation', urgency: 'high', time: '12m ago' },
  { id: '2', headline: 'Federal Reserve signals potential rate cut amid slowing inflation data', category: 'Finance', urgency: 'high', time: '28m ago' },
  { id: '3', headline: 'Governor Chen announces $4.2B green energy investment package for 2026', category: 'Policy', urgency: 'medium', time: '45m ago' },
  { id: '4', headline: 'S&P 500 hits all-time high as trade deal optimism boosts markets', category: 'Markets', urgency: 'medium', time: '1h ago' },
  { id: '5', headline: 'New infrastructure bill creates 200,000 jobs across 12 states — analysis', category: 'Economy', urgency: 'medium', time: '2h ago' },
  { id: '6', headline: 'Healthcare reform bill advances to full Senate floor vote next week', category: 'Healthcare', urgency: 'low', time: '3h ago' },
];

// ---- MARKET DATA ----
export const marketData = [
  { id: '1', symbol: 'S&P 500', price: '5,842.31', change: '+1.24%', positive: true, url: 'https://www.tradingview.com/chart/?symbol=SP%3ASPX' },
  { id: '2', symbol: 'NASDAQ', price: '18,429.10', change: '+0.87%', positive: true, url: 'https://www.tradingview.com/chart/?symbol=NASDAQ%3AIXIC' },
  { id: '3', symbol: 'DOW JONES', price: '43,215.55', change: '-0.31%', positive: false, url: 'https://www.tradingview.com/chart/?symbol=DJ%3ADJI' },
  { id: '4', symbol: 'BTC/USD', price: '$82,450', change: '+3.21%', positive: true, url: 'https://www.tradingview.com/chart/?symbol=BITSTAMP%3ABTCUSD' },
  { id: '5', symbol: 'Gold', price: '$2,187/oz', change: '+0.52%', positive: true, url: 'https://www.tradingview.com/chart/?symbol=COMEX%3AGC1!' },
  { id: '6', symbol: 'Oil (WTI)', price: '$71.42', change: '-1.08%', positive: false, url: 'https://www.tradingview.com/chart/?symbol=NYMEX%3ACL1!' },
];

// ---- ACTIVE BILLS ----
export const activeBills = [
  {
    id: '1', title: 'Healthcare Access & Affordability Act', code: 'H.R. 4821',
    status: 'floor_vote', category: 'Healthcare', impact: 'High Business Impact',
    forVotes: 218, againstVotes: 187, description: 'Expands Medicaid eligibility and caps drug pricing for essential medications.',
    sponsor: users[0], daysActive: 42, date: 'Mar 10, 2026'
  },
  {
    id: '2', title: 'National Broadband Infrastructure Act', code: 'S. 1203',
    status: 'committee', category: 'Technology', impact: 'Tech Sector',
    forVotes: 0, againstVotes: 0, description: 'Allocates $60B to expand high-speed internet to rural and underserved areas.',
    sponsor: users[6], daysActive: 18, date: 'Pending',
  },
  {
    id: '3', title: 'Capital Gains Tax Reform Bill', code: 'H.R. 5510',
    status: 'debate', category: 'Finance', impact: 'Markets Critical',
    forVotes: 201, againstVotes: 210, description: 'Proposes restructured capital gains brackets affecting investors and corporations.',
    sponsor: users[3], daysActive: 67, date: 'Mar 18, 2026'
  },
  {
    id: '4', title: 'Clean Energy Transition Fund', code: 'S. 892',
    status: 'passed', category: 'Environment', impact: 'Energy Sector',
    forVotes: 312, againstVotes: 118, description: 'Establishes $120B transition fund for fossil fuel workers and green energy R&D.',
    sponsor: users[2], daysActive: 94, date: 'Signed'
  },
];

// ---- ECONOMIC INDICATORS ----
export const economicIndicators = [
  { id: '1', label: 'GDP Growth', value: '2.8%', change: '+0.3%', positive: true, period: 'Q4 2025', description: 'Gross Domestic Product (GDP) is the broadest measure of economic activity and the primary indicator of the economy\'s health. It represents the total dollar value of all goods and services produced over a specific time period.', url: 'https://www.tradingview.com/symbols/ECONOMICS-USGDPQQ/' },
  { id: '2', label: 'Inflation (CPI)', value: '3.1%', change: '-0.2%', positive: true, period: 'Feb 2026', description: 'The Consumer Price Index (CPI) measures the average change over time in the prices paid by urban consumers for a market basket of consumer goods and services. It is a key metric for determining inflation.', url: 'https://www.tradingview.com/symbols/ECONOMICS-USCPI/' },
  { id: '3', label: 'Unemployment', value: '4.2%', change: '+0.1%', positive: false, period: 'Feb 2026', description: 'The unemployment rate represents the number of unemployed as a percentage of the labor force. Labor force data are restricted to people 16 years of age and older who are actively seeking employment.', url: 'https://www.tradingview.com/symbols/ECONOMICS-USUR/' },
  { id: '4', label: 'Interest Rate', value: '5.25%', change: '0.00%', positive: true, period: 'Mar 2026', description: 'The federal funds rate is the target interest rate set by the Federal Open Market Committee (FOMC) at which commercial banks borrow and lend their excess reserves to each other overnight.', url: 'https://www.tradingview.com/symbols/ECONOMICS-USINTR/' },
  { id: '5', label: 'Trade Balance', value: '-$68.9B', change: '+$2.1B', positive: true, period: 'Jan 2026', description: 'The balance of trade is the difference between the value of a country\'s exports and the value of a country\'s imports for a given period. A negative value indicates a trade deficit.', url: 'https://www.tradingview.com/symbols/ECONOMICS-USTBAL/' },
  { id: '6', label: 'Consumer Confidence', value: '104.2', change: '+3.8', positive: true, period: 'Feb 2026', description: 'The Consumer Confidence Index is an economic indicator published by The Conference Board to measure the degree of optimism that consumers feel about the overall state of the economy and their personal financial situation.', url: 'https://www.tradingview.com/symbols/ECONOMICS-USCCI/' },
];

// ---- SECTOR TRENDS ----
export const sectorTrends = [
  { sector: 'Finance', tag: 'CapitalGainsTax', posts: 87400, change: '+142%', hot: true },
  { sector: 'Healthcare', tag: 'AffordableCareAct', posts: 64200, change: '+89%', hot: true },
  { sector: 'Energy', tag: 'CleanEnergyFund', posts: 52100, change: '+67%', hot: false },
  { sector: 'Technology', tag: 'BroadbandBill', posts: 41800, change: '+54%', hot: false },
  { sector: 'Policy', tag: 'ElectionReform2026', posts: 98700, change: '+201%', hot: true },
  { sector: 'Economy', tag: 'FedRatecut', posts: 73600, change: '+118%', hot: true },
];


// ---- BUSINESS DATA ----

export interface Company {
  id: string;
  name: string;
  ticker: string;
  sector: string;
  price: string;
  change: string;
  positive: boolean;
  marketCap: string;
  revenue: string;
  employees: string;
  ceo: string;
}

export interface BusinessEvent {
  id: string;
  title: string;
  type: 'conference' | 'ipo' | 'earnings' | 'merger' | 'summit' | 'launch';
  date: string;
  location: string;
  company?: string;
  impact: 'High' | 'Medium' | 'Low';
  description: string;
}

export interface BusinessDeal {
  id: string;
  title: string;
  type: 'merger' | 'acquisition' | 'ipo' | 'partnership' | 'funding' | 'launch';
  value: string;
  parties: string;
  status: 'completed' | 'pending' | 'announced';
  date: string;
  sector: string;
}

export const companies: Company[] = [
  { id: '1', name: 'Apple Inc.', ticker: 'AAPL', sector: 'Technology', price: '$170.50', change: '+1.14%', positive: true, marketCap: '$2.8T', revenue: '$383.2B', employees: '161K', ceo: 'Tim Cook' },
  { id: '2', name: 'Microsoft Corp', ticker: 'MSFT', sector: 'Technology', price: '$410.22', change: '+0.85%', positive: true, marketCap: '$3.0T', revenue: '$227.6B', employees: '221K', ceo: 'Satya Nadella' },
  { id: '3', name: 'Tesla Inc', ticker: 'TSLA', sector: 'Automotive', price: '$182.80', change: '-2.23%', positive: false, marketCap: '$580.6B', revenue: '$96.7B', employees: '140K', ceo: 'Elon Musk' },
  { id: '4', name: 'JPMorgan Chase', ticker: 'JPM', sector: 'Finance', price: '$192.10', change: '+0.78%', positive: true, marketCap: '$550.4B', revenue: '$158.1B', employees: '309K', ceo: 'Jamie Dimon' },
  { id: '5', name: 'Nvidia Corp', ticker: 'NVDA', sector: 'Technology', price: '$850.60', change: '+2.52%', positive: true, marketCap: '$2.1T', revenue: '$60.9B', employees: '29K', ceo: 'Jensen Huang' },
  { id: '6', name: 'Coinbase Global', ticker: 'COIN', sector: 'Crypto/Web3', price: '$240.84', change: '+8.90%', positive: true, marketCap: '$58.2B', revenue: '$3.1B', employees: '3.4K', ceo: 'Brian Armstrong' },
];

export const businessEvents: BusinessEvent[] = [
  { id: '1', title: 'Global Tech Summit 2026', type: 'summit', date: 'Mar 10, 2026', location: 'San Francisco, CA', company: 'TechVision Corp', impact: 'High', description: 'Annual gathering of 5,000+ technology leaders discussing AI, policy, and future markets.' },
  { id: '2', title: 'Q1 Earnings Season Begins', type: 'earnings', date: 'Mar 15, 2026', location: 'Virtual', company: 'Multiple', impact: 'High', description: 'S&P 500 companies report Q1 results — markets expect 8.4% average EPS growth.' },
  { id: '3', title: 'GreenPower Inc IPO', type: 'ipo', date: 'Mar 20, 2026', location: 'NYSE', company: 'GreenPower Inc', impact: 'High', description: 'Renewable energy startup goes public at $65 target price, raising $3.8B.' },
  { id: '4', title: 'World Economic Policy Forum', type: 'summit', date: 'Mar 22, 2026', location: 'Geneva, Switzerland', company: undefined, impact: 'High', description: 'Finance ministers and CEOs align on global policy and trade agreements.' },
  { id: '5', title: 'National Small Business Expo', type: 'conference', date: 'Mar 28, 2026', location: 'Chicago, IL', company: undefined, impact: 'Medium', description: 'America\'s largest SME conference with 12,000 attendees and 400+ exhibitors.' },
  { id: '6', title: 'FinEdge Capital Merger Close', type: 'merger', date: 'Apr 1, 2026', location: 'New York, NY', company: 'FinEdge Capital', impact: 'High', description: '$42B merger between FinEdge Capital and Meridian Bank pending final regulatory approval.' },
];

export const businessDeals: BusinessDeal[] = [
  { id: '1', title: 'FinEdge × Meridian Bank Merger', type: 'merger', value: '$42B', parties: 'FinEdge Capital + Meridian Bank', status: 'pending', date: 'Apr 1, 2026', sector: 'Finance' },
  { id: '2', title: 'TechVision acquires CloudSync AI', type: 'acquisition', value: '$8.4B', parties: 'TechVision Corp + CloudSync AI', status: 'completed', date: 'Feb 28, 2026', sector: 'Technology' },
  { id: '3', title: 'GreenPower Series D Funding', type: 'funding', value: '$1.2B', parties: 'GreenPower Inc + VC Consortium', status: 'completed', date: 'Feb 14, 2026', sector: 'Energy' },
  { id: '4', title: 'NovaBioMed × GenPharm Partnership', type: 'partnership', value: '$550M', parties: 'NovaBioMed + GenPharm Labs', status: 'announced', date: 'Mar 5, 2026', sector: 'Healthcare' },
  { id: '5', title: 'CryptoVault DeFi Protocol Launch', type: 'launch', value: '$200M', parties: 'CryptoVault Ltd', status: 'announced', date: 'Mar 18, 2026', sector: 'Crypto/Web3' },
];

export const businessPolls = [
  {
    id: 'b1',
    question: 'What is the biggest risk to the economy in 2026?',
    options: [
      { label: 'Inflation remaining elevated', votes: 38400 },
      { label: 'Rising interest rates', votes: 29100 },
      { label: 'Global trade disruptions', votes: 22700 },
      { label: 'Tech sector correction', votes: 14800 },
    ],
    totalVotes: 105000, endDate: 'Mar 25, 2026',
  },
  {
    id: 'b2',
    question: 'Which sector will outperform in Q2 2026?',
    options: [
      { label: 'Artificial Intelligence / Tech', votes: 51200 },
      { label: 'Green Energy', votes: 34800 },
      { label: 'Healthcare / Biotech', votes: 22100 },
      { label: 'Financial Services', votes: 18900 },
    ],
    totalVotes: 127000, endDate: 'Apr 1, 2026',
  },
];

export const sectorPerformance = [
  { sector: 'Technology', ytd: '+18.4%', monthly: '+3.2%', positive: true, marketCap: '$14.2T' },
  { sector: 'Healthcare', ytd: '+9.1%', monthly: '+1.4%', positive: true, marketCap: '$6.8T' },
  { sector: 'Energy', ytd: '+22.3%', monthly: '+5.1%', positive: true, marketCap: '$4.1T' },
  { sector: 'Finance', ytd: '+7.6%', monthly: '-0.3%', positive: false, marketCap: '$8.9T' },
  { sector: 'Real Estate', ytd: '-2.1%', monthly: '-0.8%', positive: false, marketCap: '$2.4T' },
  { sector: 'Crypto/Web3', ytd: '+41.2%', monthly: '+9.8%', positive: true, marketCap: '$2.1T' },
];

export const businessNews = [
  { id: '1', headline: 'Fed holds rates steady; signals two cuts possible in H2 2026', category: 'Finance', time: '8m ago', urgency: 'high' },
  { id: '2', headline: 'TechVision Corp acquires CloudSync AI for $8.4B in all-stock deal', category: 'M&A', time: '34m ago', urgency: 'high' },
  { id: '3', headline: 'GreenPower IPO priced at $65 — expected to surge on debut', category: 'Markets', time: '1h ago', urgency: 'high' },
  { id: '4', headline: 'Small business optimism hits 3-year high on easing inflation', category: 'Economy', time: '2h ago', urgency: 'medium' },
  { id: '5', headline: 'Crypto market cap crosses $2T as BTC approaches $90K', category: 'Crypto', time: '3h ago', urgency: 'medium' },
  { id: '6', headline: 'New trade agreement with EU to reduce tariffs on 2,400 goods', category: 'Trade', time: '4h ago', urgency: 'medium' },
];

