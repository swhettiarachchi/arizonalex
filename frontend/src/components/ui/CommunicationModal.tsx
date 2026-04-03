'use client';

import { useEffect, useRef, useState } from 'react';
import { User } from '@/lib/types';
import { PhoneIcon, VideoIcon, MailIcon } from '@/components/ui/Icons';
import { useAuth } from '@/components/providers/AuthProvider';
import { fetchAgoraToken } from '@/lib/agora';

const APP_ID = "694407d9da4045e5b65bb26ee75e7dce"; // Replace with your actual App ID

export interface CommunicationModalProps {
  user: User;
  type: 'message' | 'call' | 'video';
  onClose: () => void;
}

export function CommunicationModal({ user, type, onClose }: CommunicationModalProps) {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'error' | 'ended'>('connecting');
  const localVideoRef = useRef<HTMLDivElement>(null);
  const localAudioTrackRef = useRef<any>(null);
  const localVideoTrackRef = useRef<any>(null);
  const clientRef = useRef<any>(null);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const callStartTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (status === 'connected' && (type === 'call' || type === 'video')) {
      if (!callStartTimeRef.current) {
        callStartTimeRef.current = Date.now();
      }
    }
  }, [status, type]);

  const handleClose = () => {
    if (callStartTimeRef.current) {
      const durationMs = Date.now() - callStartTimeRef.current;
      const durationSec = Math.floor(durationMs / 1000);
      const mins = Math.floor(durationSec / 60);
      const secs = durationSec % 60;
      const durationStr = `${mins > 0 ? `${mins}m ` : ''}${secs}s`;
      
      const callType = type === 'video' ? 'Video Call' : 'Voice Call';
      const logData = JSON.stringify({
          isCallLog: true,
          callType,
          duration: durationStr
      });

      const participantId = (user as any)._id || user.id;
      fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ participantId, username: user.username, content: `[SYSTEM_CALL_LOG]:${logData}` })
      }).catch(console.error);
      
      callStartTimeRef.current = null;
    }
    onClose();
  };

  const handleSendMessage = async () => {
    if (!message.trim() || isSending) return;
    setIsSending(true);
    try {
      const participantId = (user as any)._id || user.id;
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId, username: user.username, content: message })
      });
      if (res.ok) {
        setMessage('');
        setSendSuccess(true);
        setTimeout(() => onClose(), 1500);
      } else {
        console.error('Failed to send message');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    if (type !== 'call' && type !== 'video') return;

    let isMounted = true;

    const initAgora = async () => {
      try {
        const mod = await import('agora-rtc-sdk-ng');
        const AgoraRTC = mod.default || mod;

        // Silence Agora's internal console warnings/errors so they don't trigger the Next.js dev overlay
        AgoraRTC.setLogLevel(4);

        const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
        clientRef.current = client;

        const channelName = `channel-${user.id}-${Date.now()}`;
        
        // Fetch token from backend
        let token = null;
        try {
          // Use 0 for auto-assigned UID
          const tokenData = await fetchAgoraToken(channelName, 0, 'publisher');
          token = tokenData.token;
        } catch (tokenErr) {
          console.error("Failed to fetch token, falling back to null (for local dev)", tokenErr);
        }

        if (!isMounted) return;

        // Connect with the fetched token
        await client.join(APP_ID, channelName, token, null);

        if (!isMounted) return;

        // Check available devices before attempting to create tracks to prevent Agora's internal console errors
        const devices = await AgoraRTC.getDevices();
        const hasMicrophone = devices.some(device => device.kind === 'audioinput');
        const hasCamera = devices.some(device => device.kind === 'videoinput');

        let audioTrack = null;
        if (hasMicrophone) {
          try {
            audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
            localAudioTrackRef.current = audioTrack;
          } catch (err) {
            console.warn('Microphone permission denied. Proceeding without audio.', err);
          }
        } else {
          console.warn('No microphone device found on system.');
        }

        if (!isMounted) return;
        
        const tracks = [];
        if (audioTrack) tracks.push(audioTrack);

        if (type === 'video') {
          if (hasCamera) {
            try {
              const videoTrack = await AgoraRTC.createCameraVideoTrack();
              localVideoTrackRef.current = videoTrack;
              if (!isMounted) return;
              
              tracks.push(videoTrack);
              if (localVideoRef.current) {
                videoTrack.play(localVideoRef.current);
              }
            } catch (err) {
              console.warn('Camera permission denied. Proceeding without video.', err);
            }
          } else {
            console.warn('No camera device found on system.');
          }
        }

        if (!isMounted) return;

        if (tracks.length > 0) {
          await client.publish(tracks);
        } else {
          console.warn('Joined channel, but no media hardware was available to publish.');
        }
        
        if (isMounted) setStatus('connected');
      } catch (error) {
        if (!isMounted) {
          // Ignore errors caused by cleanup/unmount in StrictMode
          return;
        }
        console.error('Agora Init Error:', error);
        if (isMounted) setStatus('error');
      }
    };

    initAgora();

    return () => {
      isMounted = false;
      const cleanup = async () => {
        if (localAudioTrackRef.current) {
          localAudioTrackRef.current.stop();
          localAudioTrackRef.current.close();
        }
        if (localVideoTrackRef.current) {
          localVideoTrackRef.current.stop();
          localVideoTrackRef.current.close();
        }
        if (clientRef.current) {
          await clientRef.current.leave();
        }
      };
      
      cleanup().catch(console.error);
    };
  }, [type, user.id]);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: 'var(--bg-primary)', borderRadius: 16, width: '100%', maxWidth: 500,
        overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        display: 'flex', flexDirection: 'column',
        border: '1px solid var(--border-light)'
      }}>
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {type === 'message' && <MailIcon size={16} />}
              {type === 'call' && <PhoneIcon size={16} />}
              {type === 'video' && <VideoIcon size={16} />}
            </div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>
              {type === 'message' ? `Message ${user.name}` : type === 'call' ? `Voice Call` : `Video Call`}
            </h3>
          </div>
          <button onClick={handleClose} style={{ background: 'var(--bg-secondary)', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background-color 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--border-light)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}>
            <span style={{ fontSize: '1.2rem', lineHeight: 1, marginTop: -2 }}>&times;</span>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column' }}>
          {type === 'message' ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, height: 360 }}>
              <div style={{ flex: 1, background: 'var(--bg-secondary)', borderRadius: 12, padding: 16, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                <p style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.82rem', marginTop: 'auto', marginBottom: 'auto' }}>
                  This is the beginning of your message history with {user.name}.
                </p>
              </div>
              {sendSuccess ? (
                <div style={{ padding: '12px', textAlign: 'center', color: 'var(--accent-emerald)', fontWeight: 600 }}>
                  Message sent successfully!
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 10 }}>
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    style={{
                      flex: 1, padding: '12px 16px', borderRadius: 24,
                      border: '1px solid var(--border-light)', background: 'var(--bg-secondary)',
                      color: 'var(--text-primary)', outline: 'none', fontSize: '0.95rem'
                    }}
                    onKeyDown={e => {
                        if(e.key === 'Enter') handleSendMessage();
                    }}
                    disabled={isSending}
                  />
                  <button className="btn btn-primary" style={{ borderRadius: 24, padding: '0 20px', fontWeight: 600 }} onClick={handleSendMessage} disabled={isSending}>
                    {isSending ? '...' : 'Send'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 400 }}>
                {type === 'video' && (
                    <div style={{ width: '100%', height: 320, background: '#111', borderRadius: 12, overflow: 'hidden', marginBottom: 20, position: 'relative', border: '1px solid var(--border-light)' }}>
                        <div ref={localVideoRef} style={{ width: '100%', height: '100%' }} />
                        {status === 'connecting' && (
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', background: 'rgba(0,0,0,0.6)', gap: 10 }}>
                                <div className="spinner" style={{ width: 24, height: 24, border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                                <span>Connecting to camera...</span>
                                <style>{`
                                  @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                                `}</style>
                            </div>
                        )}
                        {status === 'error' && (
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', background: 'rgba(0,0,0,0.8)', gap: 10 }}>
                                <span style={{ color: '#ef4444' }}>Camera access denied or device not found.</span>
                            </div>
                        )}
                    </div>
                )}

                {type === 'call' && (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ 
                        width: 120, height: 120, borderRadius: '50%', background: 'rgba(59,130,246,0.1)', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        marginBottom: 24, position: 'relative'
                      }}>
                          <div style={{ width: 90, height: 90, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(59,130,246,0.4)', zIndex: 2 }}>
                              <img src={user.avatar} alt={user.name} style={{ width: 86, height: 86, borderRadius: '50%', objectFit: 'cover' }} />
                          </div>
                          {status === 'connecting' && (
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: '50%', border: '2px solid var(--primary)', animation: 'pulse-ring 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite' }} />
                          )}
                      </div>
                      <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>{user.name}</h4>
                      <p style={{ margin: '8px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                          {status === 'connecting' ? 'Connecting...' : status === 'connected' ? 'Call in progress 00:00' : status === 'error' ? 'Microphone access denied' : 'Call ended'}
                      </p>
                      <style>{`
                        @keyframes pulse-ring { 0% { transform: scale(0.8); opacity: 0.5; } 100% { transform: scale(1.3); opacity: 0; } }
                      `}</style>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 16, marginTop: 'auto', paddingBottom: type === 'call' ? 20 : 0 }}>
                    <button onClick={handleClose} style={{
                        width: 64, height: 64, borderRadius: '50%', background: '#ef4444',
                        border: 'none', color: '#fff', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', cursor: 'pointer', boxShadow: '0 8px 16px rgba(239,68,68,0.3)',
                        transition: 'transform 0.2s, background-color 0.2s'
                    }} onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.backgroundColor = '#dc2626'; }} onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.backgroundColor = '#ef4444'; }}>
                        <span style={{ transform: 'rotate(135deg)', display: 'inline-flex' }}>
                            <PhoneIcon size={26} />
                        </span>
                    </button>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
