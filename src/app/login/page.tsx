'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/context/AuthContext';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Loader from '@/components/Loader';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
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