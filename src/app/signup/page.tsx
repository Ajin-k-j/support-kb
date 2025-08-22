'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/context/AuthContext';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Loader from '@/components/Loader';

const signupSchema = z.object({
  displayName: z.string().min(1, 'Display name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type SignupForm = z.infer<typeof signupSchema>;

export default function Signup() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) return <div className="text-center py-5"><Loader /></div>;
  if (user) return null;

  const onSubmit = async (data: SignupForm) => {
    try {
      setError(null);
      const { user } = await createUserWithEmailAndPassword(auth, data.email, data.password);
      await updateProfile(user, { displayName: data.displayName });
      router.push('/dashboard');
    } catch (err: any) {
      let friendlyMessage = 'An unexpected error occurred.';
      switch (err.code) {
        case 'auth/email-already-in-use':
          friendlyMessage = 'An account already exists with this email.';
          break;
        case 'auth/invalid-email':
          friendlyMessage = 'Please enter a valid email address.';
          break;
        case 'auth/weak-password':
          friendlyMessage = 'Password must be at least 6 characters.';
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
          <h2 className="mt-3">Create a new account</h2>
        </div>
        <div className="card p-4">
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleSubmit(onSubmit)} className="d-flex flex-column gap-3">
            <div>
              <input
                {...register('displayName')}
                className="form-control"
                placeholder="Display Name"
              />
              {errors.displayName && <div className="text-danger mt-1">{errors.displayName.message}</div>}
            </div>
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
            <button type="submit" className="btn btn-primary">Sign Up</button>
          </form>
          <p className="text-center mt-3 text-gray-600">
            Or <Link href="/login" className="text-primary">sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}