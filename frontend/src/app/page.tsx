'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import { useAuthGate } from '@/components/providers/AuthGuard';
import { postsApi, storiesApi, exploreApi, type ApiPost, type ApiStory, timeAgo } from '@/lib/api';
import { trendingHashtags, users } from '@/lib/mock-data';
import { ImageIcon, VideoIcon, BarChartIcon, ThreadIcon, FileTextIcon, BotIcon, MessageCircleIcon, RepeatIcon, HeartIcon, HeartFilledIcon, BookmarkIcon, ShareIcon, PlusIcon, SearchIcon, VerifiedIcon, TrendingUpIcon, XIcon, ZapIcon } from '@/components/ui/Icons';
import { PostContent } from '@/components/ui/PostContent';
import { UserAvatar } from '@/components/ui/UserAvatar';

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toString();
}

interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  type: 'image' | 'video';
}



function StoryUploadModal({ onClose }: { onClose: () => void }) {
  const [storyFile, setStoryFile] = useState<UploadedFile | null>(null);
  const [caption, setCaption] = useState('');
  const [posting, setPosting] = useState(false);
  const [posted, setPosted] = useState(false);
  const storyInputRef = useRef<HTMLInputElement>(null);

  const handleStoryFile = (files: FileList | null) => {
    if (!files || !files[0]) return;
    const file = files[0];
    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      setStoryFile({
        id: Date.now().toString(),
        file,
        preview: URL.createObjectURL(file),
        type: file.type.startsWith('image/') ? 'image' : 'video',
      });
    }
  };

  const handlePost = () => {
    setPosting(true);
    setTimeout(() => {
      setPosted(true);
      setTimeout(() => onClose(), 1200);
    }, 1000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card fade-in" onClick={e => e.stopPropagation()} style={{ maxWidth: 480, width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Create Story</h2>
          <button className="btn btn-icon" onClick={onClose}><XIcon size={18} /></button>
        </div>

        {!storyFile ? (
          <div
            className="upload-dropzone"
            onClick={() => storyInputRef.current?.click()}
            style={{ marginTop: 0 }}
          >
            <div className="upload-dropzone-icon"><ImageIcon size={36} /></div>
            <div className="upload-dropzone-title">Upload a photo or video for your story</div>
            <div className="upload-dropzone-subtitle">JPG, PNG, GIF, MP4 • Click to browse</div>
          </div>
        ) : (
          <div style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: 12 }}>
            {storyFile.type === 'image' ? (
              <img src={storyFile.preview} alt="Story preview" style={{ width: '100%', maxHeight: 350, objectFit: 'cover', display: 'block', borderRadius: 'var(--radius-lg)' }} />
            ) : (
              <video src={storyFile.preview} controls style={{ width: '100%', maxHeight: 350, objectFit: 'cover', display: 'block', borderRadius: 'var(--radius-lg)' }} />
            )}
            <button className="upload-preview-remove" onClick={() => { URL.revokeObjectURL(storyFile.preview); setStoryFile(null); }}>
              <XIcon size={14} />
            </button>
          </div>
        )}

        {storyFile && (
          <>
            <textarea
              className="compose-textarea"
              placeholder="Add a caption (optional)..."
              value={caption}
              onChange={e => setCaption(e.target.value)}
              style={{ minHeight: 60, marginBottom: 12, fontSize: '0.9rem' }}
            />
            <button
              className="btn btn-primary"
              style={{ width: '100%' }}
              onClick={handlePost}
              disabled={posting}
            >
              {posted ? '✓ Story Posted!' : posting ? '⏳ Posting...' : 'Share to Story'}
            </button>
          </>
        )}

        <input
          ref={storyInputRef}
          type="file"
          accept="image/*,video/*"
          style={{ display: 'none' }}
          onChange={e => { handleStoryFile(e.target.files); e.target.value = ''; }}
        />
      </div>
    </div>
  );
}

