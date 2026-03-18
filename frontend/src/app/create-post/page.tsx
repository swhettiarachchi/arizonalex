'use client';
import { useState, useRef, DragEvent } from 'react';
import Link from 'next/link';
import { XIcon, ImageIcon, VideoIcon, FileTextIcon, BotIcon, ClockIcon, MapPinIcon, HashIcon, PlusIcon } from '@/components/ui/Icons';
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
    const fileInputRef = useRef<HTMLInputElement>(null);

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
        // Auto-switch to image/video tab based on what was uploaded
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
                body: JSON.stringify({ content, type: postType }),
            });
            const data = await res.json();
            if (data.post || res.ok) {
                setPublishStatus('published');
                setTimeout(() => {
                    setContent('');
                    setUploadedFiles([]);
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
                            {publishStatus === 'publishing' ? '⏳ Posting...' : publishStatus === 'published' ? '✓ Posted!' : 'Publish'}
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
                                    <div className="upload-preview-badge">
                                        {f.type === 'image' ? '🖼️' : '🎬'} {(f.file.size / (1024 * 1024)).toFixed(1)}MB
                                    </div>
                                </div>
                            ))}
                            {/* Add more button */}
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
                            <div className="form-group"><label className="form-label">Policy Title</label><input className="form-input" placeholder="e.g., Digital Privacy Act 2026" /></div>
                            <div className="form-group"><label className="form-label">Category</label><select className="form-input" style={{ background: 'var(--bg-tertiary)' }}><option>Healthcare</option><option>Education</option><option>Economy</option><option>Environment</option><option>Infrastructure</option><option>Security</option></select></div>
                        </div>
                    )}

                    {/* Tools bar */}
                    <div className="upload-tools-bar">
                        <button className="compose-tool" onClick={() => { setPostType('image'); fileInputRef.current?.click(); }} title="Add Photo" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><ImageIcon size={16} /> Photo</button>
                        <button className="compose-tool" onClick={() => { setPostType('video'); fileInputRef.current?.click(); }} title="Add Video" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><VideoIcon size={16} /> Video</button>
                        <button className="compose-tool" title="AI Assist" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><BotIcon size={16} /> AI Assist</button>
                        <button className="compose-tool" title="Schedule" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><ClockIcon size={16} /> Schedule</button>
                        <button className="compose-tool" title="Location" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPinIcon size={16} /> Location</button>
                        <button className="compose-tool" title="Hashtag" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><HashIcon size={16} /> Hashtag</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
