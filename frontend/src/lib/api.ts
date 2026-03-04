// ============================================
// ARIZONALEX – API Client
// ============================================

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// ---- Token helpers ----
export const getToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('az_token');
};

export const setToken = (token: string) => {
    localStorage.setItem('az_token', token);
};

export const removeToken = () => {
    localStorage.removeItem('az_token');
};

// ---- Core fetch wrapper ----
async function request<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const token = getToken();
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
    };
    if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || 'An error occurred');
    }
    return data;
}

// ============================================
// AUTH
// ============================================
export const authApi = {
    login: (email: string, password: string) =>
        request<{ success: boolean; token: string; user: ApiUser }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),

    register: (data: {
        name: string;
        email: string;
        password: string;
        username: string;
        bio?: string;
        role?: string;
        party?: string;
    }) =>
        request<{ success: boolean; token: string; user: ApiUser }>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    getMe: () =>
        request<{ success: boolean; user: ApiUser }>('/auth/me'),
};

// ============================================
// USERS
// ============================================
export const usersApi = {
    getAll: (params?: { role?: string; search?: string; page?: number; limit?: number }) =>
        request<{ success: boolean; users: ApiUser[]; total: number }>(`/users?${new URLSearchParams(params as Record<string, string> || {})}`),

    getById: (id: string) =>
        request<{ success: boolean; user: ApiUser }>(`/users/${id}`),

    getByUsername: (username: string) =>
        request<{ success: boolean; user: ApiUser }>(`/users/username/${username}`),

    update: (id: string, data: Partial<ApiUser>) =>
        request<{ success: boolean; user: ApiUser }>(`/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    follow: (id: string) =>
        request<{ success: boolean; message: string }>(`/users/${id}/follow`, { method: 'PUT' }),

    unfollow: (id: string) =>
        request<{ success: boolean; message: string }>(`/users/${id}/unfollow`, { method: 'PUT' }),
};

// ============================================
// POSTS
// ============================================
export const postsApi = {
    getAll: (params?: { type?: string; author?: string; hashtag?: string; page?: number; limit?: number }) =>
        request<{ success: boolean; posts: ApiPost[]; total: number }>(`/posts?${new URLSearchParams(params as Record<string, string> || {})}`),

    getTimeline: (page = 1) =>
        request<{ success: boolean; posts: ApiPost[]; total: number }>(`/posts/feed/timeline?page=${page}`),

    getById: (id: string) =>
        request<{ success: boolean; post: ApiPost }>(`/posts/${id}`),

    getBookmarks: () =>
        request<{ success: boolean; posts: ApiPost[] }>('/posts/bookmarks/me'),

    create: (data: { content: string; type?: string; images?: string[]; video?: string }) =>
        request<{ success: boolean; post: ApiPost }>('/posts', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    delete: (id: string) =>
        request<{ success: boolean }>(`/posts/${id}`, { method: 'DELETE' }),

    like: (id: string) =>
        request<{ success: boolean; liked: boolean }>(`/posts/${id}/like`, { method: 'PUT' }),

    repost: (id: string) =>
        request<{ success: boolean; reposted: boolean }>(`/posts/${id}/repost`, { method: 'PUT' }),

    bookmark: (id: string) =>
        request<{ success: boolean; bookmarked: boolean }>(`/posts/${id}/bookmark`, { method: 'PUT' }),
};

// ============================================
// COMMENTS
// ============================================
export const commentsApi = {
    getByPost: (postId: string) =>
        request<{ success: boolean; comments: ApiComment[] }>(`/comments/post/${postId}`),

    create: (postId: string, content: string) =>
        request<{ success: boolean; comment: ApiComment }>(`/comments/post/${postId}`, {
            method: 'POST',
            body: JSON.stringify({ content }),
        }),

    delete: (id: string) =>
        request<{ success: boolean }>(`/comments/${id}`, { method: 'DELETE' }),
};

// ============================================
// MESSAGES
// ============================================
export const messagesApi = {
    getConversations: () =>
        request<{ success: boolean; conversations: ApiConversation[] }>('/messages/conversations'),

    getMessages: (conversationId: string) =>
        request<{ success: boolean; messages: ApiMessage[] }>(`/messages/conversations/${conversationId}`),

    sendMessage: (conversationId: string, content: string) =>
        request<{ success: boolean; message: ApiMessage }>(`/messages/conversations/${conversationId}`, {
            method: 'POST',
            body: JSON.stringify({ content }),
        }),

    createConversation: (participantId: string, content?: string) =>
        request<{ success: boolean; conversation: ApiConversation }>('/messages/conversations', {
            method: 'POST',
            body: JSON.stringify({ participantId, content }),
        }),
};

// ============================================
// POLLS
// ============================================
export const pollsApi = {
    getAll: () =>
        request<{ success: boolean; polls: ApiPoll[] }>('/polls'),

    create: (data: { question: string; options: string[]; endDate: string }) =>
        request<{ success: boolean; poll: ApiPoll }>('/polls', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    vote: (id: string, optionIndex: number) =>
        request<{ success: boolean; poll: ApiPoll }>(`/polls/${id}/vote`, {
            method: 'PUT',
            body: JSON.stringify({ optionIndex }),
        }),
};

// ============================================
// PROMISES
// ============================================
export const promisesApi = {
    getAll: (params?: { status?: string; category?: string; politician?: string }) =>
        request<{ success: boolean; promises: ApiPromise[] }>(`/promises?${new URLSearchParams(params as Record<string, string> || {})}`),
    create: (data: object) =>
        request<{ success: boolean; promise: ApiPromise }>('/promises', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    update: (id: string, data: object) =>
        request<{ success: boolean; promise: ApiPromise }>(`/promises/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
};

// ============================================
// EVENTS
// ============================================
export const eventsApi = {
    getAll: (params?: { type?: string; upcoming?: string }) =>
        request<{ success: boolean; events: ApiEvent[] }>(`/events?${new URLSearchParams(params as Record<string, string> || {})}`),
    create: (data: object) =>
        request<{ success: boolean; event: ApiEvent }>('/events', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    attend: (id: string) =>
        request<{ success: boolean; attending: boolean }>(`/events/${id}/attend`, { method: 'PUT' }),
};

// ============================================
// NOTIFICATIONS
// ============================================
export const notificationsApi = {
    getAll: () =>
        request<{ success: boolean; notifications: ApiNotification[]; unreadCount: number }>('/notifications'),

    markRead: (id: string) =>
        request<{ success: boolean }>(`/notifications/${id}/read`, { method: 'PUT' }),

    markAllRead: () =>
        request<{ success: boolean }>('/notifications/read-all', { method: 'PUT' }),
};

// ============================================
// STORIES
// ============================================
export const storiesApi = {
    getAll: () =>
        request<{ success: boolean; storyGroups: { author: ApiUser; stories: ApiStory[] }[] }>('/stories'),

    create: (image: string) =>
        request<{ success: boolean; story: ApiStory }>('/stories', {
            method: 'POST',
            body: JSON.stringify({ image }),
        }),

    view: (id: string) =>
        request<{ success: boolean }>(`/stories/${id}/view`, { method: 'PUT' }),
};

// ============================================
// EXPLORE
// ============================================
export const exploreApi = {
    getTrending: () =>
        request<{
            success: boolean;
            trending: {
                hashtags: { tag: string; posts: number }[];
                posts: ApiPost[];
                suggestedUsers: ApiUser[];
            };
        }>('/explore/trending'),

    search: (q: string, type?: string) =>
        request<{ success: boolean; results: { users?: ApiUser[]; posts?: ApiPost[] } }>(
            `/explore/search?q=${encodeURIComponent(q)}${type ? `&type=${type}` : ''}`
        ),
};

// ============================================
// ADMIN
// ============================================
export const adminApi = {
    getStats: () =>
        request<{ success: boolean; stats: Record<string, unknown> }>('/admin/stats'),
    getUsers: (params?: { page?: number; limit?: number; role?: string; search?: string }) =>
        request<{ success: boolean; users: ApiUser[]; total: number }>(`/admin/users?${new URLSearchParams(params as Record<string, string> || {})}`),
    deleteUser: (id: string) =>
        request<{ success: boolean }>(`/admin/users/${id}`, { method: 'DELETE' }),
    verifyUser: (id: string) =>
        request<{ success: boolean; user: ApiUser }>(`/admin/users/${id}/verify`, { method: 'PUT' }),
};

// ============================================
// TYPE DEFINITIONS (mirrors backend models)
// ============================================
export interface ApiUser {
    _id: string;
    id?: string;
    name: string;
    email?: string;
    username: string;
    avatar: string;
    banner?: string;
    bio: string;
    role: 'politician' | 'journalist' | 'citizen' | 'official' | 'admin';
    verified: boolean;
    party?: string;
    location?: string;
    website?: string;
    followers: string[] | ApiUser[];
    following: string[] | ApiUser[];
    followersCount?: number;
    followingCount?: number;
    createdAt?: string;
}

export interface ApiPost {
    _id: string;
    author: ApiUser;
    content: string;
    type: 'text' | 'image' | 'video' | 'thread' | 'policy';
    images?: string[];
    video?: string;
    likes: string[];
    reposts: string[];
    bookmarkedBy: string[];
    hashtags?: string[];
    likesCount: number;
    repostsCount: number;
    commentsCount: number;
    createdAt: string;
}

export interface ApiComment {
    _id: string;
    post: string;
    author: ApiUser;
    content: string;
    likes: string[];
    createdAt: string;
}

export interface ApiConversation {
    _id: string;
    participants: ApiUser[];
    lastMessage: string;
    unread: number;
    updatedAt: string;
}

export interface ApiMessage {
    _id: string;
    conversation: string;
    sender: ApiUser;
    content: string;
    read: boolean;
    createdAt: string;
}

export interface ApiPoll {
    _id: string;
    question: string;
    options: { _id: string; label: string; votes: string[] }[];
    totalVotes: number;
    endDate: string;
    author: ApiUser;
}

export interface ApiPromise {
    _id: string;
    title: string;
    description: string;
    status: 'kept' | 'broken' | 'in-progress' | 'pending';
    politician: ApiUser;
    date: string;
    category: string;
}

export interface ApiEvent {
    _id: string;
    title: string;
    type: 'rally' | 'speech' | 'meeting' | 'townhall' | 'debate';
    date: string;
    location: string;
    organizer: ApiUser;
    attendees: string[];
    description: string;
}

export interface ApiNotification {
    _id: string;
    type: 'like' | 'comment' | 'follow' | 'mention' | 'repost' | 'system' | 'verification';
    actor?: ApiUser;
    content: string;
    read: boolean;
    createdAt: string;
}

export interface ApiStory {
    _id: string;
    author: ApiUser;
    image: string;
    viewedBy: string[];
    expiresAt: string;
    createdAt: string;
}

// ---- Time helper ----
export function timeAgo(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return date.toLocaleDateString();
}
