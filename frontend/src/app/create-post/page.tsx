'use client';
import { useState, useRef, DragEvent } from 'react';
import Link from 'next/link';
import { XIcon, ImageIcon, VideoIcon, FileTextIcon, BotIcon, ClockIcon, MapPinIcon, HashIcon, PlusIcon, ZapIcon, CpuIcon } from '@/components/ui/Icons';
import { useAuthGate } from '@/components/providers/AuthGuard';

interface UploadedFile {
    id: string;
    file: File;
    preview: string;
    type: 'image' | 'video';
}

export default function CreatePostPage() {
    const { requireAuth } = useAuthGate();
    const [postType, setPostType] = useState('text');
    const [content, setContent] = useState('');
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [publishStatus, setPublishStatus] = useState<'idle' | 'publishing' | 'published'>('idle');
    const [policyTitle, setPolicyTitle] = useState('');
    const [policyCategory, setPolicyCategory] = useState('Economy');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // AI Assist state
    const [showAI, setShowAI] = useState(false);
    const [aiMode, setAiMode] = useState<'enhance' | 'generate' | 'hashtag'>('enhance');
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState('');

    const types = [
        { id: 'text', label: 'Text' },
        { id: 'image', label: 'Image' },
        { id: 'video', label: 'Video' },
        { id: 'thread', label: 'Thread' },
        { id: 'policy', label: 'Policy' },
    ];

    const handleFileSelect = (files: FileList | null) => {
        if (!files) return;
        const newFiles: UploadedFile[] = [];
        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
                const preview = URL.createObjectURL(file);
                newFiles.push({
                    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
                    file,
                    preview,
                    type: file.type.startsWith('image/') ? 'image' : 'video',
                });
            }
        });
        setUploadedFiles(prev => [...prev, ...newFiles]);
        if (newFiles.length > 0 && postType === 'text') {
            setPostType(newFiles[0].type);
        }
    };

    const removeFile = (id: string) => {
        setUploadedFiles(prev => {
            const file = prev.find(f => f.id === id);
            if (file) URL.revokeObjectURL(file.preview);
            return prev.filter(f => f.id !== id);
        });
    };

    const handleDragOver = (e: DragEvent) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = (e: DragEvent) => { e.preventDefault(); setIsDragging(false); };
    const handleDrop = (e: DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileSelect(e.dataTransfer.files);
    };

    const handlePublish = async () => {
        setPublishStatus('publishing');
        try {
            const res = await fetch('/api/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, type: postType, policyTitle, policyCategory }),
            });
            const data = await res.json();
            if (data.post || res.ok) {
                setPublishStatus('published');
                setTimeout(() => {
                    setContent('');
                    setUploadedFiles([]);
                    setPolicyTitle('');
                    setPolicyCategory('Economy');
                    setPublishStatus('idle');
                    setPostType('text');
                }, 1500);
            } else {
                setPublishStatus('idle');
            }
        } catch {
            setPublishStatus('idle');
        }
    };

    // ── AI Assist Handlers ──
    const handleAIAssist = async () => {
        setAiError('');
        setAiLoading(true);

        let toolId = 'post';
        let inputText = '';

        if (aiMode === 'enhance') {
            if (!content.trim()) { setAiError('Write something first, then enhance it with AI'); setAiLoading(false); return; }
            toolId = 'post';
            inputText = `Enhance and improve this post while keeping the same message. Make it more engaging and professional. Add relevant hashtags. Original post: "${content}"`;
        } else if (aiMode === 'generate') {
            if (!aiPrompt.trim()) { setAiError('Describe what you want the post to be about'); setAiLoading(false); return; }
            toolId = 'post';
            inputText = aiPrompt;
        } else if (aiMode === 'hashtag') {
            if (!content.trim()) { setAiError('Write your post first, then generate hashtags'); setAiLoading(false); return; }
            toolId = 'caption';
            inputText = `Generate 8-10 relevant, trending hashtags for this post (hashtags only, no other text): "${content}"`;
        }

        try {
            const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ toolId, input: inputText }),
            });
            const data = await res.json();
            if (data.success && data.output) {
                if (aiMode === 'hashtag') {
                    // Append hashtags to existing content
                    setContent(prev => prev.trim() + '\n\n' + data.output.trim());
                } else {
                    setContent(data.output.trim());
                }
                setShowAI(false);
                setAiPrompt('');
            } else {
                setAiError(data.message || data.error || 'AI generation failed');
            }
        } catch {
            setAiError('Failed to connect to AI. Please try again.');
        }
        setAiLoading(false);
    };

    const acceptTypes = postType === 'video' ? 'video/*' : postType === 'image' ? 'image/*' : 'image/*,video/*';
    const canPublish = content.trim() || uploadedFiles.length > 0;

    return (
        <div className="page-container">
            <div className="feed-column">
                <div className="page-header">
                    <div className="page-header-row">
                        <Link href="/" className="btn btn-icon"><XIcon size={18} /></Link>
                        <h1>Create Post</h1>
                        <button
                            className="btn btn-primary btn-sm"
                            disabled={!canPublish || publishStatus !== 'idle'}
                            onClick={() => requireAuth(handlePublish)}
                            style={{ minWidth: 80 }}
                        >
                            {publishStatus === 'publishing' ? 'Posting...' : publishStatus === 'published' ? 'Posted!' : 'Publish'}
                        </button>
                    </div>
                </div>
                <div className="tabs">
                    {types.map(t => (<button key={t.id} className={`tab ${postType === t.id ? 'active' : ''}`} onClick={() => setPostType(t.id)}>{t.label}</button>))}
                </div>
                <div style={{ padding: 16 }}>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <div className="avatar avatar-md" style={{ fontSize: '0.8rem', fontWeight: 700 }}>AJ</div>
                        <div style={{ flex: 1 }}>
                            <textarea
                                className="compose-textarea"
                                style={{ minHeight: 120, fontSize: '1.05rem' }}
                                placeholder={postType === 'policy' ? 'Write your policy proposal...' : postType === 'thread' ? 'Start your thread...' : "What's happening in politics?"}
                                value={content}
                                onChange={e => setContent(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* AI Assist Panel */}
                    {showAI && (
                        <div className="fade-in" style={{ marginTop: 12, padding: 16, borderRadius: 12, background: 'var(--bg-secondary)', border: '1px solid rgba(139,92,246,0.2)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                                    <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><BotIcon size={14} /></div>
                                    AI Assist
                                    <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>Powered by Groq AI</span>
                                </div>
                                <button onClick={() => { setShowAI(false); setAiError(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}><XIcon size={16} /></button>
                            </div>

                            {/* AI Mode tabs */}
                            <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                                {[
                                    { id: 'enhance' as const, label: '✨ Enhance Post', desc: 'Improve your existing text' },
                                    { id: 'generate' as const, label: '🤖 Generate Post', desc: 'Create from a topic' },
                                    { id: 'hashtag' as const, label: '#️⃣ Auto Hashtags', desc: 'Add relevant hashtags' },
                                ].map(m => (
                                    <button key={m.id} onClick={() => { setAiMode(m.id); setAiError(''); }}
                                        style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: `1px solid ${aiMode === m.id ? 'rgba(139,92,246,0.4)' : 'var(--border-light)'}`, background: aiMode === m.id ? 'rgba(139,92,246,0.1)' : 'transparent', cursor: 'pointer', textAlign: 'left' }}>
                                        <div style={{ fontSize: '0.78rem', fontWeight: aiMode === m.id ? 700 : 500, color: aiMode === m.id ? '#a78bfa' : 'var(--text-primary)' }}>{m.label}</div>
                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: 2 }}>{m.desc}</div>
                                    </button>
                                ))}
                            </div>

                            {/* Generate mode needs a topic input */}
                            {aiMode === 'generate' && (
                                <input
                                    type="text"
                                    placeholder="Describe your post topic, e.g. 'Rise of Bitcoin to $100K'"
                                    value={aiPrompt}
                                    onChange={e => setAiPrompt(e.target.value)}
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.85rem', marginBottom: 10, outline: 'none' }}
                                />
                            )}

                            {aiError && (
                                <div style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: '0.78rem', marginBottom: 10 }}>{aiError}</div>
                            )}

                            <button onClick={() => requireAuth(handleAIAssist)} disabled={aiLoading}
                                style={{ padding: '8px 20px', borderRadius: 8, background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', color: '#fff', border: 'none', fontSize: '0.82rem', fontWeight: 600, cursor: aiLoading ? 'wait' : 'pointer', opacity: aiLoading ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: 6 }}>
                                {aiLoading ? <><span className="auth-spinner" style={{ width: 14, height: 14 }} /> Generating...</> : <><ZapIcon size={14} /> {aiMode === 'enhance' ? 'Enhance with AI' : aiMode === 'generate' ? 'Generate Post' : 'Generate Hashtags'}</>}
                            </button>
                        </div>
                    )}

                    {/* Uploaded file previews */}
                    {uploadedFiles.length > 0 && (
                        <div className="upload-preview-grid" style={{ marginTop: 12 }}>
                            {uploadedFiles.map(f => (
                                <div key={f.id} className="upload-preview-item">
                                    {f.type === 'image' ? (
                                        <img src={f.preview} alt="Upload preview" className="upload-preview-media" />
                                    ) : (
                                        <video src={f.preview} className="upload-preview-media" controls />
                                    )}
                                    <button
                                        className="upload-preview-remove"
                                        onClick={() => removeFile(f.id)}
                                        aria-label="Remove"
                                    >
                                        <XIcon size={14} />
                                    </button>
                                    <div className="upload-preview-badge" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                        {f.type === 'image' ? <ImageIcon size={12} /> : <VideoIcon size={12} />} {(f.file.size / (1024 * 1024)).toFixed(1)}MB
                                    </div>
                                </div>
                            ))}
                            <button
                                className="upload-add-more"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <PlusIcon size={24} />
                                <span>Add</span>
                            </button>
                        </div>
                    )}

                    {/* Upload drop zone */}
                    {(postType === 'image' || postType === 'video' || postType === 'text') && uploadedFiles.length === 0 && (
                        <div
                            className={`upload-dropzone ${isDragging ? 'upload-dropzone-active' : ''}`}
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <div className="upload-dropzone-icon">
                                {postType === 'video' ? <VideoIcon size={36} /> : <ImageIcon size={36} />}
                            </div>
                            <div className="upload-dropzone-title">
                                {isDragging ? 'Drop files here' : `Click to upload ${postType === 'text' ? 'photos or videos' : postType === 'video' ? 'videos' : 'photos'}`}
                            </div>
                            <div className="upload-dropzone-subtitle">
                                or drag and drop • {postType === 'video' ? 'MP4, MOV, WebM up to 100MB' : 'JPG, PNG, GIF, WebP up to 10MB'}
                            </div>
                        </div>
                    )}

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={acceptTypes}
                        multiple
                        style={{ display: 'none' }}
                        onChange={e => { handleFileSelect(e.target.files); e.target.value = ''; }}
                    />

                    {postType === 'policy' && (
                        <div className="card" style={{ padding: 16, marginTop: 16 }}>
                            <div className="form-group"><label className="form-label">Policy Title</label><input className="form-input" placeholder="e.g., Digital Privacy Act 2026" value={policyTitle} onChange={e => setPolicyTitle(e.target.value)} /></div>
                            <div className="form-group">
                                <label className="form-label">Category</label>
                                <input className="form-input" list="policy-categories-create" style={{ background: 'var(--bg-tertiary)' }} placeholder="Select or type a category..." value={policyCategory} onChange={e => setPolicyCategory(e.target.value)} />
                                <datalist id="policy-categories-create">
                                    <option value="Healthcare" />
                                    <option value="Education" />
                                    <option value="Economy" />
                                    <option value="Environment" />
                                    <option value="Infrastructure" />
                                    <option value="Security" />
                                    <option value="Technology" />
                                    <option value="Foreign Policy" />
                                    <option value="Civil Rights" />
                                    <option value="Transportation" />
                                    <option value="Housing" />
                                    <option value="Web3/Crypto" />
                                </datalist>
                            </div>
                        </div>
                    )}

                    {/* Tools bar */}
                    <div className="upload-tools-bar">
                        <button className="compose-tool" onClick={() => { setPostType('image'); fileInputRef.current?.click(); }} title="Add Photo" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><ImageIcon size={16} /> Photo</button>
                        <button className="compose-tool" onClick={() => { setPostType('video'); fileInputRef.current?.click(); }} title="Add Video" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><VideoIcon size={16} /> Video</button>
                        <button className="compose-tool" onClick={() => requireAuth(() => setShowAI(!showAI))} title="AI Assist" style={{ display: 'flex', alignItems: 'center', gap: 4, color: showAI ? '#a78bfa' : undefined, fontWeight: showAI ? 700 : undefined }}><BotIcon size={16} /> AI Assist</button>
                        <button className="compose-tool" title="Schedule" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><ClockIcon size={16} /> Schedule</button>
                        <button className="compose-tool" title="Location" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPinIcon size={16} /> Location</button>
                        <button className="compose-tool" title="Hashtag" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><HashIcon size={16} /> Hashtag</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
