'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/context/AuthContext';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Loader from '@/components/Loader';

const resetSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ResetForm = z.infer<typeof resetSchema>;

export default function ForgotPassword() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
  });

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) return <div className="text-center py-5"><Loader /></div>;
  if (user) return null;

  const onSubmit = async (data: ResetForm) => {
    try {
      setError(null);
      setSuccess(null);
      setIsSubmitting(true);
      await sendPasswordResetEmail(auth, data.email);
      setSuccess('Password reset link sent! Check your inbox.');
    } catch (err: any) {
      let friendlyMessage = 'An unexpected error occurred.';
      switch (err.code) {
        case 'auth/user-not-found': friendlyMessage = 'No account found with this email.'; break;
        case 'auth/invalid-email': friendlyMessage = 'Please enter a valid email address.'; break;
        default: friendlyMessage = err.message;
      }
      setError(friendlyMessage);
    } finally {
      setIsSubmitting(false);
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
          display: flex; align-items: center; justify-content: center;
          background: #f0f4ff; position: relative; overflow: hidden; padding: 2rem 1rem;
        }
        .auth-blob { position: fixed; border-radius: 50%; filter: blur(90px); pointer-events: none; animation: blobDrift 20s ease-in-out infinite; }
        .auth-blob-1 { width: 520px; height: 520px; background: rgba(79,70,229,0.12); top: -160px; left: -160px; animation-delay: 0s; }
        .auth-blob-2 { width: 420px; height: 420px; background: rgba(139,92,246,0.10); bottom: -120px; right: -120px; animation-delay: -8s; }
        .auth-blob-3 { width: 300px; height: 300px; background: rgba(99,102,241,0.08); top: 45%; left: 55%; animation-delay: -4s; }
        .auth-card {
          position: relative; width: 100%; max-width: 440px;
          background: #ffffff; border-radius: 24px; padding: 2.5rem;
          box-shadow: 0 4px 6px rgba(0,0,0,0.04), 0 24px 60px rgba(79,70,229,0.10), 0 0 0 1px rgba(79,70,229,0.06);
          animation: authRise 0.45s cubic-bezier(0.22,1,0.36,1) both;
        }
        .auth-logo-row { display: flex; align-items: center; gap: 10px; margin-bottom: 1.75rem; }
        .auth-logo-icon {
          width: 40px; height: 40px;
          background: linear-gradient(135deg, #4f46e5, #818cf8);
          border-radius: 12px; display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 14px rgba(79,70,229,0.30); flex-shrink: 0;
        }
        .auth-logo-name { font-size: 1rem; font-weight: 700; color: #1e1b4b; letter-spacing: -0.01em; }
        .auth-logo-sub  { font-size: 0.7rem; color: #6b7280; font-weight: 400; margin-top: 1px; }
        .auth-icon-wrap {
          width: 56px; height: 56px; background: rgba(79,70,229,0.08); border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 1.25rem;
        }
        .auth-title { font-size: 1.45rem; font-weight: 800; color: #111827; letter-spacing: -0.025em; margin-bottom: 0.35rem; }
        .auth-sub   { font-size: 0.875rem; color: #6b7280; margin-bottom: 1.75rem; line-height: 1.5; }
        .auth-form-group { margin-bottom: 1rem; }
        .auth-label { display: block; font-size: 0.78rem; font-weight: 600; color: #374151; margin-bottom: 6px; }
        .auth-input {
          width: 100%; background: #f9fafb; border: 1.5px solid #e5e7eb;
          border-radius: 10px; color: #111827; font-size: 0.9rem;
          font-family: 'Inter', sans-serif; padding: 11px 14px;
          outline: none; transition: border-color 0.2s, box-shadow 0.2s, background 0.2s; box-sizing: border-box;
        }
        .auth-input::placeholder { color: #9ca3af; }
        .auth-input:focus { border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79,70,229,0.12); background: #ffffff; }
        .auth-input.error-field { border-color: #ef4444; }
        .auth-field-error { font-size: 0.75rem; color: #ef4444; margin-top: 4px; }
        .auth-btn {
          width: 100%; padding: 12px; border: none; border-radius: 10px;
          font-family: 'Inter', sans-serif; font-size: 0.9rem; font-weight: 600;
          cursor: pointer; transition: all 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .auth-btn-primary {
          background: linear-gradient(135deg, #4f46e5, #6366f1); color: #fff;
          box-shadow: 0 4px 14px rgba(79,70,229,0.30);
        }
        .auth-btn-primary:hover:not(:disabled) { filter: brightness(1.08); transform: translateY(-1px); }
        .auth-btn-primary:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }
        .auth-error {
          display: flex; align-items: flex-start; gap: 8px;
          background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px;
          color: #b91c1c; font-size: 0.8rem; padding: 10px 12px; margin-bottom: 1rem; line-height: 1.4;
        }
        .auth-success {
          display: flex; align-items: flex-start; gap: 8px;
          background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px;
          color: #15803d; font-size: 0.8rem; padding: 10px 12px; margin-bottom: 1rem; line-height: 1.4;
        }
        .auth-footer { margin-top: 1.25rem; font-size: 0.8rem; color: #6b7280; text-align: center; line-height: 1.5; }
        .auth-footer a { color: #4f46e5; text-decoration: none; font-weight: 600; }
        .auth-footer a:hover { text-decoration: underline; }
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

          <div className="auth-icon-wrap">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>

          <h1 className="auth-title">Reset your password</h1>
          <p className="auth-sub">Enter your work email and we&apos;ll send a link to reset your password.</p>

          {error && (
            <div className="auth-error">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}
          {success && (
            <div className="auth-success">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="auth-form-group">
              <label className="auth-label" htmlFor="reset-email">Work Email</label>
              <input id="reset-email" {...register('email')} type="email" className={`auth-input${errors.email ? ' error-field' : ''}`} placeholder="you@company.com" autoComplete="email" />
              {errors.email && <div className="auth-field-error">{errors.email.message}</div>}
            </div>
            <button id="btn-send-reset" type="submit" className="auth-btn auth-btn-primary" disabled={isSubmitting || !!success}>
              {isSubmitting ? <><Loader /><span>Sending…</span></> : 'Send Reset Link'}
            </button>
          </form>

          <p className="auth-footer">
            Remembered it? <Link href="/login">Back to sign in</Link>
          </p>
        </div>
      </div>
    </>
  );
}