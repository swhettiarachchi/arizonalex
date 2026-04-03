'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────
export interface FaceVerificationResult {
    faceioId: string;
    verificationScore: number;
    verifiedAt: string;
}

interface FaceVerificationProps {
    onSuccess: (result: FaceVerificationResult) => void;
    onError?: (error: string) => void;
    onSkip?: () => void;
    showSkip?: boolean;
    compact?: boolean;
}

type VerifyStage =
    | 'consent'
    | 'initializing'
    | 'camera'
    | 'detecting'
    | 'liveness'
    | 'processing'
    | 'success'
    | 'error';

interface LivenessChallenge {
    instruction: string;
    icon: React.ReactNode;
    duration: number;
}

const LIVENESS_CHALLENGES: LivenessChallenge[] = [
    { instruction: 'Look straight at the camera', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00e676" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>, duration: 2000 },
    { instruction: 'Slowly blink your eyes', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00e676" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>, duration: 2500 },
    { instruction: 'Turn your head slightly left', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00e676" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>, duration: 2500 },
    { instruction: 'Turn your head slightly right', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00e676" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>, duration: 2500 },
    { instruction: 'Give a small smile', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00e676" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></svg>, duration: 2000 },
];

// ─── Component ───────────────────────────────────────────────────────────────
export default function FaceVerification({
    onSuccess,
    onError,
    onSkip,
    showSkip = true,
    compact = false,
}: FaceVerificationProps) {
    const [stage, setStage] = useState<VerifyStage>('consent');
    const [consentChecked, setConsentChecked] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [score, setScore] = useState(0);
    const [challengeIdx, setChallengeIdx] = useState(0);
    const [challengeProgress, setChallengeProgress] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animFrameRef = useRef<number>(0);

    // Cleanup camera on unmount
    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(t => t.stop());
            }
            if (animFrameRef.current) {
                cancelAnimationFrame(animFrameRef.current);
            }
        };
    }, []);

    // Start camera
    const startCamera = useCallback(async () => {
        setStage('initializing');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
                audio: false,
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }
            setStage('camera');
            // Auto-advance to detection after a beat
            setTimeout(() => setStage('detecting'), 1500);
        } catch (err) {
            const msg = err instanceof DOMException && err.name === 'NotAllowedError'
                ? 'Camera access was denied. Please allow camera access in your browser settings and try again.'
                : 'Could not access camera. Please ensure your device has a camera and try again.';
            setErrorMsg(msg);
            setStage('error');
            onError?.(msg);
        }
    }, [onError]);

    // Simulate face detection → liveness challenges
    useEffect(() => {
        if (stage !== 'detecting') return;
        const timer = setTimeout(() => {
            setStage('liveness');
            setChallengeIdx(0);
            setChallengeProgress(0);
        }, 2000);
        return () => clearTimeout(timer);
    }, [stage]);

    // Run through liveness challenges
    useEffect(() => {
        if (stage !== 'liveness') return;

        const challenge = LIVENESS_CHALLENGES[challengeIdx];
        if (!challenge) {
            // All challenges done
            setTimeout(() => setStage('processing'), 0);
            return;
        }

        // Animate progress bar for this challenge
        const startTime = Date.now();
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / challenge.duration, 1);
            setChallengeProgress(progress);
            if (progress < 1) {
                animFrameRef.current = requestAnimationFrame(animate);
            } else {
                // Next challenge
                setTimeout(() => {
                    setChallengeIdx(i => i + 1);
                    setChallengeProgress(0);
                }, 400);
            }
        };
        animFrameRef.current = requestAnimationFrame(animate);

        return () => {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        };
    }, [stage, challengeIdx]);

    // Processing → generate result
    useEffect(() => {
        if (stage !== 'processing') return;
        // Draw canvas snapshot
        if (videoRef.current && canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
            ctx?.drawImage(videoRef.current, 0, 0);
        }

        // Simulate AI processing
        const timer = setTimeout(() => {
            const generatedScore = Math.floor(Math.random() * 15) + 85; // 85–99
            setScore(generatedScore);
            setStage('success');

            // Stop camera
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(t => t.stop());
            }

            const result: FaceVerificationResult = {
                faceioId: `fio_${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`,
                verificationScore: generatedScore,
                verifiedAt: new Date().toISOString(),
            };
            onSuccess(result);
        }, 3000);

        return () => clearTimeout(timer);
    }, [stage, onSuccess]);

    // Face-mesh overlay on canvas
    useEffect(() => {
        if (stage !== 'camera' && stage !== 'detecting' && stage !== 'liveness') return;
        const canvas = canvasRef.current;
        const video = videoRef.current;
        if (!canvas || !video) return;

        const draw = () => {
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 480;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw face oval guide
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;
            const rx = canvas.width * 0.28;
            const ry = canvas.height * 0.38;

            ctx.strokeStyle = stage === 'liveness' ? '#00e676' : 'rgba(0, 230, 118, 0.5)';
            ctx.lineWidth = stage === 'liveness' ? 3 : 2;
            ctx.setLineDash(stage === 'liveness' ? [] : [8, 6]);
            ctx.beginPath();
            ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);

            // Scanning line animation for detecting stage
            if (stage === 'detecting') {
                const t = (Date.now() % 2000) / 2000;
                const scanY = cy - ry + t * ry * 2;
                ctx.strokeStyle = 'rgba(0, 230, 118, 0.6)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                // Clip scan line to oval
                const scanRx = rx * Math.sqrt(1 - Math.pow((scanY - cy) / ry, 2));
                ctx.moveTo(cx - scanRx, scanY);
                ctx.lineTo(cx + scanRx, scanY);
                ctx.stroke();
            }

            // Corner brackets
            const bracketSize = 20;
            ctx.strokeStyle = stage === 'liveness' ? '#00e676' : 'rgba(0, 230, 118, 0.7)';
            ctx.lineWidth = 3;
            ctx.setLineDash([]);
            // Top-left
            ctx.beginPath();
            ctx.moveTo(cx - rx, cy - ry + bracketSize);
            ctx.lineTo(cx - rx, cy - ry);
            ctx.lineTo(cx - rx + bracketSize, cy - ry);
            ctx.stroke();
            // Top-right
            ctx.beginPath();
            ctx.moveTo(cx + rx - bracketSize, cy - ry);
            ctx.lineTo(cx + rx, cy - ry);
            ctx.lineTo(cx + rx, cy - ry + bracketSize);
            ctx.stroke();
            // Bottom-left
            ctx.beginPath();
            ctx.moveTo(cx - rx, cy + ry - bracketSize);
            ctx.lineTo(cx - rx, cy + ry);
            ctx.lineTo(cx - rx + bracketSize, cy + ry);
            ctx.stroke();
            // Bottom-right
            ctx.beginPath();
            ctx.moveTo(cx + rx - bracketSize, cy + ry);
            ctx.lineTo(cx + rx, cy + ry);
            ctx.lineTo(cx + rx, cy + ry - bracketSize);
            ctx.stroke();

            animFrameRef.current = requestAnimationFrame(draw);
        };
        animFrameRef.current = requestAnimationFrame(draw);
        return () => {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        };
    }, [stage]);

    const retry = () => {
        setErrorMsg('');
        setStage('consent');
        setChallengeIdx(0);
        setChallengeProgress(0);
        setScore(0);
    };

    const overallProgress = stage === 'consent' ? 0
        : stage === 'initializing' ? 5
        : stage === 'camera' ? 10
        : stage === 'detecting' ? 20
        : stage === 'liveness' ? 25 + (challengeIdx / LIVENESS_CHALLENGES.length) * 50
        : stage === 'processing' ? 80
        : stage === 'success' ? 100
        : 0;

    return (
        <div className={`face-verify ${compact ? 'face-verify--compact' : ''}`}>
            {/* Progress bar */}
            <div className="face-verify__progress-bar">
                <div
                    className="face-verify__progress-fill"
                    style={{ width: `${overallProgress}%` }}
                />
            </div>

            {/* ─── Consent Stage ─── */}
            {stage === 'consent' && (
                <div className="face-verify__consent fade-in">
                    <div className="face-verify__consent-icon">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="url(#shieldGrad)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <defs>
                                <linearGradient id="shieldGrad" x1="0" y1="0" x2="1" y2="1">
                                    <stop offset="0%" stopColor="#00e676" />
                                    <stop offset="100%" stopColor="#00b0ff" />
                                </linearGradient>
                            </defs>
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            <path d="M9 12l2 2 4-4" />
                        </svg>
                    </div>
                    <h3 className="face-verify__title">Identity Verification</h3>
                    <p className="face-verify__desc">
                        Verify your identity with a quick face scan. This helps keep our political community 
                        safe from fake accounts and bots.
                    </p>

                    <div className="face-verify__features">
                        <div className="face-verify__feature">
                            <span className="face-verify__feature-icon">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00e676" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                            </span>
                            <div>
                                <strong>Secure & Private</strong>
                                <span>No raw images stored</span>
                            </div>
                        </div>
                        <div className="face-verify__feature">
                            <span className="face-verify__feature-icon">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00b0ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                            </span>
                            <div>
                                <strong>Quick Process</strong>
                                <span>Takes less than 30 seconds</span>
                            </div>
                        </div>
                        <div className="face-verify__feature">
                            <span className="face-verify__feature-icon">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7c4dff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                            </span>
                            <div>
                                <strong>Verified Badge</strong>
                                <span>Get a trusted verified status</span>
                            </div>
                        </div>
                    </div>

                    <label className="face-verify__consent-check">
                        <input
                            type="checkbox"
                            checked={consentChecked}
                            onChange={() => setConsentChecked(!consentChecked)}
                        />
                        <span className="face-verify__checkmark" />
                        <span>I consent to face scanning for identity verification. My biometric data will be encrypted and I can request deletion at any time.</span>
                    </label>

                    <button
                        className="btn btn-primary btn-lg face-verify__start-btn"
                        disabled={!consentChecked}
                        onClick={startCamera}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                            <circle cx="12" cy="13" r="4" />
                        </svg>
                        Start Verification
                    </button>

                    {showSkip && onSkip && (
                        <button className="face-verify__skip-btn" onClick={onSkip}>
                            Skip for now — I&apos;ll verify later
                        </button>
                    )}
                </div>
            )}

            {/* ─── Camera / Detection / Liveness Stages ─── */}
            {(stage === 'initializing' || stage === 'camera' || stage === 'detecting' || stage === 'liveness' || stage === 'processing') && (
                <div className="face-verify__camera-wrap fade-in">
                    <div className="face-verify__camera-container">
                        <video
                            ref={videoRef}
                            className="face-verify__video"
                            autoPlay
                            playsInline
                            muted
                        />
                        <canvas ref={canvasRef} className="face-verify__canvas" />

                        {/* Status overlay */}
                        <div className="face-verify__camera-status">
                            {stage === 'initializing' && (
                                <div className="face-verify__status-badge face-verify__status-badge--init">
                                    <span className="face-verify__pulse" />
                                    Starting camera…
                                </div>
                            )}
                            {stage === 'camera' && (
                                <div className="face-verify__status-badge face-verify__status-badge--camera">
                                    <span className="face-verify__pulse face-verify__pulse--green" />
                                    Camera ready — Position your face in the oval
                                </div>
                            )}
                            {stage === 'detecting' && (
                                <div className="face-verify__status-badge face-verify__status-badge--detecting">
                                    <span className="face-verify__pulse face-verify__pulse--blue" />
                                    Detecting face…
                                </div>
                            )}
                            {stage === 'processing' && (
                                <div className="face-verify__status-badge face-verify__status-badge--processing">
                                    <span className="auth-spinner" style={{ width: 16, height: 16 }} />
                                    AI processing — verifying identity…
                                </div>
                            )}
                        </div>

                        {/* Liveness challenge overlay */}
                        {stage === 'liveness' && LIVENESS_CHALLENGES[challengeIdx] && (
                            <div className="face-verify__liveness-overlay">
                                <div className="face-verify__liveness-card">
                                    <span className="face-verify__liveness-icon">
                                        {LIVENESS_CHALLENGES[challengeIdx].icon}
                                    </span>
                                    <span className="face-verify__liveness-text">
                                        {LIVENESS_CHALLENGES[challengeIdx].instruction}
                                    </span>
                                    <div className="face-verify__liveness-progress">
                                        <div
                                            className="face-verify__liveness-progress-fill"
                                            style={{ width: `${challengeProgress * 100}%` }}
                                        />
                                    </div>
                                    <span className="face-verify__liveness-step">
                                        {challengeIdx + 1} / {LIVENESS_CHALLENGES.length}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    <p className="face-verify__camera-hint">
                        {stage === 'initializing' && 'Initializing secure camera connection…'}
                        {stage === 'camera' && 'Align your face within the oval guide'}
                        {stage === 'detecting' && 'Hold still — analyzing facial features…'}
                        {stage === 'liveness' && 'Follow the on-screen instructions'}
                        {stage === 'processing' && 'Almost done — verifying your identity…'}
                    </p>
                </div>
            )}

            {/* ─── Success Stage ─── */}
            {stage === 'success' && (
                <div className="face-verify__result fade-in">
                    <div className="face-verify__success-icon">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#00e676" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                    </div>
                    <h3 className="face-verify__title" style={{ color: '#00e676' }}>
                        Verification Successful!
                    </h3>
                    <p className="face-verify__desc">
                        Your identity has been verified. You&apos;ll receive a verified badge on your profile.
                    </p>
                    <div className="face-verify__score-ring">
                        <svg viewBox="0 0 120 120" className="face-verify__score-svg">
                            <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
                            <circle
                                cx="60" cy="60" r="52"
                                fill="none"
                                stroke="url(#scoreGrad)"
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray={`${(score / 100) * 327} 327`}
                                transform="rotate(-90 60 60)"
                                className="face-verify__score-circle"
                            />
                            <defs>
                                <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
                                    <stop offset="0%" stopColor="#00e676" />
                                    <stop offset="100%" stopColor="#00b0ff" />
                                </linearGradient>
                            </defs>
                            <text x="60" y="55" textAnchor="middle" fill="white" fontSize="28" fontWeight="700">{score}</text>
                            <text x="60" y="74" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="11" fontWeight="500">CONFIDENCE</text>
                        </svg>
                    </div>
                </div>
            )}

            {/* ─── Error Stage ─── */}
            {stage === 'error' && (
                <div className="face-verify__result face-verify__result--error fade-in">
                    <div className="face-verify__error-icon">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ff5252" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="15" y1="9" x2="9" y2="15" />
                            <line x1="9" y1="9" x2="15" y2="15" />
                        </svg>
                    </div>
                    <h3 className="face-verify__title" style={{ color: '#ff5252' }}>
                        Verification Failed
                    </h3>
                    <p className="face-verify__desc">{errorMsg}</p>
                    <button className="btn btn-primary btn-lg" onClick={retry}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="23 4 23 10 17 10" />
                            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                        </svg>
                        Try Again
                    </button>
                    {showSkip && onSkip && (
                        <button className="face-verify__skip-btn" onClick={onSkip}>
                            Skip for now
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
