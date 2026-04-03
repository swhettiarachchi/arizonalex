// ============================================
// ARIZONALEX – Shared Type Definitions
// ============================================

export interface User {
  id: string;
  _id?: string;
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
  // Political fields
  position?: string;
  ideology?: string;
  yearsActive?: string;
  country?: string;
  campaignPromises?: string[];
  achievements?: string[];
  // Business fields
  company?: string;
  industry?: string;
  services?: string[];
  portfolioUrl?: string;
  // Analytics
  profileViews?: number;
  supportPercentage?: number;
}

export interface Post {
  id: string;
  author: User;
  content: string;
  type: 'text' | 'image' | 'video' | 'thread' | 'policy';
  policyTitle?: string;
  policyCategory?: string;
  images?: string[];
  video?: string;
  likes: number;
  comments: number;
  reposts: number;
  bookmarked?: boolean;
  liked?: boolean;
  reposted?: boolean;
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
  author?: User;
  voted?: number;
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

// ============================================
// DEBATE-TO-EARN TYPES
// ============================================

export interface DebateMessage {
  _id?: string;
  sender: User | { _id: string; name: string; username: string; avatar: string; role: string; verified: boolean };
  content: string;
  timestamp: string;
}

export interface Debate {
  _id: string;
  id?: string;
  title: string;
  description: string;
  topic: string;
  category: 'politics' | 'crypto' | 'business' | 'tech' | 'social' | 'science' | 'sports' | 'other';
  mode: 'text' | 'voice' | 'video';
  status: 'waiting' | 'live' | 'voting' | 'completed' | 'cancelled';
  creator: User;
  opponent: User | null;
  entryFee: number;
  prizePool: number;
  platformFee: number;
  duration: number;
  votingDuration: number;
  startedAt: string | null;
  endedAt: string | null;
  votingDeadline: string | null;
  messages: DebateMessage[];
  spectators: User[];
  spectatorCount: number;
  maxSpectators: number;
  winner: User | null;
  isDraw: boolean;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'pro';
  // Country & location
  country: string;
  countries: string[];
  language: string;
  debateType: '1v1' | 'group' | 'live';
  isGlobal: boolean;
  // Metadata
  viewCount: number;
  featured: boolean;
  voteCounts?: Record<string, number>;
  totalVotes?: number;
  userVote?: { voted: boolean; votedFor?: string };
  timeRemaining?: number;
  isVotingOpen?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CountryLeaderEntry {
  user: User;
  wins: number;
  earnings: number;
  debates: number;
  country: string;
}

export interface CountryStats {
  country: string;
  totalDebates: number;
  liveCount: number;
  waitingCount: number;
  completedCount: number;
  topCategory: string;
}

export interface WalletTransaction {
  _id?: string;
  type: 'deposit' | 'withdraw' | 'entry_fee' | 'earning' | 'refund' | 'escrow_hold' | 'escrow_release' | 'platform_fee' | 'bonus';
  amount: number;
  description: string;
  relatedDebate: string | null;
  balanceAfter: number;
  status: 'completed' | 'pending' | 'failed';
  timestamp: string;
}

export interface WalletData {
  balance: number;
  escrowBalance: number;
  totalEarned: number;
  totalSpent: number;
  totalDebates: number;
  totalWins: number;
  winRate: number;
  twoFactorWithdraw: boolean;
  recentTransactions: WalletTransaction[];
}

export interface VoteData {
  voteCounts: Record<string, number>;
  totalVotes: number;
  userVote: { voted: boolean; votedFor?: string } | null;
}

