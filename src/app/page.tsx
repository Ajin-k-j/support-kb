'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import Loader from '@/components/Loader';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) return <div className="text-center py-5"><Loader /></div>;
  if (user) return null;

  return (
    <div className="min-vh-100 d-flex flex-column justify-content-center py-5 bg-gray-50 text-center">
      <div className="mx-auto w-100" style={{ maxWidth: '28rem' }}>
        <svg className="page-icon mx-auto text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <h2 className="mt-3 mb-4">Welcome to the Support Knowledge Base</h2>
        <p className="mb-4 text-gray-600">
          Log in or sign up to access your dashboard and manage support tickets.
        </p>
        <div className="d-flex justify-content-center gap-3">
          <Link href="/login" className="btn btn-primary btn-sm">Log In</Link>
          <Link href="/signup" className="btn btn-outline-secondary btn-sm">Sign Up</Link>
        </div>
      </div>
    </div>
  );
}