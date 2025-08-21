'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) return <div className="text-center py-5">Loading...</div>;
  if (user) return null;

  return (
    <div className="container text-center">
      <h2 className="mb-4">Welcome to the Support Knowledge Base</h2>
      <p className="mb-4">
        Log in or sign up to access your dashboard and manage support tickets.
      </p>
      <div className="d-flex justify-content-center gap-3">
        <Link href="/login" className="btn btn-primary">Log In</Link>
        <Link href="/signup" className="btn btn-outline-secondary">Sign Up</Link>
      </div>
    </div>
  );
}