function PolicyModal({ onClose, onSave }: { onClose: () => void, onSave: (data: any) => void }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [summary, setSummary] = useState('');
  const [fullText, setFullText] = useState('');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card fade-in" onClick={e => e.stopPropagation()} style={{ maxWidth: 600, width: '95%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: 'var(--primary)' }}><FileTextIcon size={20} /></span> Propose Policy
          </h2>
          <button className="btn btn-icon" onClick={onClose}><XIcon size={20} /></button>
        </div>

        <div className="edit-profile-form" style={{ maxHeight: '70vh', overflowY: 'auto', padding: '0 4px' }}>
          <div className="edit-field">
            <label className="edit-field-label">Policy Title</label>
            <input
              className="edit-field-input"
              placeholder="e.g., The Digital Rights Initiative"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>
          <div className="edit-field">
            <label className="edit-field-label">Category</label>
            <select
              className="edit-field-input"
              value={category}
              onChange={e => setCategory(e.target.value)}
              style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
            >
              <option>General</option>
              <option>Economy</option>
              <option>Healthcare</option>
              <option>Education</option>
              <option>Infrastructure</option>
              <option>Environment</option>
            </select>
          </div>
          <div className="edit-field">
            <label className="edit-field-label">Executive Summary</label>
            <textarea
              className="edit-field-input edit-field-textarea"
              placeholder="Briefly describe the core objective..."
              value={summary}
              onChange={e => setSummary(e.target.value)}
              rows={2}
            />
          </div>
          <div className="edit-field">
            <label className="edit-field-label">Full Proposal</label>
            <textarea
              className="edit-field-input edit-field-textarea"
              placeholder="Detailed implementation plan, funding, and impact..."
              value={fullText}
              onChange={e => setFullText(e.target.value)}
              rows={6}
            />
          </div>
        </div>

        <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
          <button className="btn btn-outline" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary"
            style={{ flex: 1 }}
            disabled={!title || !summary}
            onClick={() => onSave({ title, category, summary, fullText })}
          >
            Create Proposal
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { isLoggedIn, user } = useAuth();
  const { requireAuth } = useAuthGate();
  const [activeTab, setActiveTab] = useState('foryou');
  const [apiPosts, setApiPosts] = useState<ApiPost[]>([]);
  const [apiStories, setApiStories] = useState<{ author: ApiPost['author']; stories: ApiStory[] }[]>([]);
  const [trendingData, setTrendingData] = useState(trendingHashtags);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [composeText, setComposeText] = useState('');
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [composeFiles, setComposeFiles] = useState<UploadedFile[]>([]);
  const [postStatus, setPostStatus] = useState<'idle' | 'posting' | 'posted'>('idle');
  const [showPoll, setShowPoll] = useState(false);
  const [showThread, setShowThread] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [threadPosts, setThreadPosts] = useState<string[]>([]);
  const [pollData, setPollData] = useState({
    question: '',
    options: ['', ''],
    duration: '1 day'
  });
  const composeFileRef = useRef<HTMLInputElement>(null);

  // Fetch posts and stories from API
  const fetchFeed = useCallback(async () => {
    try {
      const [postsRes, storiesRes] = await Promise.all([
        postsApi.getAll({ limit: 20 }),
        storiesApi.getAll(),
      ]);
      setApiPosts(postsRes.posts);
      setApiStories(storiesRes.storyGroups);
      // Pre-populate liked/bookmarked state
      if (user) {
        const liked = new Set(postsRes.posts.filter(p => p.likes.includes(user._id)).map(p => p._id));
        const bookmarked = new Set(postsRes.posts.filter(p => p.bookmarkedBy.includes(user._id)).map(p => p._id));
        setLikedIds(liked);
        setBookmarkedIds(bookmarked);
      }
    } catch (_e) { /* API may not be running — fail silently */ }
  }, [user]);

  const fetchTrending = useCallback(async () => {
    try {
      const res = await exploreApi.getTrending();
      if (res.trending.hashtags.length > 0) {
        // Map API shape to legacy shape for UI
        setTrendingData(res.trending.hashtags.map(h => ({ tag: h.tag, posts: h.posts, category: 'Trending' })));
      }
    } catch (_e) { /* use mock fallback */ }
  }, []);

  useEffect(() => { fetchFeed(); fetchTrending(); }, [fetchFeed, fetchTrending]);

  const toggleLike = (id: string) => {
    requireAuth(async () => {
      try {
        const res = await postsApi.like(id);
        setLikedIds(prev => { const s = new Set(prev); res.liked ? s.add(id) : s.delete(id); return s; });
      } catch (_e) { /* ignore */ }
    });
  };
  const toggleSave = (id: string) => {
    requireAuth(async () => {
      try {
        const res = await postsApi.bookmark(id);
        setBookmarkedIds(prev => { const s = new Set(prev); res.bookmarked ? s.add(id) : s.delete(id); return s; });
      } catch (_e) { /* ignore */ }
    });
  };
  const handleShare = () => requireAuth(() => { });
  const handleComment = () => requireAuth(() => { });
  const handleRepost = (id: string) => requireAuth(async () => {
    try { await postsApi.repost(id); } catch (_e) { /* ignore */ }
  });

  const handleComposeFileSelect = (files: FileList | null, fileType?: 'image' | 'video') => {
    if (!files) return;
    const newFiles: UploadedFile[] = [];
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        newFiles.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          file,
          preview: URL.createObjectURL(file),
          type: file.type.startsWith('image/') ? 'image' : 'video',
        });
      }
    });
    setComposeFiles(prev => [...prev, ...newFiles]);
  };

  const removeComposeFile = (id: string) => {
    setComposeFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file) URL.revokeObjectURL(file.preview);
      return prev.filter(f => f.id !== id);
    });
  };

  const handlePost = async () => {
    if (!composeText.trim() && composeFiles.length === 0) return;
    setPostStatus('posting');
    try {
      const newPost = await postsApi.create({ content: composeText, type: showThread ? 'thread' : showPoll ? 'text' : 'text' });
      setApiPosts(prev => [newPost.post, ...prev]);
      setPostStatus('posted');
      setTimeout(() => {
        setComposeText('');
        setComposeFiles([]);
        setShowPoll(false);
        setShowThread(false);
        setThreadPosts([]);
        setPollData({ question: '', options: ['', ''], duration: '1 day' });
        setPostStatus('idle');
      }, 1500);
    } catch (_e) {
      // Fallback: simulate post for demo
      setPostStatus('posted');
      setTimeout(() => { setComposeText(''); setComposeFiles([]); setPostStatus('idle'); }, 1500);
    }
  };

  const addPollOption = () => {
    if (pollData.options.length < 4) {
      setPollData(prev => ({ ...prev, options: [...prev.options, ''] }));
    }
  };

  const removePollOption = (index: number) => {
    if (pollData.options.length > 2) {
      setPollData(prev => ({ ...prev, options: prev.options.filter((_, i) => i !== index) }));
    }
  };

  const updatePollOption = (index: number, value: string) => {
    const newOptions = [...pollData.options];
    newOptions[index] = value;
    setPollData(prev => ({ ...prev, options: newOptions }));
  };

  const addThreadPost = () => {
    setThreadPosts(prev => [...prev, '']);
  };

  const removeThreadPost = (index: number) => {
    setThreadPosts(prev => prev.filter((_, i) => i !== index));
  };

  const updateThreadPost = (index: number, value: string) => {
    const newThreads = [...threadPosts];
    newThreads[index] = value;
    setThreadPosts(newThreads);
  };

  const handleAIAssist = () => {
    if (!composeText.trim()) return;
    setIsAILoading(true);
    // Simulate AI delay
    setTimeout(() => {
      const suggestions = [
        "Based on recent political trends, you might want to highlight the economic impact...",
        "I've refined your draft for better engagement: " + composeText + " #Arizonalex #Politics",
        "Consider adding a call to action or a question to your followers."
      ];
      setComposeText(suggestions[1]);
      setIsAILoading(false);
    }, 1500);
  };

  const handlePolicySave = (data: any) => {
    setComposeText(`📋 POLICY PROPOSAL: ${data.title}\n\n${data.summary}\n\nCategory: #${data.category}`);
    setShowPolicyModal(false);
  };

  const openFileUpload = (accept: string) => {
    if (composeFileRef.current) {
      composeFileRef.current.accept = accept;
      composeFileRef.current.click();
    }
  };

  const tabs = [
    { id: 'foryou', label: 'For You' },
    { id: 'following', label: 'Following' },
    { id: 'politics', label: 'Politics' },
    { id: 'trending', label: 'Trending' },
  ];

  const canPost = composeText.trim() || composeFiles.length > 0;

  return (
    <div className="page-container">
      <div className="feed-column">
        <div className="page-header"><h1>Home</h1></div>
        <div className="tabs">
          {tabs.map(tab => (
            <button key={tab.id} className={`tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>{tab.label}</button>
          ))}
        </div>

        {/* Story Bar */}
        <div className="story-bar">
          <div className="story-item" onClick={() => requireAuth(() => setShowStoryModal(true))} style={{ cursor: 'pointer' }}>
            <div style={{ position: 'relative' }}>
              <UserAvatar name={user?.name || 'You'} avatar={user?.avatar || ''} size="lg" hasStory={false} storyViewed={true} />
              <div className="story-plus-overlay">
                <PlusIcon size={12} />
              </div>
            </div>
            <span className="story-name">Your Story</span>
          </div>
          {apiStories.map(group => (
            <div key={group.author._id} className="story-item">
              <UserAvatar name={group.author.name} avatar={group.author.avatar} size="lg" hasStory={true} storyViewed={false} />
              <span className="story-name">{group.author.name.split(' ')[0]}</span>
            </div>
          ))}
        </div>

        {/* Compose — only visible when logged in */}
        {isLoggedIn ? (
          <div className="compose-box">
            <UserAvatar name={user?.name || 'You'} avatar={user?.avatar || ''} />
            <div className="compose-input">
              <textarea className="compose-textarea" placeholder="What's happening in politics?" value={composeText} onChange={e => setComposeText(e.target.value)} />

              {/* Poll Editor */}
              {showPoll && (
                <div className="poll-editor card" style={{ padding: 12, marginBottom: 10, border: '1px solid var(--primary-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Create Poll</span>
                    <button className="btn btn-icon btn-sm" onClick={() => setShowPoll(false)}><XIcon size={14} /></button>
                  </div>
                  {pollData.options.map((option, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                      <input
                        className="edit-field-input"
                        style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                        placeholder={`Option ${idx + 1}`}
                        value={option}
                        onChange={e => updatePollOption(idx, e.target.value)}
                      />
                      {pollData.options.length > 2 && (
                        <button className="btn btn-icon btn-sm" onClick={() => removePollOption(idx)}><XIcon size={14} /></button>
                      )}
                    </div>
                  ))}
                  {pollData.options.length < 4 && (
                    <button className="btn btn-link btn-sm" style={{ padding: 0 }} onClick={addPollOption}><PlusIcon size={14} /> Add option</button>
                  )}
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Poll Duration</span>
                    <select
                      value={pollData.duration}
                      onChange={e => setPollData(prev => ({ ...prev, duration: e.target.value }))}
                      style={{ fontSize: '0.75rem', padding: '2px 4px', borderRadius: 4, border: '1px solid var(--border)' }}
                    >
                      <option>1 day</option>
                      <option>3 days</option>
                      <option>7 days</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Thread Builder */}
              {showThread && (
                <div className="thread-builder" style={{ marginTop: 10 }}>
                  {threadPosts.map((text, idx) => (
                    <div key={idx} className="thread-item-editor" style={{ display: 'flex', gap: 12, marginBottom: 12, position: 'relative' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <UserAvatar name="Alex Jordan" avatar="/avatars/alex-jordan.png" size="sm" />
                        <div style={{ width: 2, flex: 1, backgroundColor: 'var(--border-light)', margin: '4px 0' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <textarea
                          className="compose-textarea"
                          style={{ minHeight: 60, fontSize: '0.9rem', padding: '8px 0' }}
                          placeholder="Add another post to this thread..."
                          value={text}
                          onChange={e => updateThreadPost(idx, e.target.value)}
                        />
                        <button
                          className="btn btn-icon btn-sm"
                          style={{ position: 'absolute', right: 0, top: 0 }}
                          onClick={() => removeThreadPost(idx)}
                        ><XIcon size={14} /></button>
                      </div>
                    </div>
                  ))}
                  <button className="btn btn-link btn-sm" style={{ padding: 0 }} onClick={addThreadPost}>
                    <PlusIcon size={14} /> Add another post
                  </button>
                </div>
              )}

              {/* Compose media previews */}
              {composeFiles.length > 0 && (
                <div className="upload-preview-grid" style={{ marginBottom: 10 }}>
                  {composeFiles.map(f => (
                    <div key={f.id} className="upload-preview-item">
                      {f.type === 'image' ? (
                        <img src={f.preview} alt="Preview" className="upload-preview-media" />
                      ) : (
                        <video src={f.preview} className="upload-preview-media" />
                      )}
                      <button className="upload-preview-remove" onClick={() => removeComposeFile(f.id)}><XIcon size={14} /></button>
                      <div className="upload-preview-badge">{f.type === 'image' ? '🖼️' : '🎬'} {(f.file.size / (1024 * 1024)).toFixed(1)}MB</div>
                    </div>
                  ))}
                  <button className="upload-add-more" onClick={() => openFileUpload('image/*,video/*')}>
                    <PlusIcon size={20} /><span>Add</span>
                  </button>
                </div>
              )}

              <div className="compose-actions-row">
                <div className="compose-tools">
                  <button className="compose-tool" title="Upload Photo" onClick={() => openFileUpload('image/*')}><ImageIcon size={18} /></button>
                  <button className="compose-tool" title="Upload Video" onClick={() => openFileUpload('video/*')}><VideoIcon size={18} /></button>
                  <button className={`compose-tool ${showPoll ? 'active' : ''}`} title="Poll" onClick={() => setShowPoll(!showPoll)}><BarChartIcon size={18} /></button>
                  <button className={`compose-tool ${showThread ? 'active' : ''}`} title="Thread" onClick={() => {
                    if (!showThread && threadPosts.length === 0) setThreadPosts(['']);
                    setShowThread(!showThread);
                  }}><ThreadIcon size={18} /></button>
                  <button className="compose-tool" title="Propose Policy" onClick={() => setShowPolicyModal(true)}><FileTextIcon size={18} /></button>
                  <button
                    className={`compose-tool ${isAILoading ? 'ai-loading' : ''}`}
                    title="AI Assist"
                    onClick={handleAIAssist}
                    disabled={isAILoading || !composeText.trim()}
                  ><BotIcon size={18} /></button>
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  disabled={!canPost || postStatus !== 'idle'}
                  onClick={handlePost}
                  style={{ minWidth: 70 }}
                >
                  {postStatus === 'posting' ? '⏳...' : postStatus === 'posted' ? '✓ Done!' : 'Post'}
                </button>
              </div>

              <input
                ref={composeFileRef}
                type="file"
                accept="image/*,video/*"
                multiple
                style={{ display: 'none' }}
                onChange={e => { handleComposeFileSelect(e.target.files); e.target.value = ''; }}
              />
            </div>
          </div>
        ) : (
          <div className="guest-cta-card" onClick={() => requireAuth(() => { })}>
            <div className="guest-cta-glow" />
            <div className="guest-cta-content">
              <div className="guest-cta-left">
                <div className="guest-cta-icon-ring">
                  <ZapIcon size={22} />
                </div>
                <div>
                  <div className="guest-cta-headline">Your voice matters in politics</div>
                  <div className="guest-cta-sub">Join thousands shaping the future. Share your thoughts, follow leaders, make an impact.</div>
                </div>
              </div>
              <div className="guest-cta-actions">
                <Link href="/login" className="guest-cta-btn-primary" onClick={(e) => e.stopPropagation()}>Sign in</Link>
                <Link href="/register" className="guest-cta-btn-secondary" onClick={(e) => e.stopPropagation()}>Create account</Link>
              </div>
            </div>
          </div>
        )}

        {/* Posts — always visible, but action buttons gated */}
        {apiPosts.map(post => (
          <article key={post._id} className="post-card fade-in">
            <div className="post-header">
              <Link href={`/profile/${post.author.username}`}><UserAvatar name={post.author.name} avatar={post.author.avatar} /></Link>
              <div className="post-meta">
                <div className="post-author-row">
                  <Link href={`/profile/${post.author.username}`} className="post-author">{post.author.name}</Link>
                  {post.author.verified && <VerifiedIcon size={15} />}
                  <Link href={`/profile/${post.author.username}`} className="post-handle">@{post.author.username}</Link>
                  <span className="post-time">{timeAgo(post.createdAt)}</span>
                </div>
                {post.author.party && <span className="role-badge role-politician">{post.author.party}</span>}
                {post.type === 'policy' && <span className="post-type-badge badge-policy"><FileTextIcon size={11} /> Policy</span>}
                {post.type === 'thread' && <span className="post-type-badge badge-thread"><ThreadIcon size={11} /> Thread</span>}
              </div>
            </div>
            <PostContent content={post.content} />
            <div className="post-actions">
              <button className={`post-action ${!isLoggedIn ? 'action-locked' : ''}`} onClick={handleComment} title={isLoggedIn ? 'Comment' : 'Sign in to comment'}>
                <span className="action-icon"><MessageCircleIcon size={17} /></span><span>{formatNumber(post.commentsCount)}</span>
              </button>
              <button className={`post-action ${!isLoggedIn ? 'action-locked' : ''}`} onClick={() => handleRepost(post._id)} title={isLoggedIn ? 'Repost' : 'Sign in to repost'}>
                <span className="action-icon"><RepeatIcon size={17} /></span><span>{formatNumber(post.repostsCount)}</span>
              </button>
              <button className={`post-action ${!isLoggedIn ? 'action-locked' : ''} ${likedIds.has(post._id) ? 'liked' : ''}`} onClick={() => toggleLike(post._id)} title={isLoggedIn ? 'Like' : 'Sign in to like'}>
                <span className="action-icon">{likedIds.has(post._id) ? <HeartFilledIcon size={17} /> : <HeartIcon size={17} />}</span>
                <span>{formatNumber(post.likesCount + (likedIds.has(post._id) ? 1 : 0))}</span>
              </button>
              <button className={`post-action ${!isLoggedIn ? 'action-locked' : ''} ${bookmarkedIds.has(post._id) ? 'bookmarked' : ''}`} onClick={() => toggleSave(post._id)} title={isLoggedIn ? 'Bookmark' : 'Sign in to bookmark'}>
                <span className="action-icon"><BookmarkIcon size={17} /></span>
              </button>
              <button className={`post-action ${!isLoggedIn ? 'action-locked' : ''}`} onClick={handleShare} title={isLoggedIn ? 'Share' : 'Sign in to share'}>
                <span className="action-icon"><ShareIcon size={17} /></span>
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* Right Panel */}
      <div className="right-panel">
        <div className="search-box" style={{ marginBottom: 20 }}>
          <span className="search-icon"><SearchIcon size={16} /></span>
          <input type="text" placeholder="Search Arizonalex" />
        </div>
        <div className="card" style={{ padding: 16, marginBottom: 16 }}>
          <h3 className="section-title"><TrendingUpIcon size={18} /> Trending</h3>
          {trendingData.slice(0, 5).map((t, i) => (
            <Link key={i} href={`/explore?q=%23${t.tag}`} className="trending-item" style={{ textDecoration: 'none', display: 'block' }}>
              <div className="trending-category">{t.category}</div>
              <div className="trending-tag">#{t.tag}</div>
              <div className="trending-count">{formatNumber(t.posts)} posts</div>
            </Link>
          ))}
        </div>
        <div className="card" style={{ padding: 16 }}>
          <h3 className="section-title"><UsersIcon size={18} /> Who to Follow</h3>
          {users.slice(0, 4).map(user => (
            <div key={user.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
              <Link href={`/profile/${user.username}`}><UserAvatar name={user.name} avatar={user.avatar} size="sm" /></Link>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Link href={`/profile/${user.username}`} style={{ fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 4, color: 'inherit', textDecoration: 'none' }}>
                  {user.name} {user.verified && <VerifiedIcon size={13} />}
                </Link>
                <Link href={`/profile/${user.username}`} style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textDecoration: 'none' }}>@{user.username}</Link>
              </div>
              <button className="btn btn-outline btn-sm" onClick={() => requireAuth(() => { })}>Follow</button>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}

      {showStoryModal && <StoryUploadModal onClose={() => setShowStoryModal(false)} />}
      {showPolicyModal && <PolicyModal onClose={() => setShowPolicyModal(false)} onSave={handlePolicySave} />}
    </div>
  );
}

function UsersIcon({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
}
