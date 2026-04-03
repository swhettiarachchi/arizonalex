// In-memory data store (persists for server lifetime, resets on restart)
// This is shared across all API routes

import {
    posts as mockPosts,
    notifications as mockNotifications,
    conversations as mockConversations,
    chatMessages as mockChatMessages,
    activeBills as mockBills,
    polls as mockPolls,
    promises as mockPromises,
    events as mockEvents,
    businessDeals as mockDeals,
    companies as mockCompanies,
} from '@/lib/mock-data';

export type PostRecord = typeof mockPosts[0] & {
    likedBy: Set<string>;
    bookmarkedBy: Set<string>;
    repostedBy: Set<string>;
};

export type NotificationRecord = typeof mockNotifications[0] & {
    readBy: Set<string>;
};

export type MessageRecord = typeof mockChatMessages[0];

export type BillRecord = typeof mockBills[0] & {
    votedFor: Set<string>;
    votedAgainst: Set<string>;
};

export type PollRecord = typeof mockPolls[0] & {
    userVotes: Record<string, number>; // userId -> optionIndex
};

export type EventRecord = typeof mockEvents[0] & {
    rsvps: Set<string>;
};

// Initialize posts with like/bookmark/repost tracking
function initPosts(): PostRecord[] {
    return mockPosts.map(p => ({
        ...p,
        likedBy: new Set<string>(),
        bookmarkedBy: new Set<string>(),
        repostedBy: new Set<string>(),
    }));
}

// Singleton store
const globalStore = global as typeof global & {
    _azStore?: {
        posts: PostRecord[];
        notifications: NotificationRecord[];
        conversations: typeof mockConversations;
        messages: Record<string, MessageRecord[]>;
        follows: Record<string, Set<string>>;
        bills: BillRecord[];
        polls: PollRecord[];
        events: EventRecord[];
        promises: typeof mockPromises;
        deals: typeof mockDeals;
        companies: typeof mockCompanies;
    };
};

if (!globalStore._azStore) {
    globalStore._azStore = {
        posts: initPosts(),
        notifications: mockNotifications.map(n => ({ ...n, readBy: new Set<string>() })),
        conversations: [...mockConversations],
        messages: { '1': [...mockChatMessages] },
        follows: {},
        bills: mockBills.map(b => ({ ...b, votedFor: new Set<string>(), votedAgainst: new Set<string>() })),
        polls: mockPolls.map(p => ({ ...p, userVotes: {} })),
        events: mockEvents.map(e => ({ ...e, rsvps: new Set<string>() })),
        promises: [...mockPromises],
        deals: [...mockDeals],
        companies: [...mockCompanies],
    };
}

export const store = globalStore._azStore!;

// Helper to serialize a post (convert Sets to booleans based on userId)
export function serializePost(post: PostRecord, userId?: string) {
    return {
        id: post.id,
        author: post.author,
        content: post.content,
        type: post.type,
        images: post.images,
        video: post.video,
        likes: post.likes + post.likedBy.size,
        comments: post.comments,
        reposts: post.reposts + post.repostedBy.size,
        timestamp: post.timestamp,
        hashtags: post.hashtags,
        policyTitle: (post as any).policyTitle,
        policyCategory: (post as any).policyCategory,
        liked: userId ? post.likedBy.has(userId) : false,
        bookmarked: userId ? post.bookmarkedBy.has(userId) : false,
        reposted: userId ? post.repostedBy.has(userId) : false,
    };
}

// Helper to parse auth token from request
export function getUserFromCookies(cookieValue: string | undefined) {
    if (!cookieValue) return null;
    try {
        const parts = cookieValue.split('.');
        if (parts.length !== 3) return null;
        const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
        if (payload?.user) return payload.user;
        if (payload?.id) return { id: payload.id };
        return null;
    } catch {
        return null;
    }
}
