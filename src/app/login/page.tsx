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

export default function Login() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  
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
      await signInWithEmailAndPassword(auth, data.email, data.password);
      router.push('/dashboard');
    } catch (err: any) {
      let friendlyMessage = 'An unexpected error occurred.';
      switch (err.code) {
        case 'auth/user-not-found':
          friendlyMessage = 'No account found with this email.';
          break;
        case 'auth/wrong-password':
          friendlyMessage = 'Incorrect password.';
          break;
        case 'auth/invalid-email':
          friendlyMessage = 'Please enter a valid email address.';
          break;
        default:
          friendlyMessage = err.message;
      }
      setError(friendlyMessage);
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
    <div className="min-vh-100 d-flex flex-column justify-content-center py-5 bg-gray-50">
      <div className="mx-auto w-100" style={{ maxWidth: '28rem' }}>
        <div className="text-center mb-4">
          <svg className="page-icon mx-auto text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <h2 className="mt-3">Sign in to your account</h2>
        </div>
        <div className="card p-4">
          {error && <div className="alert alert-danger">{error}</div>}
          
          <button 
            type="button" 
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            className="btn btn-outline-secondary w-100 mb-3 d-flex align-items-center justify-content-center gap-2"
          >
            {isGoogleLoading ? <Loader /> : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Sign in with Google
              </>
            )}
          </button>
          
          <div className="d-flex align-items-center mb-3">
            <hr className="flex-grow-1" />
            <span className="mx-2 text-muted small">or sign in with email</span>
            <hr className="flex-grow-1" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="d-flex flex-column gap-3">
            <div>
              <input
                {...register('email')}
                className="form-control"
                placeholder="Email address"
              />
              {errors.email && <div className="text-danger mt-1">{errors.email.message}</div>}
            </div>
            <div>
              <input
                {...register('password')}
                type="password"
                className="form-control"
                placeholder="Password"
              />
              {errors.password && <div className="text-danger mt-1">{errors.password.message}</div>}
            </div>
            <div className="d-flex justify-content-end">
              <Link href="/forgot-password" className="text-primary">Forgot your password?</Link>
            </div>
            <button type="submit" className="btn btn-primary">Sign In</button>
          </form>
          <p className="text-center mt-3 text-gray-600">
            Or <Link href="/signup" className="text-primary">create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}