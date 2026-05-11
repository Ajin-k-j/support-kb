'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/context/AuthContext';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Loader from '@/components/Loader';
import { UserData } from '@/types';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function Login() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'email' | 'google'>('email');

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) return <div className="text-center py-5"><Loader /></div>;
  if (user) return null;

  const onSubmit = async (data: LoginForm) => {
    try {
      setError(null);
      setIsEmailLoading(true);
      await signInWithEmailAndPassword(auth, data.email, data.password);
      router.push('/dashboard');
    } catch (err: any) {
      let friendlyMessage = 'An unexpected error occurred.';
      switch (err.code) {
        case 'auth/user-not-found': friendlyMessage = 'No account found with this email.'; break;
        case 'auth/wrong-password': friendlyMessage = 'Incorrect password.'; break;
        case 'auth/invalid-email': friendlyMessage = 'Please enter a valid email address.'; break;
        case 'auth/invalid-credential': friendlyMessage = 'Invalid email or password.'; break;
        default: friendlyMessage = err.message;
      }
      setError(friendlyMessage);
      setIsEmailLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      setIsGoogleLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        const newUserData: UserData = {
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName || 'User',
          email: firebaseUser.email || '',
          photoURL: firebaseUser.photoURL || '',
          isAdmin: false,
          role: null,
        };
        await setDoc(userRef, newUserData);
      }
      router.push('/dashboard');
    } catch (err: any) {
      setIsGoogleLoading(false);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Failed to sign in with Google');
      }
    }
  };

  return (
    <>
      <style>{`
        @keyframes authRise {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes blobDrift {
          0%, 100% { transform: translate(0,0) scale(1); }
          33%       { transform: translate(40px,-30px) scale(1.06); }
          66%       { transform: translate(-25px, 35px) scale(0.96); }
        }
        .auth-page-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f0f4ff;
          position: relative;
          overflow: hidden;
          padding: 2rem 1rem;
        }
        .auth-blob {
          position: fixed;
          border-radius: 50%;
          filter: blur(90px);
          pointer-events: none;
          animation: blobDrift 20s ease-in-out infinite;
        }
        .auth-blob-1 { width: 520px; height: 520px; background: rgba(79,70,229,0.12); top: -160px; left: -160px; animation-delay: 0s; }
        .auth-blob-2 { width: 420px; height: 420px; background: rgba(139,92,246,0.10); bottom: -120px; right: -120px; animation-delay: -8s; }
        .auth-blob-3 { width: 300px; height: 300px; background: rgba(99,102,241,0.08); top: 45%; left: 55%; animation-delay: -4s; }
        .auth-card {
          position: relative;
          width: 100%;
          max-width: 440px;
          background: #ffffff;
          border-radius: 24px;
          padding: 2.5rem;
          box-shadow: 0 4px 6px rgba(0,0,0,0.04), 0 24px 60px rgba(79,70,229,0.10), 0 0 0 1px rgba(79,70,229,0.06);
          animation: authRise 0.45s cubic-bezier(0.22,1,0.36,1) both;
        }
        .auth-logo-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 1.75rem;
        }
        .auth-logo-icon {
          width: 40px; height: 40px;
          background: linear-gradient(135deg, #4f46e5, #818cf8);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 14px rgba(79,70,229,0.30);
          flex-shrink: 0;
        }
        .auth-logo-name { font-size: 1rem; font-weight: 700; color: #1e1b4b; letter-spacing: -0.01em; }
        .auth-logo-sub  { font-size: 0.7rem; color: #6b7280; font-weight: 400; margin-top: 1px; }
        .auth-title { font-size: 1.45rem; font-weight: 800; color: #111827; letter-spacing: -0.025em; margin-bottom: 0.35rem; }
        .auth-sub   { font-size: 0.875rem; color: #6b7280; margin-bottom: 1.75rem; line-height: 1.5; }
        .auth-tabs {
          display: flex;
          background: #f3f4f6;
          border-radius: 12px;
          padding: 4px;
          gap: 4px;
          margin-bottom: 1.5rem;
        }
        .auth-tab {
          flex: 1; text-align: center; padding: 9px 0;
          font-size: 0.82rem; font-weight: 600;
          border-radius: 9px; cursor: pointer;
          transition: all 0.2s; color: #6b7280;
          border: none; background: transparent;
        }
        .auth-tab.active {
          background: #ffffff;
          color: #4f46e5;
          box-shadow: 0 1px 4px rgba(0,0,0,0.10);
        }
        .auth-form-group { margin-bottom: 1rem; }
        .auth-label { display: block; font-size: 0.78rem; font-weight: 600; color: #374151; margin-bottom: 6px; }
        .auth-input {
          width: 100%;
          background: #f9fafb;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          color: #111827;
          font-size: 0.9rem;
          font-family: 'Inter', sans-serif;
          padding: 11px 14px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          box-sizing: border-box;
        }
        .auth-input::placeholder { color: #9ca3af; }
        .auth-input:focus {
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79,70,229,0.12);
          background: #ffffff;
        }
        .auth-input.error-field { border-color: #ef4444; }
        .auth-field-error { font-size: 0.75rem; color: #ef4444; margin-top: 4px; }
        .auth-btn {
          width: 100%; padding: 12px;
          border: none; border-radius: 10px;
          font-family: 'Inter', sans-serif;
          font-size: 0.9rem; font-weight: 600;
          cursor: pointer; transition: all 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .auth-btn-primary {
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          color: #fff;
          box-shadow: 0 4px 14px rgba(79,70,229,0.30);
          margin-bottom: 0.5rem;
        }
        .auth-btn-primary:hover:not(:disabled) { filter: brightness(1.08); transform: translateY(-1px); box-shadow: 0 6px 20px rgba(79,70,229,0.35); }
        .auth-btn-primary:active { transform: translateY(0); }
        .auth-btn-primary:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }
        .auth-btn-google {
          background: #ffffff;
          border: 1.5px solid #e5e7eb;
          color: #374151;
          font-weight: 600;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
        }
        .auth-btn-google:hover:not(:disabled) { background: #f9fafb; border-color: #d1d5db; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
        .auth-btn-google:disabled { opacity: 0.65; cursor: not-allowed; }
        .auth-divider {
          display: flex; align-items: center; gap: 10px;
          color: #9ca3af; font-size: 0.75rem;
          margin: 1rem 0;
        }
        .auth-divider::before, .auth-divider::after {
          content: ''; flex: 1; height: 1px; background: #e5e7eb;
        }
        .auth-error {
          display: flex; align-items: flex-start; gap: 8px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          color: #b91c1c;
          font-size: 0.8rem;
          padding: 10px 12px;
          margin-bottom: 1rem;
          line-height: 1.4;
        }
        .auth-footer { margin-top: 1.25rem; font-size: 0.8rem; color: #6b7280; text-align: center; line-height: 1.5; }
        .auth-footer a { color: #4f46e5; text-decoration: none; font-weight: 600; }
        .auth-footer a:hover { text-decoration: underline; }
        .auth-forgot { display: flex; justify-content: flex-end; margin-bottom: 0.25rem; }
        .auth-forgot a { font-size: 0.78rem; color: #4f46e5; text-decoration: none; font-weight: 500; }
        .auth-forgot a:hover { text-decoration: underline; }
        .auth-badge {
          display: inline-flex; align-items: center; gap: 5px;
          background: rgba(79,70,229,0.08);
          border: 1px solid rgba(79,70,229,0.18);
          border-radius: 99px; padding: 3px 10px;
          font-size: 0.68rem; font-weight: 700;
          color: #4f46e5; letter-spacing: 0.05em;
          text-transform: uppercase; margin-bottom: 0.75rem;
        }
        .auth-badge-dot { width: 6px; height: 6px; background: #4f46e5; border-radius: 50%; }
      `}</style>

      <div className="auth-page-root">
        <div className="auth-blob auth-blob-1" />
        <div className="auth-blob auth-blob-2" />
        <div className="auth-blob auth-blob-3" />

        <div className="auth-card">
          <div className="auth-logo-row">
            <div className="auth-logo-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <div className="auth-logo-name">Support KB</div>
              <div className="auth-logo-sub">Intelligent Ticket Management</div>
            </div>
          </div>

          <div className="auth-badge">
            <span className="auth-badge-dot" />
            Secure Sign-In
          </div>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-sub">Sign in to your workspace to manage tickets and knowledge base.</p>

          <div className="auth-tabs">
            <button id="tab-email" className={`auth-tab${activeTab === 'email' ? ' active' : ''}`} onClick={() => { setActiveTab('email'); setError(null); }}>Email</button>
            <button id="tab-google" className={`auth-tab${activeTab === 'google' ? ' active' : ''}`} onClick={() => { setActiveTab('google'); setError(null); }}>Google</button>
          </div>

          {error && (
            <div className="auth-error">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          {activeTab === 'email' && (
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="auth-form-group">
                <label className="auth-label" htmlFor="login-email">Work Email</label>
                <input id="login-email" {...register('email')} type="email" className={`auth-input${errors.email ? ' error-field' : ''}`} placeholder="you@company.com" autoComplete="email" />
                {errors.email && <div className="auth-field-error">{errors.email.message}</div>}
              </div>
              <div className="auth-form-group">
                <label className="auth-label" htmlFor="login-password">Password</label>
                <input id="login-password" {...register('password')} type="password" className={`auth-input${errors.password ? ' error-field' : ''}`} placeholder="••••••••" autoComplete="current-password" />
                {errors.password && <div className="auth-field-error">{errors.password.message}</div>}
              </div>
              <div className="auth-forgot">
                <Link href="/forgot-password">Forgot password?</Link>
              </div>
              <button id="btn-email-login" type="submit" className="auth-btn auth-btn-primary" disabled={isEmailLoading}>
                {isEmailLoading ? <><Loader /><span>Signing in…</span></> : 'Sign In'}
              </button>
            </form>
          )}

          {activeTab === 'google' && (
            <div>
              <div className="auth-divider">Continue with your Google account</div>
              <button id="btn-google-login" type="button" className="auth-btn auth-btn-google" onClick={handleGoogleSignIn} disabled={isGoogleLoading}>
                {isGoogleLoading ? <><Loader /><span>Connecting…</span></> : <><GoogleIcon /><span>Continue with Google</span></>}
              </button>
            </div>
          )}

          <p className="auth-footer">
            Don&apos;t have an account? <Link href="/signup">Create one</Link>
          </p>
        </div>
      </div>
    </>
  );
}