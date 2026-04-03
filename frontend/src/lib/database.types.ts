/* eslint-disable @typescript-eslint/no-empty-object-type */
// ── Supabase Database Type Definitions ───────────────────────────────
// Matches the actual Supabase schema for project: ikilkixuvtemkpviwpzr
// Auto-generate with: npx supabase gen types typescript --project-id ikilkixuvtemkpviwpzr

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    username: string
                    display_name: string | null
                    avatar_url: string | null
                    cover_url: string | null
                    bio: string | null
                    location: string | null
                    website: string | null
                    profession: string | null
                    role: string
                    is_verified: boolean
                    verification_type: string | null
                    verified_at: string | null
                    trust_score: number
                    followers_count: number
                    following_count: number
                    posts_count: number
                    profile_views: number
                    total_likes: number
                    total_reposts: number
                    is_active: boolean
                    theme_preference: string
                    joined_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    username: string
                    display_name?: string | null
                    avatar_url?: string | null
                    cover_url?: string | null
                    bio?: string | null
                    location?: string | null
                    website?: string | null
                    profession?: string | null
                    role?: string
                    is_verified?: boolean
                    verification_type?: string | null
                    verified_at?: string | null
                    trust_score?: number
                    followers_count?: number
                    following_count?: number
                    posts_count?: number
                    profile_views?: number
                    total_likes?: number
                    total_reposts?: number
                    is_active?: boolean
                    theme_preference?: string
                    joined_at?: string
                    updated_at?: string
                }
                Update: {
                    username?: string
                    display_name?: string | null
                    avatar_url?: string | null
                    cover_url?: string | null
                    bio?: string | null
                    location?: string | null
                    website?: string | null
                    profession?: string | null
                    role?: string
                    is_verified?: boolean
                    verification_type?: string | null
                    verified_at?: string | null
                    trust_score?: number
                    followers_count?: number
                    following_count?: number
                    posts_count?: number
                    profile_views?: number
                    total_likes?: number
                    total_reposts?: number
                    is_active?: boolean
                    theme_preference?: string
                    updated_at?: string
                }
                Relationships: []
            }
            posts: {
                Row: {
                    id: string
                    author_id: string
                    content: string
                    post_type: string
                    parent_id: string | null
                    original_post_id: string | null
                    category: string | null
                    tags: string[] | null
                    media_urls: string[] | null
                    likes_count: number
                    reposts_count: number
                    replies_count: number
                    views_count: number
                    is_pinned: boolean
                    is_hidden: boolean
                    is_flagged: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    author_id: string
                    content: string
                    post_type?: string
                    parent_id?: string | null
                    original_post_id?: string | null
                    category?: string | null
                    tags?: string[] | null
                    media_urls?: string[] | null
                    likes_count?: number
                    reposts_count?: number
                    replies_count?: number
                    views_count?: number
                    is_pinned?: boolean
                    is_hidden?: boolean
                    is_flagged?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    content?: string
                    post_type?: string
                    parent_id?: string | null
                    original_post_id?: string | null
                    category?: string | null
                    tags?: string[] | null
                    media_urls?: string[] | null
                    likes_count?: number
                    reposts_count?: number
                    replies_count?: number
                    views_count?: number
                    is_pinned?: boolean
                    is_hidden?: boolean
                    is_flagged?: boolean
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: 'posts_author_id_fkey'
                        columns: ['author_id']
                        referencedRelation: 'profiles'
                        referencedColumns: ['id']
                    },
                    {
                        foreignKeyName: 'posts_parent_id_fkey'
                        columns: ['parent_id']
                        referencedRelation: 'posts'
                        referencedColumns: ['id']
                    },
                    {
                        foreignKeyName: 'posts_original_post_id_fkey'
                        columns: ['original_post_id']
                        referencedRelation: 'posts'
                        referencedColumns: ['id']
                    }
                ]
            }
            likes: {
                Row: {
                    user_id: string
                    post_id: string
                    created_at: string
                }
                Insert: {
                    user_id: string
                    post_id: string
                    created_at?: string
                }
                Update: {}
                Relationships: [
                    {
                        foreignKeyName: 'likes_user_id_fkey'
                        columns: ['user_id']
                        referencedRelation: 'profiles'
                        referencedColumns: ['id']
                    },
                    {
                        foreignKeyName: 'likes_post_id_fkey'
                        columns: ['post_id']
                        referencedRelation: 'posts'
                        referencedColumns: ['id']
                    }
                ]
            }
            reposts: {
                Row: {
                    user_id: string
                    post_id: string
                    created_at: string
                }
                Insert: {
                    user_id: string
                    post_id: string
                    created_at?: string
                }
                Update: {}
                Relationships: []
            }
            bookmarks: {
                Row: {
                    user_id: string
                    post_id: string
                    created_at: string
                }
                Insert: {
                    user_id: string
                    post_id: string
                    created_at?: string
                }
                Update: {}
                Relationships: []
            }
            messages: {
                Row: {
                    id: string
                    conversation_id: string
                    sender_id: string
                    content: string
                    media_url: string | null
                    is_deleted: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    conversation_id: string
                    sender_id: string
                    content: string
                    media_url?: string | null
                    is_deleted?: boolean
                    created_at?: string
                }
                Update: {
                    content?: string
                    media_url?: string | null
                    is_deleted?: boolean
                }
                Relationships: [
                    {
                        foreignKeyName: 'messages_conversation_id_fkey'
                        columns: ['conversation_id']
                        referencedRelation: 'conversations'
                        referencedColumns: ['id']
                    },
                    {
                        foreignKeyName: 'messages_sender_id_fkey'
                        columns: ['sender_id']
                        referencedRelation: 'profiles'
                        referencedColumns: ['id']
                    }
                ]
            }
            conversations: {
                Row: {
                    id: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    updated_at?: string
                }
                Relationships: []
            }
            conversation_participants: {
                Row: {
                    conversation_id: string
                    user_id: string
                    last_read_at: string | null
                }
                Insert: {
                    conversation_id: string
                    user_id: string
                    last_read_at?: string | null
                }
                Update: {
                    last_read_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: 'conversation_participants_conversation_id_fkey'
                        columns: ['conversation_id']
                        referencedRelation: 'conversations'
                        referencedColumns: ['id']
                    },
                    {
                        foreignKeyName: 'conversation_participants_user_id_fkey'
                        columns: ['user_id']
                        referencedRelation: 'profiles'
                        referencedColumns: ['id']
                    }
                ]
            }
            notifications: {
                Row: {
                    id: string
                    recipient_id: string
                    actor_id: string | null
                    type: string
                    entity_type: string | null
                    entity_id: string | null
                    body: string | null
                    is_read: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    recipient_id: string
                    actor_id?: string | null
                    type: string
                    entity_type?: string | null
                    entity_id?: string | null
                    body?: string | null
                    is_read?: boolean
                    created_at?: string
                }
                Update: {
                    type?: string
                    entity_type?: string | null
                    entity_id?: string | null
                    body?: string | null
                    is_read?: boolean
                }
                Relationships: [
                    {
                        foreignKeyName: 'notifications_recipient_id_fkey'
                        columns: ['recipient_id']
                        referencedRelation: 'profiles'
                        referencedColumns: ['id']
                    },
                    {
                        foreignKeyName: 'notifications_actor_id_fkey'
                        columns: ['actor_id']
                        referencedRelation: 'profiles'
                        referencedColumns: ['id']
                    }
                ]
            }
            follows: {
                Row: {
                    follower_id: string
                    following_id: string
                    created_at: string
                }
                Insert: {
                    follower_id: string
                    following_id: string
                    created_at?: string
                }
                Update: {}
                Relationships: [
                    {
                        foreignKeyName: 'follows_follower_id_fkey'
                        columns: ['follower_id']
                        referencedRelation: 'profiles'
                        referencedColumns: ['id']
                    },
                    {
                        foreignKeyName: 'follows_following_id_fkey'
                        columns: ['following_id']
                        referencedRelation: 'profiles'
                        referencedColumns: ['id']
                    }
                ]
            }
            polls: {
                Row: {
                    id: string
                    creator_id: string
                    question: string
                    category: string | null
                    is_featured: boolean
                    is_live: boolean
                    total_votes: number
                    ends_at: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    creator_id: string
                    question: string
                    category?: string | null
                    is_featured?: boolean
                    is_live?: boolean
                    total_votes?: number
                    ends_at?: string | null
                    created_at?: string
                }
                Update: {
                    question?: string
                    category?: string | null
                    is_featured?: boolean
                    is_live?: boolean
                    total_votes?: number
                    ends_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: 'polls_creator_id_fkey'
                        columns: ['creator_id']
                        referencedRelation: 'profiles'
                        referencedColumns: ['id']
                    }
                ]
            }
            poll_options: {
                Row: {
                    id: string
                    poll_id: string
                    label: string
                    votes_count: number
                }
                Insert: {
                    id?: string
                    poll_id: string
                    label: string
                    votes_count?: number
                }
                Update: {
                    label?: string
                    votes_count?: number
                }
                Relationships: []
            }
            poll_votes: {
                Row: {
                    user_id: string
                    poll_id: string
                    option_id: string
                    created_at: string
                }
                Insert: {
                    user_id: string
                    poll_id: string
                    option_id: string
                    created_at?: string
                }
                Update: {}
                Relationships: []
            }
            debates: {
                Row: {
                    id: string
                    creator_id: string
                    title: string
                    description: string | null
                    category: string | null
                    status: string
                    scope: string
                    side_a_user_id: string | null
                    side_b_user_id: string | null
                    side_a_label: string | null
                    side_b_label: string | null
                    side_a_votes: number
                    side_b_votes: number
                    winner_side: string | null
                    scheduled_at: string | null
                    started_at: string | null
                    ended_at: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    creator_id: string
                    title: string
                    description?: string | null
                    category?: string | null
                    status?: string
                    scope?: string
                    side_a_user_id?: string | null
                    side_b_user_id?: string | null
                    side_a_label?: string | null
                    side_b_label?: string | null
                    side_a_votes?: number
                    side_b_votes?: number
                    winner_side?: string | null
                    scheduled_at?: string | null
                    started_at?: string | null
                    ended_at?: string | null
                    created_at?: string
                }
                Update: {
                    title?: string
                    description?: string | null
                    category?: string | null
                    status?: string
                    scope?: string
                    side_a_user_id?: string | null
                    side_b_user_id?: string | null
                    side_a_label?: string | null
                    side_b_label?: string | null
                    side_a_votes?: number
                    side_b_votes?: number
                    winner_side?: string | null
                    scheduled_at?: string | null
                    started_at?: string | null
                    ended_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: 'debates_creator_id_fkey'
                        columns: ['creator_id']
                        referencedRelation: 'profiles'
                        referencedColumns: ['id']
                    },
                    {
                        foreignKeyName: 'debates_side_a_user_id_fkey'
                        columns: ['side_a_user_id']
                        referencedRelation: 'profiles'
                        referencedColumns: ['id']
                    },
                    {
                        foreignKeyName: 'debates_side_b_user_id_fkey'
                        columns: ['side_b_user_id']
                        referencedRelation: 'profiles'
                        referencedColumns: ['id']
                    }
                ]
            }
            wallets: {
                Row: {
                    id: string
                    user_id: string
                    balance: number
                    currency: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    balance?: number
                    currency?: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    balance?: number
                    currency?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: 'wallets_user_id_fkey'
                        columns: ['user_id']
                        referencedRelation: 'profiles'
                        referencedColumns: ['id']
                    }
                ]
            }
            wallet_transactions: {
                Row: {
                    id: string
                    wallet_id: string
                    type: string
                    amount: number
                    balance_after: number
                    description: string | null
                    entity_type: string | null
                    entity_id: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    wallet_id: string
                    type: string
                    amount: number
                    balance_after: number
                    description?: string | null
                    entity_type?: string | null
                    entity_id?: string | null
                    created_at?: string
                }
                Update: {
                    type?: string
                    amount?: number
                    balance_after?: number
                    description?: string | null
                    entity_type?: string | null
                    entity_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: 'wallet_transactions_wallet_id_fkey'
                        columns: ['wallet_id']
                        referencedRelation: 'wallets'
                        referencedColumns: ['id']
                    }
                ]
            }
            login_history: {
                Row: {
                    id: string
                    user_id: string
                    ip_address: string | null
                    user_agent: string | null
                    location: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    ip_address?: string | null
                    user_agent?: string | null
                    location?: string | null
                    created_at?: string
                }
                Update: {}
                Relationships: []
            }
            sessions: {
                Row: {
                    id: string
                    user_id: string
                    token: string | null
                    device: string | null
                    ip_address: string | null
                    expires_at: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    token?: string | null
                    device?: string | null
                    ip_address?: string | null
                    expires_at?: string | null
                    created_at?: string
                }
                Update: {
                    expires_at?: string | null
                }
                Relationships: []
            }
            political_events: {
                Row: {
                    id: string
                    title: string
                    description: string | null
                    location: string | null
                    date: string | null
                    category: string | null
                    creator_id: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    description?: string | null
                    location?: string | null
                    date?: string | null
                    category?: string | null
                    creator_id?: string | null
                    created_at?: string
                }
                Update: {
                    title?: string
                    description?: string | null
                    location?: string | null
                    date?: string | null
                    category?: string | null
                }
                Relationships: []
            }
            debate_arguments: {
                Row: {
                    id: string
                    debate_id: string
                    author_id: string
                    content: string
                    side: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    debate_id: string
                    author_id: string
                    content: string
                    side: string
                    created_at?: string
                }
                Update: {
                    content?: string
                }
                Relationships: []
            }
            debate_votes: {
                Row: {
                    id: string
                    debate_id: string
                    voter_id: string
                    side: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    debate_id: string
                    voter_id: string
                    side: string
                    created_at?: string
                }
                Update: {}
                Relationships: []
            }
            debate_stakes: {
                Row: {
                    id: string
                    debate_id: string
                    user_id: string
                    amount: number
                    side: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    debate_id: string
                    user_id: string
                    amount: number
                    side: string
                    created_at?: string
                }
                Update: {}
                Relationships: []
            }
            post_hashtags: {
                Row: {
                    id: string
                    post_id: string
                    hashtag: string
                }
                Insert: {
                    id?: string
                    post_id: string
                    hashtag: string
                }
                Update: {}
                Relationships: []
            }
            hashtags: {
                Row: {
                    id: string
                    tag: string
                    post_count: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    tag: string
                    post_count?: number
                    created_at?: string
                }
                Update: {
                    post_count?: number
                }
                Relationships: []
            }
            blocks: {
                Row: {
                    blocker_id: string
                    blocked_id: string
                    created_at: string
                }
                Insert: {
                    blocker_id: string
                    blocked_id: string
                    created_at?: string
                }
                Update: {}
                Relationships: []
            }
            reports: {
                Row: {
                    id: string
                    reporter_id: string
                    entity_type: string
                    entity_id: string
                    reason: string | null
                    status: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    reporter_id: string
                    entity_type: string
                    entity_id: string
                    reason?: string | null
                    status?: string
                    created_at?: string
                }
                Update: {
                    status?: string
                }
                Relationships: []
            }
            promises: {
                Row: {
                    id: string
                    politician_id: string | null
                    politician_name: string
                    title: string
                    description: string | null
                    status: string
                    category: string | null
                    made_at: string | null
                    deadline: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    politician_id?: string | null
                    politician_name: string
                    title: string
                    description?: string | null
                    status?: string
                    category?: string | null
                    made_at?: string | null
                    deadline?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    politician_id?: string | null
                    politician_name?: string
                    title?: string
                    description?: string | null
                    status?: string
                    category?: string | null
                    made_at?: string | null
                    deadline?: string | null
                    updated_at?: string
                }
                Relationships: []
            }
        }
        Views: {}
        Functions: {}
        Enums: {}
        CompositeTypes: {}
    }
}

// ── Convenience type aliases ─────────────────────────────────────────
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Specific table row types
export type Profile = Tables<'profiles'>
export type Post = Tables<'posts'>
export type Like = Tables<'likes'>
export type Repost = Tables<'reposts'>
export type Bookmark = Tables<'bookmarks'>
export type Message = Tables<'messages'>
export type Conversation = Tables<'conversations'>
export type ConversationParticipant = Tables<'conversation_participants'>
export type Notification = Tables<'notifications'>
export type Follow = Tables<'follows'>
export type Poll = Tables<'polls'>
export type PollOption = Tables<'poll_options'>
export type PollVote = Tables<'poll_votes'>
export type Debate = Tables<'debates'>
export type Wallet = Tables<'wallets'>
export type WalletTransaction = Tables<'wallet_transactions'>
export type Promise_ = Tables<'promises'>
